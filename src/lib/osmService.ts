/**
 * Serviço de busca de empresas reais via Geoapify (Places API + Geocoding).
 *
 * Fluxo:
 * 1. Geocodificar município via Geoapify Geocoding API para obter lat/lon.
 * 2. Buscar POIs (Places) ao redor da coordenada, filtrados por categoria.
 *
 * Atribuição: Dados © OpenStreetMap contributors (ODbL) — Geoapify usa dados OSM.
 *
 * IMPORTANTE SOBRE LIMITES:
 * - O limite de 10 pesquisas/dia é LOCAL (localStorage no navegador). É apenas uma
 *   salvaguarda de UX, NÃO é proteção de segurança. Pode ser contornado pelo usuário
 *   (limpando localStorage, usando outro navegador, etc.).
 * - Limites confiáveis por conta exigem backend/proxy com controle de uso.
 * - A chave de API deve ser restringida por domínio no painel do Geoapify.
 */

import type { Lead, Category, DigitalPresence } from '@/types';

// --- Tipos públicos ---

export interface SearchCompaniesParams {
  country: string;
  state: string;
  city: string;
  category: Category | '';
  limit: number;
  offset?: number;
}

  export interface SearchCompaniesResult {
  leads: Lead[];
  queryDate: string;
  areaName: string;
  nextOffset: number | null;
}

export type SearchError =
  | { type: 'rate_limit_local'; message: string; remaining: number }
  | { type: 'rate_limit'; message: string }
  | { type: 'server_error'; message: string; status: number }
  | { type: 'network'; message: string }
  | { type: 'not_found'; message: string }
  | { type: 'config_pending'; message: string }
  | { type: 'config_invalid'; message: string };

export interface SearchStatus {
  remaining: number;
  max: number;
}

// --- Configuração ---

const GEOAPIFY_GEOCODE_URL = 'https://api.geoapify.com/v1/geocode/search';
const GEOAPIFY_PLACES_URL = 'https://api.geoapify.com/v2/places';
const TIMEOUT_MS = 30000;

const MAX_DAILY_SEARCHES = 10;
const LS_KEY = 'leadforge:geoapify_daily';

interface DailyUsage {
  date: string;
  count: number;
}

function getApiKey(): string | undefined {
  return import.meta.env.VITE_GEOAPIFY_API_KEY as string | undefined;
}

export function isConfigured(): boolean {
  const key = getApiKey();
  return !!key && key.length > 10;
}

/**
 * Retorna quantas pesquisas restam hoje e o limite máximo.
 * O limite é LOCAL e pode ser contornado — não é proteção real.
 */
export function getDailySearchStatus(): SearchStatus {
  const usage = readDailyUsage();
  const used = usage.count;
  return {
    remaining: Math.max(0, MAX_DAILY_SEARCHES - used),
    max: MAX_DAILY_SEARCHES,
  };
}

function readDailyUsage(): DailyUsage {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { date: todayKey(), count: 0 };
    const parsed = JSON.parse(raw) as DailyUsage;
    if (parsed.date !== todayKey()) return { date: todayKey(), count: 0 };
    return parsed;
  } catch {
    return { date: todayKey(), count: 0 };
  }
}

function writeDailyUsage(count: number) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ date: todayKey(), count }));
  } catch {
    // localStorage indisponível (modo privado, etc.) — segue sem limite
  }
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function todayStr(): string {
  return new Date().toLocaleDateString('pt-BR');
}

/**
 * Incrementa o contador de pesquisas do dia. Só deve ser chamado
 * ANTES de fazer a requisição HTTP, para evitar contar erros.
 * Retorna o novo total de pesquisas usadas.
 */
function incrementDailyUsage(): number {
  const usage = readDailyUsage();
  const newCount = usage.count + 1;
  writeDailyUsage(newCount);
  return newCount;
}

// --- Mapeamento de categorias LeadForge -> categorias Geoapify ---

const CATEGORY_GEOAPIFY: Record<Category, string[]> = {
  'Alimentação': [
    'catering.restaurant',
    'catering.cafe',
    'catering.fast_food',
    'catering.bar',
    'catering.pub',
    'commercial.food_and_drink.bakery',
  ],
  'Moda e acessórios': [
    'commercial.clothing',
    'commercial.clothing.accessories',
    'commercial.clothing.shoes',
    'commercial.jewelry',
    'commercial.bag',
  ],
  'Casa e decoração': [
    'commercial.furniture_and_interior',
    'commercial.houseware_and_hardware',
    'commercial.garden',
  ],
  'Serviços profissionais': [
    'office',
  ],
  'Comércio e lojas virtuais': [
    'commercial',
  ],
  'Criadores de conteúdo': [
    'commercial.hobby.photo',
    'commercial.video_and_music',
  ],
  'Tecnologia': [
    'commercial.elektronics',
    'office.it',
  ],
  'Outros negócios': [
    'commercial',
  ],
};

// --- Cache em memória ---

interface CacheEntry {
  data: SearchCompaniesResult;
  timestamp: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

  function cacheKey(params: SearchCompaniesParams): string {
  return `${params.country}|${params.state}|${params.city}|${params.category}|${params.limit}|${params.offset ?? 0}`;
  }

/** Verifica se há resultado em cache válido para os parâmetros. */
export function getCachedResult(params: SearchCompaniesParams): SearchCompaniesResult | null {
  const key = cacheKey(params);
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  return null;
}

/** Limpa todo o cache (útil para testes). */
export function clearCache(): void {
  cache.clear();
  geocodeCache.clear();
}

/** Reseta o contador diário (útil para testes). */
export function resetDailyUsage(): void {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    // ignore
  }
}

// --- Funções de transformação ---

function geoapifyCategoryToLead(categories: string[]): Category {
  const flat = categories.join(' ');
  if (flat.includes('catering')) return 'Alimentação';
  if (['commercial.clothes', 'commercial.shoes', 'commercial.jewelry', 'commercial.bag'].some((c) => flat.includes(c))) return 'Moda e acessórios';
  if (['commercial.furniture', 'commercial.hardware', 'commercial.garden_centre'].some((c) => flat.includes(c))) return 'Casa e decoração';
  if (['office.lawyer', 'office.accountant', 'office.architect', 'office.company', 'office.insurance'].some((c) => flat.includes(c))) return 'Serviços profissionais';
  if (['commercial.electronics', 'commercial.computer', 'commercial.mobile_phone', 'commercial.books', 'commercial.shop'].some((c) => flat.includes(c))) return 'Comércio e lojas virtuais';
  if (['commercial.photo', 'commercial.video', 'commercial.music'].some((c) => flat.includes(c))) return 'Criadores de conteúdo';
  if (['office.it', 'office.telecommunication'].some((c) => flat.includes(c))) return 'Tecnologia';
  return 'Outros negócios';
}

function inferDigitalPresenceFromProps(props: Record<string, unknown>): DigitalPresence[] {
  const arr: DigitalPresence[] = [];
  if (props.website || props.url) arr.push('site');
  if (props.phone || props['phone:whatsapp'] || props['contact:whatsapp']) arr.push('whatsapp');
  if (props['contact:instagram'] || props.instagram) arr.push('instagram');
  if (props['contact:youtube'] || props.youtube) arr.push('youtube');
  if (props['contact:tiktok'] || props.tiktok) arr.push('tiktok');
  return arr.length ? arr : ['nenhuma'];
}

function getWebsite(props: Record<string, unknown>): string | undefined {
  const raw = (props.website as string) || (props.url as string) || undefined;
  if (!raw) return undefined;
  if (raw.startsWith('http')) return raw;
  return `https://${raw}`;
}

function getWhatsapp(props: Record<string, unknown>): string | undefined {
  const raw = (props['phone:whatsapp'] as string) || (props['contact:whatsapp'] as string) || (props.phone as string);
  if (!raw) return undefined;
  const digits = raw.replace(/\D/g, '');
  return digits.length >= 10 ? digits : undefined;
}

function buildSlug(name: string, id: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const idSlug = id.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${slug}-${idSlug}`;
}

function buildSourceUrl(osmId: string | undefined): string | undefined {
  if (!osmId) return undefined;
  return `https://www.openstreetmap.org/${osmId}`;
}

//** Transforma um feature do Geoapify Places em um Lead. */

    function getStateUF(stateName?: string): Lead['state'] {
  if (!stateName) return undefined;

  const normalized = stateName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  const states: Record<string, Lead['state']> = {
    acre: 'AC',
    alagoas: 'AL',
    amapa: 'AP',
    amazonas: 'AM',
    bahia: 'BA',
    ceara: 'CE',
    'distrito federal': 'DF',
    'espirito santo': 'ES',
    goias: 'GO',
    maranhao: 'MA',
    'mato grosso': 'MT',
    'mato grosso do sul': 'MS',
    'minas gerais': 'MG',
    para: 'PA',
    paraiba: 'PB',
    parana: 'PR',
    pernambuco: 'PE',
    piaui: 'PI',
    'rio de janeiro': 'RJ',
    'rio grande do norte': 'RN',
    'rio grande do sul': 'RS',
    rondonia: 'RO',
    roraima: 'RR',
    'santa catarina': 'SC',
    'sao paulo': 'SP',
    sergipe: 'SE',
    tocantins: 'TO',
  };

  return states[normalized];
}

export function transformGeoapifyPlace(
  feature: {
    properties: {
      name?: string;
      categories?: string[];
      lat?: number;
      lon?: number;
      city?: string;
      state?: string;
      country?: string;
      formatted?: string;
      address_line1?: string;
      address_line2?: string;
      datasource?: {
        raw_object?: Record<string, string>;
        osm_id?: string;
      };
      website?: string;
      url?: string;
      phone?: string;
      [key: string]: unknown;
    };
    geometry?: { coordinates?: [number, number] | number[] };
  },
  areaName: string,
  queryDate: string,
): Lead | null {
  const props = feature.properties;
  const name = props.name;

  // Sem nome, não criamos um lead.
  if (!name) {
    console.log(
  'Registro Geoapify completo:',
  JSON.stringify(feature.properties, null, 2)
);
    return null;
  }

  const lat = props.lat ?? feature.geometry?.coordinates?.[1];
  const lon = props.lon ?? feature.geometry?.coordinates?.[0];

  const coordinates =
    lat != null && lon != null
      ? { lat, lng: lon }
      : undefined;

  const categories = props.categories ?? [];
  const raw = props.datasource?.raw_object ?? {};

  const allProps: Record<string, unknown> = {
    ...raw,
    ...props,
  };

  const website = getWebsite(allProps);
  const whatsapp = getWhatsapp(allProps);
  const digitalPresence = inferDigitalPresenceFromProps(allProps);

  let presenceType: Lead['presenceType'] = 'fisico';

  if (!coordinates) {
    presenceType = 'online';
  } else if (website) {
    presenceType = 'ambos';
  }

  const city = props.city || areaName;
  const addrLine1 = props.address_line1 ?? '';
  const addrLine2 = props.address_line2 ?? '';

  const summary =
    [addrLine1, addrLine2].filter(Boolean).join(', ') ||
    categories.join(', ') ||
    'Empresa';

  const sourceId = props.datasource?.osm_id;

  const leadId = sourceId
    ? `osm-${sourceId.replace('/', '-')}`
    : `geo-${buildSlug(name, areaName)}`;

  return {
    id: leadId,
    slug: buildSlug(name, sourceId ?? areaName),
    name,
    category: geoapifyCategoryToLead(categories),
    profileType: 'empresa',
    description: addrLine1 || summary,
    longDescription: undefined,
    city,
    state: getStateUF(props.state),
    presenceType,
    coordinates,
    website,
    whatsapp,
    socialLinks: [],
    image: '',
    summary,
    isDemo: false,
    source: 'OpenStreetMap (via Geoapify)',
    verifiedAt: queryDate,
    digitalPresence,
    opportunityScore: 0,
    stage: 'novo',
    notes: '',
    activities: [
      {
        id: `${leadId}-a1`,
        date: queryDate,
        type: 'criacao',
        description: `Lead importado via Geoapify (município: ${areaName}).`,
      },
    ],
    saved: false,
    sourceId,
    sourceUrl: buildSourceUrl(sourceId),
  };
}

/** Deduplica por sourceId, ou por nome+coordenadas normalizadas como fallback. */
export function deduplicateLeads(leads: Lead[]): Lead[] {
  const seen = new Set<string>();
  const result: Lead[] = [];
  for (const lead of leads) {
    const key = lead.sourceId
      ? lead.sourceId
      : `${lead.name.toLowerCase().trim()}|${Math.round((lead.coordinates?.lat ?? 0) * 1000)}|${Math.round((lead.coordinates?.lng ?? 0) * 1000)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(lead);
  }
  return result;
}

/** Verifica se um lead da busca já existe na lista de leads atuais. */
export function isLeadDuplicate(lead: Lead, existingLeads: Lead[]): boolean {
  if (lead.sourceId) {
    return existingLeads.some((l) => l.sourceId === lead.sourceId);
  }
  const normName = lead.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  return existingLeads.some((l) => {
    const existingNorm = l.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    return existingNorm === normName && l.city === lead.city;
  });
}

// --- Funções internas de API ---

interface GeoapifyGeocodeResult {
  results: Array<{
    lat: number;
    lon: number;
    formatted: string;
    city?: string;
  }>;
}

// Cache de geocodificação — reutilizado entre buscas da mesma cidade
const geocodeCache = new Map<string, { lat: number; lon: number; areaName: string; timestamp: number }>();
const GEOCODE_TTL_MS = 30 * 60 * 1000; // 30 min

  async function geocodeCity(
  apiKey: string,
  country: string,
  state: string,
  city: string,
  signal: AbortSignal,
): Promise<{ areaName: string; lat: number; lon: number }> {
  const geocodeKey = `${country}|${state}|${city}`;
  const cached = geocodeCache.get(geocodeKey);
  if (cached && Date.now() - cached.timestamp < GEOCODE_TTL_MS) {
    return { areaName: cached.areaName, lat: cached.lat, lon: cached.lon };
  }

  const q = `${city}, ${state}, ${country}`;
  const url = `${GEOAPIFY_GEOCODE_URL}?text=${encodeURIComponent(q)}&format=json&limit=1&apiKey=${apiKey}`;

  const resp = await fetch(url, { signal });

  if (resp.status === 429) {
    throw { type: 'rate_limit' as const, message: 'Geoapify: limite de requisições atingido (HTTP 429). Tente novamente mais tarde.' };
  }
  if (resp.status === 403) {
    throw { type: 'config_invalid' as const, message: 'Geoapify: chave de API rejeitada (HTTP 403). Verifique se a chave é válida e se o domínio está autorizado.' };
  }
  if (resp.status >= 500) {
    throw { type: 'server_error' as const, message: `Geoapify Geocoding: erro do servidor (${resp.status}).`, status: resp.status };
  }
  if (!resp.ok) {
    throw { type: 'server_error' as const, message: `Geoapify Geocoding: HTTP ${resp.status}.`, status: resp.status };
  }

  const data = (await resp.json()) as GeoapifyGeocodeResult;
  if (!data.results || !data.results.length) {
    throw { type: 'not_found' as const, message: `Município "${city}" não encontrado na geocodificação.` };
  }

  const r = data.results[0];
  const result = { areaName: r.city || city, lat: r.lat, lon: r.lon };
  console.log('Geoapify geocodificação:', result);
  geocodeCache.set(geocodeKey, { ...result, timestamp: Date.now() });
  return result;
}

function buildPlacesUrl(
  apiKey: string,
  lat: number,
  lon: number,
  category: Category | '',
  limit: number,
  offset = 0,
): string {
  let categoriesParam: string;

  if (category) {
    categoriesParam = CATEGORY_GEOAPIFY[category].join(',');
  } else {
    categoriesParam = Object.values(CATEGORY_GEOAPIFY).flat().join(',');
  }

  const radius = 15000;
  const conditions = `circle:${lon},${lat},${radius}`;

  const params = new URLSearchParams({
    categories: categoriesParam,
    filter: conditions,
    limit: String(limit),
    offset: String(offset),
    apiKey,
  });

  return `${GEOAPIFY_PLACES_URL}?${params.toString()}`;
}

interface GeoapifyPlacesResult {
  features: Array<{
    properties: {
      name?: string;
      categories?: string[];
      lat?: number;
      lon?: number;
      city?: string;
      address_line1?: string;
      address_line2?: string;
      datasource?: { raw_object?: Record<string, string>; osm_id?: string };
      website?: string;
      url?: string;
      phone?: string;
      [key: string]: unknown;
    };
    geometry?: { coordinates?: [number, number] | number[] };
  }>;
}

/**
 * Busca empresas reais via Geoapify.
 * Retorna resultados brutos para prévia — NÃO adiciona aos leads automaticamente.
 *
 * Não conta pesquisas inválidas (sem cidade, sem chave) nem cache hits.
 */
export async function searchCompanies(
  params: SearchCompaniesParams,
  signal?: AbortSignal,
): Promise<{ results: SearchCompaniesResult; error?: undefined } | { error: SearchError; results?: undefined }> {
  // Validação de entrada — não consome limite nem chama API
  if (!params.city.trim()) {
    return {
      error: {
        type: 'not_found',
        message: 'Informe o nome de um município para buscar.',
      },
    };
  }

  // Verificação de chave — não consome limite
  const apiKey = getApiKey();
  if (!apiKey || apiKey.length < 10) {
    return {
      error: {
        type: 'config_pending',
        message: 'Chave da API Geoapify não configurada. Adicione VITE_GEOAPIFY_API_KEY no ambiente do projeto.',
      },
    };
  }

  // Verificação de cache — não consome limite
  const key = cacheKey(params);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { results: cached.data };
  }

  // Verificação de limite diário local — antes de chamar a API
  const usage = readDailyUsage();
  if (usage.count >= MAX_DAILY_SEARCHES) {
    return {
      error: {
        type: 'rate_limit_local',
        message: `Limite local de ${MAX_DAILY_SEARCHES} pesquisas/dia atingido (${todayStr()}). Este limite é local ao navegador e pode ser contornado.`,
        remaining: 0,
      },
    };
  }

  // Incrementa contador ANTES da requisição HTTP
  incrementDailyUsage();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  const ourSignal = controller.signal;

  try {
    // Etapa 1: Geocodificar município (usa cache se disponível)
    const area = await geocodeCity(apiKey, params.country, params.state, params.city, ourSignal);

    // Etapa 2: Buscar POIs
    const placesUrl = buildPlacesUrl(
    apiKey,
    area.lat,
    area.lon,
    params.category,
    params.limit,
    params.offset ?? 0,
);
    const queryDate = new Date().toISOString();

    const resp = await fetch(placesUrl, { signal: ourSignal });

    if (resp.status === 429) {
      return {
        error: {
          type: 'rate_limit',
          message: 'Geoapify: limite de requisições da API atingido (HTTP 429). O plano gratuito permite 3.000/dia.',
        },
      };
    }
    if (resp.status === 403) {
      return {
        error: {
          type: 'config_invalid',
          message: 'Geoapify: chave de API rejeitada (HTTP 403). Verifique se a chave é válida e se este domínio está autorizado no painel do Geoapify.',
        },
      };
    }
    if (resp.status >= 500) {
      return {
        error: {
          type: 'server_error',
          message: `Geoapify Places: erro do servidor (HTTP ${resp.status}). Tente novamente em instantes.`,
          status: resp.status,
        },
      };
    }
   if (!resp.ok) {
    const details = await resp.text();

    return {
    error: {
      type: 'server_error',
      message: `Geoapify Places: HTTP ${resp.status} — ${details}`,
      status: resp.status,
    },
  };
}

    const data = (await resp.json()) as GeoapifyPlacesResult;
    const features = data.features ?? [];
    console.log('Total bruto da Geoapify:', features.length);
  console.log('Limite solicitado:', params.limit);
  console.log('Categoria selecionada:', params.category || 'Todos os nichos');

    const leadsTransformados = features.map((f) =>
    transformGeoapifyPlace(f, area.areaName, queryDate)
  );

  console.log(
  'Resultados descartados na transformação:',
  leadsTransformados.filter((l) => l === null).length
  );

  const leads: Lead[] = leadsTransformados.filter(
  (l): l is Lead => l !== null
  );

console.log('Leads válidos após transformação:', leads.length);

    const deduped = deduplicateLeads(leads);
    console.log('Leads após deduplicação:', deduped.length);

    const result: SearchCompaniesResult = {
    leads: deduped,
    queryDate,
    areaName: area.areaName,
    nextOffset:
    features.length === params.limit
      ? (params.offset ?? 0) + features.length
      : null,
};

    cache.set(key, { data: result, timestamp: Date.now() });

    return { results: result };
  } catch (err: unknown) {
    const error = (
      typeof err === 'object' && err !== null ? err : {}
    ) as {
      name?: string;
      type?: string;
      message?: string;
      status?: number;
    };

    if (error.name === 'AbortError') {
      return {
        error: {
          type: 'network',
          message: 'Busca cancelada ou tempo limite excedido (30s).',
        },
      };
    }

    if (error.type === 'rate_limit') {
      return {
        error: {
          type: 'rate_limit',
          message: error.message ?? 'Limite de requisições atingido.',
        },
      };
    }

    if (error.type === 'config_invalid') {
      return {
        error: {
          type: 'config_invalid',
          message: error.message ?? 'Chave de API inválida.',
        },
      };
    }

    if (error.type === 'not_found') {
      return {
        error: {
          type: 'not_found',
          message: error.message ?? 'Município não encontrado.',
        },
      };
    }

    if (error.type === 'server_error') {
      return {
        error: {
          type: 'server_error',
          message: error.message ?? 'Erro do servidor.',
          status: error.status ?? 500,
        },
      };
    }

    return {
      error: {
        type: 'network',
        message: `Erro de conexão: ${error.message ?? 'desconhecido'}`,
      },
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
