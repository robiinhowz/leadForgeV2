import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List as ListIcon, SlidersHorizontal, X, Upload } from 'lucide-react';
import Filters, { emptyFilters, ActiveFilterChips } from '@/components/Filters';
import type { FilterState } from '@/components/Filters';
import { useFilteredLeads, getCitiesForState } from '@/lib/useFilters';
import LeadCard from '@/components/BusinessCard';
import LeadListItem from '@/components/BusinessListItem';
import EmptyState from '@/components/EmptyState';
import OsmSearchPanel from '@/components/OsmSearchPanel';
import { useLeads } from '@/lib/leadsContext';
import type { Category, PresenceType, ProfileType, StateUF, FunnelStage, DigitalPresence } from '@/types';

export default function LeadsPage() {
  const { leads } = useLeads();
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<'cards' | 'list'>('cards');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    ...emptyFilters,
    query: params.get('q') ?? '',
    category: (params.get('categoria') as Category) ?? '',
    state: (params.get('estado') as StateUF) ?? '',
    presenceType: (params.get('presenca') as PresenceType) ?? '',
    profileType: (params.get('perfil') as ProfileType) ?? '',
    stage: (params.get('status') as FunnelStage) ?? '',
    digitalPresence: (params.get('digital') as DigitalPresence) ?? '',
    sort: 'opportunity',
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      query: params.get('q') ?? '',
      category: (params.get('categoria') as Category) ?? '',
      state: (params.get('estado') as StateUF) ?? '',
      presenceType: (params.get('presenca') as PresenceType) ?? '',
      profileType: (params.get('perfil') as ProfileType) ?? '',
      stage: (params.get('status') as FunnelStage) ?? '',
      digitalPresence: (params.get('digital') as DigitalPresence) ?? '',
    }));
  }, [params]);

  const filtered = useFilteredLeads(filters, leads);
  const cities = useMemo(
    () => (filters.state ? getCitiesForState(filters.state) : []),
    [filters.state],
  );

  function update(patch: Partial<FilterState>) {
    setFilters((prev) => ({ ...prev, ...patch }));
    const next = new URLSearchParams();
    const merged = { ...filters, ...patch };
    if (merged.query) next.set('q', merged.query);
    if (merged.category) next.set('categoria', merged.category);
    if (merged.state) next.set('estado', merged.state);
    if (merged.presenceType) next.set('presenca', merged.presenceType);
    if (merged.profileType) next.set('perfil', merged.profileType);
    if (merged.stage) next.set('status', merged.stage);
    if (merged.digitalPresence) next.set('digital', merged.digitalPresence);
    setParams(next, { replace: true });
  }

  function clear() {
    setFilters({ ...emptyFilters, sort: 'opportunity' });
    setParams({}, { replace: true });
  }

  function removeChip(key: keyof FilterState) {
    const patch: Partial<FilterState> = { [key]: key === 'sort' ? 'opportunity' : '' } as never;
    update(patch);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stone-900">Buscador de leads</h1>
        <p className="mt-1 text-stone-600">
          Encontre empresas por nicho, região e presença digital.
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:border-primary-300"
          >
            <Upload className="h-4 w-4" />
            Importar CSV
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-500">
            {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
          </span>
          <div className="flex overflow-hidden rounded-lg border border-stone-200">
            <button
              onClick={() => setView('cards')}
              className={`inline-flex h-9 w-9 items-center justify-center ${view === 'cards' ? 'bg-primary-50 text-primary-700' : 'bg-white text-stone-400'}`}
              aria-label="Visualização em cartões"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`inline-flex h-9 w-9 items-center justify-center ${view === 'list' ? 'bg-primary-50 text-primary-700' : 'bg-white text-stone-400'}`}
              aria-label="Visualização em lista"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-stone-200 bg-white p-5">
            <Filters
              filters={filters}
              onChange={update}
              onClear={clear}
              cities={cities}
            />
          </div>
        </aside>

        <div className="space-y-4">
          <OsmSearchPanel />

          <ActiveFilterChips filters={filters} onRemove={removeChip} />

          {filtered.length === 0 ? (
            <EmptyState
              title="Nenhum lead encontrado"
              message="Tente remover alguns filtros ou buscar por outros termos."
              action={
                <button
                  onClick={clear}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
                >
                  <X className="h-4 w-4" />
                  Limpar filtros
                </button>
              }
            />
          ) : view === 'cards' ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((l) => (
                <LeadCard key={l.id} lead={l} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((l) => (
                <LeadListItem key={l.id} lead={l} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filtros mobile */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 animate-fade-in-up">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-900">Filtros</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-stone-100"
                aria-label="Fechar filtros"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Filters
              filters={filters}
              onChange={update}
              onClear={clear}
              cities={cities}
            />
            <button
              onClick={() => setShowMobileFilters(false)}
              className="mt-5 w-full rounded-full bg-primary-700 py-3 text-sm font-semibold text-white"
            >
              Ver {filtered.length} resultados
            </button>
          </div>
        </div>
      )}

      {/* Importar CSV */}
      {showImport && (
        <ImportCsvModal onClose={() => setShowImport(false)} />
      )}
    </div>
  );
}

function ImportCsvModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl animate-fade-in-up">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900">Importar leads via CSV</h2>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-stone-500">
          Selecione um arquivo CSV com colunas como nome, categoria, cidade e estado.
          Esta é uma interface demonstrativa — o arquivo é processado localmente no seu navegador
          e <strong>não é salvo remotamente</strong>. Os leads importados aparecerão apenas nesta sessão.
        </p>
        <div className="mt-4 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 p-8 text-center">
          <Upload className="mx-auto h-8 w-8 text-stone-300" />
          <p className="mt-2 text-sm text-stone-500">Arraste um arquivo .csv ou clique para selecionar</p>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setTimeout(onClose, 500);
              }
            }}
          />
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
          <X className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Funcionalidade demonstrativa. O parsing real de CSV será implementado na integração com backend.</span>
        </div>
      </div>
    </div>
  );
}
