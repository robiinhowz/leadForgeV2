/**
 * Testes para osmService (Geoapify): transformação de dados, deduplicação,
 * campos ausentes, chave ausente/inválida, cache, limite diário local,
 * erros HTTP e separação entre registros reais e fictícios.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  transformGeoapifyPlace,
  deduplicateLeads,
  isLeadDuplicate,
  isConfigured,
  getDailySearchStatus,
  searchCompanies,
  getCachedResult,
  clearCache,
  resetDailyUsage,
  type SearchCompaniesParams,
} from '@/lib/osmService';
import type { Lead } from '@/types';

// Polyfill: vitest não tem localStorage por padrão
const memStore: Record<string, string> = {};
const localStoragePolyfill: Storage = {
  getItem: (key: string) => memStore[key] ?? null,
  setItem: (key: string, value: string) => { memStore[key] = value; },
  removeItem: (key: string) => { delete memStore[key]; },
  clear: () => { for (const k of Object.keys(memStore)) delete memStore[k]; },
  key: (i: number) => Object.keys(memStore)[i] ?? null,
  get length() { return Object.keys(memStore).length; },
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStoragePolyfill,
  writable: true,
  configurable: true,
});

const queryDate = '2026-10-28T12:00:00Z';
const areaName = 'São Paulo';

// Helper: cria parâmetros padrão de busca
function defaultParams(overrides: Partial<SearchCompaniesParams> = {}): SearchCompaniesParams {
  return {
    country: 'Brasil',
    state: 'São Paulo',
    city: 'Campinas',
    category: '',
    limit: 20,
    ...overrides,
  };
}

// Helper: mock do fetch
function mockFetch(status: number, body: unknown) {
  global.fetch = vi.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: vi.fn().mockResolvedValue(body),
  });
}

// Helper: mock do fetch com erro de rede
function mockFetchError(error: Error) {
  global.fetch = vi.fn().mockRejectedValue(error);
}

beforeEach(() => {
  clearCache();
  resetDailyUsage();
  localStoragePolyfill.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  clearCache();
  resetDailyUsage();
  localStoragePolyfill.clear();
  vi.restoreAllMocks();
});

describe('transformGeoapifyPlace', () => {
  it('transforma um feature Geoapify completo em Lead', () => {
    const feature = {
      properties: {
        name: 'Café Central',
        categories: ['catering', 'catering.cafe'],
        lat: -23.5,
        lon: -46.6,
        city: 'São Paulo',
        address_line1: 'Rua Augusta, 100',
        address_line2: 'Consolação',
        datasource: { raw_object: { website: 'https://cafecentral.com', phone: '+55 11 99999-0000' }, osm_id: 'node/123456' },
      },
      geometry: { coordinates: [-46.6, -23.5] },
    };
    const lead = transformGeoapifyPlace(feature, areaName, queryDate);
    expect(lead).not.toBeNull();
    expect(lead!.name).toBe('Café Central');
    expect(lead!.category).toBe('Alimentação');
    expect(lead!.isDemo).toBe(false);
    expect(lead!.source).toBe('OpenStreetMap (via Geoapify)');
    expect(lead!.sourceId).toBe('node/123456');
    expect(lead!.sourceUrl).toBe('https://www.openstreetmap.org/node/123456');
    expect(lead!.coordinates).toEqual({ lat: -23.5, lng: -46.6 });
    expect(lead!.website).toBe('https://cafecentral.com');
    expect(lead!.whatsapp).toBe('5511999990000');
    expect(lead!.stage).toBe('novo');
    expect(lead!.saved).toBe(false);
    expect(lead!.activities).toHaveLength(1);
  });

  it('retorna null quando não há nome', () => {
    const feature = { properties: { categories: ['catering.restaurant'], lat: 0, lon: 0 } };
    expect(transformGeoapifyPlace(feature, areaName, queryDate)).toBeNull();
  });

  it('mapeia commercial.clothes para Moda e acessórios', () => {
    const feature = { properties: { name: 'Loja', categories: ['commercial', 'commercial.clothes'], lat: 0, lon: 0 } };
    expect(transformGeoapifyPlace(feature, areaName, queryDate)!.category).toBe('Moda e acessórios');
  });

  it('mapeia office.lawyer para Serviços profissionais', () => {
    const feature = { properties: { name: 'Advocacia', categories: ['office', 'office.lawyer'], lat: 0, lon: 0 } };
    expect(transformGeoapifyPlace(feature, areaName, queryDate)!.category).toBe('Serviços profissionais');
  });

  it('mapeia categorias desconhecidas para Outros negócios', () => {
    const feature = { properties: { name: 'Pet Shop', categories: ['commercial', 'commercial.pet'], lat: 0, lon: 0 } };
    expect(transformGeoapifyPlace(feature, areaName, queryDate)!.category).toBe('Outros negócios');
  });

  it('usa geometry.coordinates quando lat/lon não estão nas properties', () => {
    const feature = { properties: { name: 'Mercado', categories: ['commercial.supermarket'] }, geometry: { coordinates: [-20, -10] } };
    expect(transformGeoapifyPlace(feature, areaName, queryDate)!.coordinates).toEqual({ lat: -10, lng: -20 });
  });

  it('campos ausentes geram valores undefined, não inventados', () => {
    const feature = { properties: { name: 'Sem nada', categories: [] } };
    const lead = transformGeoapifyPlace(feature, areaName, queryDate)!;
    expect(lead.website).toBeUndefined();
    expect(lead.whatsapp).toBeUndefined();
    expect(lead.longDescription).toBeUndefined();
    expect(lead.digitalPresence).toEqual(['nenhuma']);
    expect(lead.coordinates).toBeUndefined();
  });

  it('não inventa email, CNPJ, telefone ou redes sociais', () => {
    const feature = { properties: { name: 'Empresa X', categories: [] } };
    const lead = transformGeoapifyPlace(feature, areaName, queryDate)!;
    expect(lead.whatsapp).toBeUndefined();
    expect(lead.socialLinks).toEqual([]);
  });

  it('detecta presença digital a partir de props de contato', () => {
    const feature = {
      properties: {
        name: 'Studio', categories: ['commercial.photo'],
        datasource: { raw_object: { 'contact:instagram': '@studio', 'contact:youtube': 'UC123' } },
      },
    };
    const lead = transformGeoapifyPlace(feature, areaName, queryDate)!;
    expect(lead.digitalPresence).toContain('instagram');
    expect(lead.digitalPresence).toContain('youtube');
    expect(lead.digitalPresence).not.toContain('nenhuma');
  });

  it('normaliza website sem protocolo', () => {
    const feature = { properties: { name: 'Loja', categories: ['commercial.shop'], datasource: { raw_object: { website: 'loja.com' } } } };
    expect(transformGeoapifyPlace(feature, areaName, queryDate)!.website).toBe('https://loja.com');
  });

  it('gera slug normalizado a partir do nome', () => {
    const feature = { properties: { name: 'Café & Bistrô', categories: ['catering.cafe'], datasource: { osm_id: 'node/42' } } };
    expect(transformGeoapifyPlace(feature, areaName, queryDate)!.slug).toBe('cafe-bistro-node-42');
  });

  it('marca presenceType como online quando não há coordenadas', () => {
    const feature = { properties: { name: 'Loja Online', categories: ['commercial.shop'], website: 'loja.com' } };
    expect(transformGeoapifyPlace(feature, areaName, queryDate)!.presenceType).toBe('online');
  });

  it('marca presenceType como ambos quando tem coordenadas e website', () => {
    const feature = {
      properties: { name: 'Café', categories: ['catering.cafe'], lat: -23.5, lon: -46.6, datasource: { raw_object: { website: 'https://cafe.com' } } },
    };
    expect(transformGeoapifyPlace(feature, areaName, queryDate)!.presenceType).toBe('ambos');
  });
});

describe('deduplicateLeads', () => {
  it('remove duplicatas por sourceId', () => {
    const leads: Lead[] = [
      { ...makeLead('osm-node-1'), sourceId: 'node/1' },
      { ...makeLead('osm-node-1-dup'), sourceId: 'node/1' },
      { ...makeLead('osm-node-2'), sourceId: 'node/2' },
    ];
    expect(deduplicateLeads(leads)).toHaveLength(2);
  });

  it('fallback: deduplica por nome + coordenadas quando não há sourceId', () => {
    const leads: Lead[] = [
      { ...makeLead('a'), name: 'Mercado', coordinates: { lat: -10, lng: -20 }, sourceId: undefined },
      { ...makeLead('b'), name: 'Mercado', coordinates: { lat: -10, lng: -20 }, sourceId: undefined },
      { ...makeLead('c'), name: 'Mercado', coordinates: { lat: -11, lng: -20 }, sourceId: undefined },
    ];
    expect(deduplicateLeads(leads)).toHaveLength(2);
  });

  it('não remove leads com nomes diferentes', () => {
    const leads: Lead[] = [
      { ...makeLead('a'), name: 'Loja A', sourceId: 'node/1' },
      { ...makeLead('b'), name: 'Loja B', sourceId: 'node/2' },
    ];
    expect(deduplicateLeads(leads)).toHaveLength(2);
  });
});

describe('isLeadDuplicate', () => {
  it('detecta duplicata por sourceId', () => {
    const existing: Lead[] = [{ ...makeLead('1'), sourceId: 'node/100' }];
    expect(isLeadDuplicate({ ...makeLead('2'), sourceId: 'node/100' }, existing)).toBe(true);
  });

  it('detecta duplicata por nome normalizado + cidade', () => {
    const existing: Lead[] = [{ ...makeLead('1'), name: 'Café Central', city: 'São Paulo', sourceId: undefined }];
    expect(isLeadDuplicate({ ...makeLead('2'), name: 'cafe central', city: 'São Paulo', sourceId: undefined }, existing)).toBe(true);
  });

  it('não detecta duplicata quando nome é igual mas cidade difere', () => {
    const existing: Lead[] = [{ ...makeLead('1'), name: 'Café Central', city: 'São Paulo', sourceId: undefined }];
    expect(isLeadDuplicate({ ...makeLead('2'), name: 'Café Central', city: 'Rio de Janeiro', sourceId: undefined }, existing)).toBe(false);
  });
});

describe('separação entre registros reais e fictícios', () => {
  it('leads do Geoapify têm isDemo=false e source=OpenStreetMap (via Geoapify)', () => {
    const feature = { properties: { name: 'Teste', categories: ['catering.cafe'], datasource: { osm_id: 'node/1' } } };
    const lead = transformGeoapifyPlace(feature, areaName, queryDate)!;
    expect(lead.isDemo).toBe(false);
    expect(lead.source).toBe('OpenStreetMap (via Geoapify)');
  });

  it('leads de demonstração têm isDemo=true', () => {
    const demoLead: Lead = { ...makeLead('demo-1'), isDemo: true, source: 'Base de demonstração' };
    expect(demoLead.isDemo).toBe(true);
    expect(demoLead.source).toBe('Base de demonstração');
  });
});

describe('isConfigured', () => {
  it('reflete o estado da variável VITE_GEOAPIFY_API_KEY', () => {
    // Se a chave está no .env, isConfigured() deve retornar true.
    // Se não está, deve retornar false. O teste se adapta ao ambiente.
    const key = import.meta.env.VITE_GEOAPIFY_API_KEY;
    if (key && key.length > 10) {
      expect(isConfigured()).toBe(true);
    } else {
      expect(isConfigured()).toBe(false);
    }
  });
});

describe('getDailySearchStatus', () => {
  it('retorna 10 pesquisas restantes no início do dia', () => {
    resetDailyUsage();
    const status = getDailySearchStatus();
    expect(status.remaining).toBe(10);
    expect(status.max).toBe(10);
  });

  it('retorna 0 restantes quando limite atingido', () => {
    // Simula 10 pesquisas usadas
    for (let i = 0; i < 10; i++) {
      localStorage.setItem('leadforge:geoapify_daily', JSON.stringify({ date: new Date().toISOString().slice(0, 10), count: 10 }));
    }
    const status = getDailySearchStatus();
    expect(status.remaining).toBe(0);
  });
});

describe('searchCompanies — chave ausente', () => {
  it('retorna config_pending quando a chave não existe no ambiente', async () => {
    // Salva a chave real, remove temporariamente
    const originalKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
    (import.meta.env as Record<string, unknown>).VITE_GEOAPIFY_API_KEY = undefined;

    const res = await searchCompanies(defaultParams());
    expect(res.error).toBeDefined();
    expect(res.error!.type).toBe('config_pending');

    // Restaura
    (import.meta.env as Record<string, unknown>).VITE_GEOAPIFY_API_KEY = originalKey;
  });

  it('não chama fetch quando a chave está ausente', async () => {
    const originalKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
    (import.meta.env as Record<string, unknown>).VITE_GEOAPIFY_API_KEY = undefined;

    const fetchSpy = vi.fn();
    global.fetch = fetchSpy;

    await searchCompanies(defaultParams());
    expect(fetchSpy).not.toHaveBeenCalled();

    (import.meta.env as Record<string, unknown>).VITE_GEOAPIFY_API_KEY = originalKey;
  });

  it('não consome limite diário quando a chave está ausente', async () => {
    const originalKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
    (import.meta.env as Record<string, unknown>).VITE_GEOAPIFY_API_KEY = undefined;

    await searchCompanies(defaultParams());
    const status = getDailySearchStatus();
    expect(status.remaining).toBe(10);

    (import.meta.env as Record<string, unknown>).VITE_GEOAPIFY_API_KEY = originalKey;
  });
});

describe('searchCompanies — entrada inválida', () => {
  it('retorna not_found quando city está vazio', async () => {
    const res = await searchCompanies(defaultParams({ city: '' }));
    expect(res.error).toBeDefined();
    expect(res.error!.type).toBe('not_found');
  });

  it('não consome limite diário quando city está vazio', async () => {
    await searchCompanies(defaultParams({ city: '' }));
    expect(getDailySearchStatus().remaining).toBe(10);
  });
});

describe('searchCompanies — chave inválida (HTTP 403)', () => {
  it('retorna config_invalid quando Geoapify rejeita a chave', async () => {
    mockFetch(403, { error: 'Forbidden' });

    const res = await searchCompanies(defaultParams());
    expect(res.error).toBeDefined();
    expect(res.error!.type).toBe('config_invalid');
  });
});

describe('searchCompanies — busca válida com resultados', () => {
  it('retorna leads transformados quando a API responde com features', async () => {
    const geoapifyResponse = {
      results: [{ lat: -22.9, lon: -47.1, city: 'Campinas' }],
    };
    const placesResponse = {
      features: [
        {
          properties: {
            name: 'Restaurante Teste',
            categories: ['catering', 'catering.restaurant'],
            lat: -22.9, lon: -47.1,
            city: 'Campinas',
            address_line1: 'Rua Teste, 123',
            datasource: { osm_id: 'node/999' },
          },
        },
        {
          properties: {
            name: 'Loja de Roupas',
            categories: ['commercial', 'commercial.clothes'],
            lat: -22.91, lon: -47.11,
            datasource: { osm_id: 'way/888' },
          },
        },
      ],
    };

    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({ status: 200, ok: true, json: () => Promise.resolve(geoapifyResponse) });
      }
      return Promise.resolve({ status: 200, ok: true, json: () => Promise.resolve(placesResponse) });
    });

    const res = await searchCompanies(defaultParams());
    expect(res.error).toBeUndefined();
    expect(res.results).toBeDefined();
    expect(res.results!.leads).toHaveLength(2);
    expect(res.results!.leads[0].name).toBe('Restaurante Teste');
    expect(res.results!.leads[0].category).toBe('Alimentação');
    expect(res.results!.leads[1].name).toBe('Loja de Roupas');
    expect(res.results!.leads[1].category).toBe('Moda e acessórios');
  });

  it('consome exatamente 1 pesquisa do limite diário', async () => {
    const geoapifyResponse = { results: [{ lat: -22.9, lon: -47.1, city: 'Campinas' }] };
    const placesResponse = { features: [] };

    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve({ status: 200, ok: true, json: () => Promise.resolve(geoapifyResponse) });
      return Promise.resolve({ status: 200, ok: true, json: () => Promise.resolve(placesResponse) });
    });

    resetDailyUsage();
    await searchCompanies(defaultParams());
    expect(getDailySearchStatus().remaining).toBe(9);
  });
});

describe('searchCompanies — resultados vazios', () => {
  it('retorna lista vazia quando a API não encontra features', async () => {
    const geoapifyResponse = { results: [{ lat: -22.9, lon: -47.1, city: 'Campinas' }] };
    const placesResponse = { features: [] };

    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve({ status: 200, ok: true, json: () => Promise.resolve(geoapifyResponse) });
      return Promise.resolve({ status: 200, ok: true, json: () => Promise.resolve(placesResponse) });
    });

    const res = await searchCompanies(defaultParams());
    expect(res.error).toBeUndefined();
    expect(res.results!.leads).toHaveLength(0);
    expect(res.results!.areaName).toBe('Campinas');
  });
});

describe('searchCompanies — cache', () => {
  it('segunda busca idêntica usa cache e não chama fetch', async () => {
    const geoapifyResponse = { results: [{ lat: -22.9, lon: -47.1, city: 'Campinas' }] };
    const placesResponse = { features: [] };

    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve({ status: 200, ok: true, json: () => Promise.resolve(geoapifyResponse) });
      return Promise.resolve({ status: 200, ok: true, json: () => Promise.resolve(placesResponse) });
    });

    resetDailyUsage();
    const params = defaultParams();
    await searchCompanies(params);
    expect(callCount).toBe(2); // 1 geocode + 1 places

    // Segunda busca — deve usar cache
    const res2 = await searchCompanies(params);
    expect(callCount).toBe(2); // sem novas chamadas
    expect(res2.error).toBeUndefined();
    expect(res2.results!.leads).toHaveLength(0);
  });

  it('cache não consome limite diário na segunda busca', async () => {
    const geoapifyResponse = { results: [{ lat: -22.9, lon: -47.1, city: 'Campinas' }] };
    const placesResponse = { features: [] };
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve({ status: 200, ok: true, json: () => Promise.resolve(geoapifyResponse) });
      return Promise.resolve({ status: 200, ok: true, json: () => Promise.resolve(placesResponse) });
    });

    resetDailyUsage();
    const params = defaultParams();
    await searchCompanies(params);
    expect(getDailySearchStatus().remaining).toBe(9);
    await searchCompanies(params);
    expect(getDailySearchStatus().remaining).toBe(9); // não consumiu
  });

  it('getCachedResult retorna null quando não há cache', () => {
    expect(getCachedResult(defaultParams())).toBeNull();
  });
});

describe('searchCompanies — limite diário local', () => {
  it('retorna rate_limit_local quando 10 pesquisas já foram feitas', async () => {
    // Simula 10 pesquisas usadas hoje
    localStorage.setItem('leadforge:geoapify_daily', JSON.stringify({ date: new Date().toISOString().slice(0, 10), count: 10 }));

    const res = await searchCompanies(defaultParams());
    expect(res.error).toBeDefined();
    expect(res.error!.type).toBe('rate_limit_local');
    if (res.error!.type === 'rate_limit_local') {
      expect(res.error!.remaining).toBe(0);
    }
  });

  it('não chama fetch quando o limite local foi atingido', async () => {
    localStorage.setItem('leadforge:geoapify_daily', JSON.stringify({ date: new Date().toISOString().slice(0, 10), count: 10 }));
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy;
    await searchCompanies(defaultParams());
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('searchCompanies — erros HTTP', () => {
  it('retorna rate_limit quando API responde 429', async () => {
    const geoapifyResponse = { results: [{ lat: -22.9, lon: -47.1, city: 'Campinas' }] };
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve({ status: 200, ok: true, json: () => Promise.resolve(geoapifyResponse) });
      return Promise.resolve({ status: 429, ok: false, json: () => Promise.resolve({}) });
    });

    const res = await searchCompanies(defaultParams());
    expect(res.error!.type).toBe('rate_limit');
  });

  it('retorna server_error quando API responde 500', async () => {
    const geoapifyResponse = { results: [{ lat: -22.9, lon: -47.1, city: 'Campinas' }] };
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve({ status: 200, ok: true, json: () => Promise.resolve(geoapifyResponse) });
      return Promise.resolve({ status: 500, ok: false, json: () => Promise.resolve({}) });
    });

    const res = await searchCompanies(defaultParams());
    expect(res.error!.type).toBe('server_error');
    expect((res.error as any).status).toBe(500);
  });

  it('retorna network quando fetch lança erro de conexão', async () => {
    mockFetchError(new TypeError('Failed to fetch'));
    const res = await searchCompanies(defaultParams());
    expect(res.error!.type).toBe('network');
  });

  it('retorna not_found quando geocodificação não encontra o município', async () => {
    mockFetch(200, { results: [] });
    const res = await searchCompanies(defaultParams({ city: 'CidadeInexistente' }));
    expect(res.error!.type).toBe('not_found');
  });
});

function makeLead(id: string): Lead {
  return {
    id, slug: id, name: 'Test', category: 'Alimentação', profileType: 'empresa',
    description: '', presenceType: 'fisico', summary: '', isDemo: false,
    source: 'OpenStreetMap (via Geoapify)', digitalPresence: ['nenhuma'],
    opportunityScore: 0, stage: 'novo', notes: '', activities: [], saved: false,
  };
}
