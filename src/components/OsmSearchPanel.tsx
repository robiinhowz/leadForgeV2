import { useState, useRef, useCallback } from 'react';
import {
  Search, Loader2, AlertCircle, CheckCircle2, Globe,
  Plus, X, ChevronDown, ChevronUp, KeyRound, Gauge,
} from 'lucide-react';
import {
  searchCompanies,
  isConfigured,
  getDailySearchStatus,
  isLeadDuplicate,
  clearCache,
  resetDailyUsage,
  type SearchCompaniesParams,
  type SearchError,
} from '@/lib/osmService';
import { useLeads } from '@/lib/leadsContext';
import { CATEGORIES } from '@/types';
import type { Category, Lead, StateUF } from '@/types';
import { getCategoryIcon } from '@/lib/utils';

const BRAZIL_STATES: { value: StateUF; label: string }[] = [
  { value: 'AC', label: 'Acre' }, { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' }, { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' }, { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' }, { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' }, { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' }, { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' }, { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' }, { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' }, { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' }, { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' }, { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' }, { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' }, { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

export default function OsmSearchPanel() {
  const { leads, importLeadsDedup } = useLeads();
  const [expanded, setExpanded] = useState(false);
  const [country] = useState('Brasil');
  const [state, setState] = useState<StateUF>('SP');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Lead[] | null>(null);
  const [error, setError] = useState<SearchError | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [queryDate, setQueryDate] = useState<string | null>(null);
  const [areaName, setAreaName] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number>(getDailySearchStatus().remaining);

  const abortRef = useRef<AbortController | null>(null);
  const configured = isConfigured();

  const handleSearch = useCallback(async () => {
    // Bloqueia cliques repetidos
    if (loading) return;

    if (!city.trim()) {
      setError({ type: 'not_found', message: 'Informe o nome de um município.' });
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setSelected(new Set());
    setImportedCount(null);

    const controller = new AbortController();
    abortRef.current = controller;

    const params: SearchCompaniesParams = {
      country,
      state: BRAZIL_STATES.find((s) => s.value === state)?.label ?? state,
      city: city.trim(),
      category,
      limit,
    };

    const res = await searchCompanies(params, controller.signal);

    // Atualiza contador de pesquisas restantes
    setRemaining(getDailySearchStatus().remaining);

    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }

    setResults(res.results.leads);
    setQueryDate(res.results.queryDate);
    setAreaName(res.results.areaName);
    const initialSelected = new Set<string>(
      res.results.leads
        .filter((l) => !isLeadDuplicate(l, leads))
        .map((l) => l.id),
    );
    setSelected(initialSelected);
    setLoading(false);
  }, [loading, city, country, state, category, limit, leads]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleImport = useCallback(() => {
    if (!results) return;
    const toImport = results.filter((l) => selected.has(l.id));
    if (toImport.length === 0) {
      setImportedCount(0);
      return;
    }
    const added = importLeadsDedup(toImport);
    setImportedCount(added.length);
    const remainingResults = results.filter((l) => !selected.has(l.id));
    setResults(remainingResults);
    setSelected(new Set());
  }, [results, selected, importLeadsDedup]);

  const errorMsg: Record<SearchError['type'], string> = {
    rate_limit_local: `Limite local de ${getDailySearchStatus().max} pesquisas/dia atingido.`,
    rate_limit: 'Limite da API atingido (HTTP 429). O plano gratuito permite 3.000/dia.',
    server_error: 'Erro do servidor. Tente novamente em instantes.',
    network: 'Erro de conexão ou tempo limite.',
    not_found: 'Município não encontrado. Verifique o nome.',
    config_pending: 'Chave da API não configurada.',
    config_invalid: 'Chave da API rejeitada (HTTP 403).',
  };

  return (
    <div className="mb-4 rounded-xl border border-stone-200 bg-white overflow-hidden">
      {/* Cabeçalho compacto */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-stone-50/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
            <Globe className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-stone-900">Buscar empresas reais</h2>
            <p className="text-[11px] text-stone-400">
              Dados OSM via Geoapify · {remaining}/{getDailySearchStatus().max} pesquisas restantes hoje
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {configured && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              API ativa
            </span>
          )}
          {expanded ? <ChevronUp className="h-4 w-4 text-stone-400" /> : <ChevronDown className="h-4 w-4 text-stone-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-stone-100 px-4 py-3 space-y-3">
          {/* Aviso de configuração pendente — compacto */}
          {!configured && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <KeyRound className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Configuração pendente</p>
                <p className="mt-0.5 text-amber-700">
                  A variável <code className="rounded bg-amber-100 px-1 font-mono">VITE_GEOAPIFY_API_KEY</code> não está
                  definida no ambiente. No desenvolvimento, adicione-a ao arquivo <code className="rounded bg-amber-100 px-1 font-mono">.env</code>.
                  No ambiente publicado (Bolt), defina-a nas variáveis de ambiente do projeto.
                  Crie uma chave gratuita em{' '}
                  <a href="https://www.geoapify.com/" target="_blank" rel="noopener noreferrer" className="underline font-medium">geoapify.com</a>{' '}
                  e restrinja-a aos seus domínios no painel do Geoapify.
                </p>
              </div>
            </div>
          )}

          {/* Formulário compacto — 1 linha no desktop, 2 no mobile */}
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[120px]">
              <label className="mb-0.5 block text-[10px] font-medium text-stone-400 uppercase tracking-wide">Estado</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value as StateUF)}
                className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-sm focus:border-stone-400 focus:outline-none"
              >
                {BRAZIL_STATES.map((s) => (
                  <option key={s.value} value={s.value}>{s.value}</option>
                ))}
              </select>
            </div>
            <div className="flex-[2] min-w-[140px]">
              <label className="mb-0.5 block text-[10px] font-medium text-stone-400 uppercase tracking-wide">Município</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !loading) handleSearch(); }}
                placeholder="Ex: Campinas"
                className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-sm focus:border-stone-400 focus:outline-none"
              />
            </div>
            <div className="flex-[2] min-w-[130px]">
              <label className="mb-0.5 block text-[10px] font-medium text-stone-400 uppercase tracking-wide">Nicho</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category | '')}
                className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-sm focus:border-stone-400 focus:outline-none"
              >
                <option value="">Todos</option>
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="min-w-[70px]">
              <label className="mb-0.5 block text-[10px] font-medium text-stone-400 uppercase tracking-wide">Limite</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-sm focus:border-stone-400 focus:outline-none"
              >
                {[10, 20, 30].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            {loading ? (
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 whitespace-nowrap"
              >
                <X className="h-3.5 w-3.5" />
                Cancelar
              </button>
            ) : (
              <button
                onClick={handleSearch}
                disabled={!city.trim() || !configured || remaining <= 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-1.5 text-sm font-semibold text-white whitespace-nowrap transition-all hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                <Search className="h-3.5 w-3.5" />
                Buscar
              </button>
            )}
          </div>

          {/* Barra de status compacta */}
          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <Gauge className="h-3 w-3" />
              {remaining} de {getDailySearchStatus().max} pesquisas restantes hoje
            </span>
            <span>
              Dados © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a> (ODbL)
            </span>
          </div>

          {/* Erro compacto */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMsg[error.type]}</p>
                <p className="mt-0.5 text-red-600">{error.message}</p>
              </div>
            </div>
          )}

          {/* Loading compacto */}
          {loading && (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-stone-200 bg-stone-50 py-4 text-xs text-stone-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Consultando Geoapify...
            </div>
          )}

          {/* Resultados */}
          {results !== null && !loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-stone-600">
                  {results.length} {results.length === 1 ? 'empresa' : 'empresas'}
                  {areaName && <span className="text-stone-400"> em {areaName}</span>}
                  {queryDate && <span className="text-stone-400"> · {new Date(queryDate).toLocaleTimeString('pt-BR')}</span>}
                </p>
              </div>

              {importedCount !== null && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {importedCount > 0
                    ? `${importedCount} ${importedCount === 1 ? 'lead importado' : 'leads importados'}.`
                    : 'Nenhum lead novo (todos já existem).'}
                </div>
              )}

              {results.length === 0 ? (
                <div className="rounded-lg border border-dashed border-stone-200 bg-stone-50 py-6 text-center text-xs text-stone-400">
                  Nenhuma empresa encontrada. Tente outro município ou remova o filtro de nicho.
                </div>
              ) : (
                <>
                  {/* Ações de importação */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        if (selected.size === results.length) setSelected(new Set());
                        else setSelected(new Set(results.map((l) => l.id)));
                      }}
                      className="text-[11px] font-medium text-stone-500 hover:text-stone-700 hover:underline"
                    >
                      {selected.size === results.length ? 'Desmarcar todos' : 'Selecionar todos'}
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={selected.size === 0}
                      className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 disabled:opacity-40"
                    >
                      <Plus className="h-3 w-3" />
                      Importar {selected.size > 0 ? `(${selected.size})` : ''}
                    </button>
                  </div>

                  {/* Lista de resultados — scrollável */}
                  <div className="space-y-1.5 max-h-[350px] overflow-y-auto rounded-lg border border-stone-100 p-1.5">
                    {results.map((lead) => {
                      const Icon = getCategoryIcon(lead.category);
                      const isAlreadyLead = isLeadDuplicate(lead, leads);
                      const isSelected = selected.has(lead.id);
                      return (
                        <div
                          key={lead.id}
                          className={`flex items-start gap-2.5 rounded-lg border p-2.5 transition-all ${
                            isSelected ? 'border-stone-400 bg-stone-50' : 'border-stone-100 bg-white'
                          }`}
                        >
                          <button
                            onClick={() => toggleSelect(lead.id)}
                            disabled={isAlreadyLead}
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all ${
                              isSelected ? 'border-stone-700 bg-stone-700 text-white' : 'border-stone-300 bg-white'
                            } ${isAlreadyLead ? 'opacity-30 cursor-not-allowed' : ''}`}
                            aria-label={isSelected ? 'Desmarcar' : 'Selecionar'}
                          >
                            {isSelected && <CheckCircle2 className="h-2.5 w-2.5" />}
                          </button>
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-stone-100">
                            <Icon className="h-3.5 w-3.5 text-stone-500" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-xs font-semibold text-stone-800">{lead.name}</p>
                              {isAlreadyLead && (
                                <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[9px] font-medium text-stone-400">
                                  Já existe
                                </span>
                              )}
                            </div>
                            <p className="truncate text-[11px] text-stone-400">
                              {lead.category} · {lead.city ?? '—'}
                              {lead.website && ` · ${lead.website}`}
                            </p>
                            <div className="mt-0.5 flex flex-wrap gap-0.5">
                              {lead.digitalPresence.map((d) => (
                                <span key={d} className="rounded bg-stone-50 px-1 py-0.5 text-[9px] text-stone-400">
                                  {d}
                                </span>
                              ))}
                            </div>
                          </div>
                          {lead.sourceUrl && (
                            <a
                              href={lead.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] text-stone-400 hover:text-stone-600 shrink-0 mt-0.5"
                            >
                              OSM ↗
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Nota de segurança — compacta, apenas quando expandido e configurado */}
          {configured && (
            <p className="text-[10px] text-stone-300 leading-relaxed">
              O limite de {getDailySearchStatus().max} pesquisas/dia é local ao navegador e pode ser contornado.
              Para limites confiáveis por conta, é necessário um backend com controle de uso.
              Restrinja a chave de API aos seus domínios no painel do Geoapify.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
