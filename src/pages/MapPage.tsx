import { useMemo, useState, Suspense, lazy } from 'react';
import { Map as MapIcon, Filter, X, MapPin } from 'lucide-react';
import { useLeads } from '@/lib/leadsContext';
import { CATEGORIES } from '@/types';
import type { Category, StateUF, Lead } from '@/types';
import { Link } from 'react-router-dom';
import DemoBadge from '@/components/DemoBadge';
import { categoryColor, getCategoryIcon } from '@/lib/utils';

const BusinessMap = lazy(() => import('@/components/BusinessMap'));



export default function MapPage() {
  const { leads } = useLeads();
  const [category, setCategory] = useState<Category | ''>('');
  const [state, setState] = useState<StateUF | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [focus, setFocus] = useState<{ coordinates: { lat: number; lng: number }; zoom?: number } | null>(null);

  const allStates = useMemo(
    () => Array.from(new Set(leads.map((l) => l.state).filter(Boolean))).sort() as StateUF[],
    [leads],
  );

  const filtered = useMemo(
    () =>
      leads.filter((l) => {
        if (category && l.category !== category) return false;
        if (state && l.state !== state) return false;
        return true;
      }),
    [leads, category, state],
  );

  const mappable = useMemo(() => filtered.filter((l) => l.coordinates), [filtered]);

  function selectLead(l: Lead) {
    setSelected(l);
    if (l.coordinates) setFocus({ coordinates: l.coordinates, zoom: 14 });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stone-900">Mapa de leads</h1>
        <p className="mt-1 text-stone-600">
          Empresas com localização válida. Empresas sem coordenadas não recebem marcadores.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 lg:hidden"
        >
          <Filter className="h-4 w-4" />
          Filtros
        </button>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | '')}
          className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
          aria-label="Filtrar por categoria"
        >
          <option value="">Todas as categorias</option>
          {CATEGORIES.map((c) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
        <select
          value={state}
          onChange={(e) => setState(e.target.value as StateUF | '')}
          className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
          aria-label="Filtrar por estado"
        >
          <option value="">Todos os estados</option>
          {allStates.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {(category || state) && (
          <button
            onClick={() => { setCategory(''); setState(''); }}
            className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-red-600"
          >
            <X className="h-4 w-4" />
            Limpar
          </button>
        )}
        <span className="ml-auto text-sm text-stone-500">
          {mappable.length} {mappable.length === 1 ? 'marcador' : 'marcadores'}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="h-[500px] overflow-hidden rounded-2xl border border-stone-200 shadow-sm lg:h-[600px]">
          {mappable.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <MapPin className="h-10 w-10 text-stone-300" />
              <p className="mt-3 text-sm font-semibold text-stone-600">
                Nenhum marcador para os filtros selecionados.
              </p>
              <p className="mt-1 text-xs text-stone-400">
                Empresas exclusivamente online não recebem marcadores.
              </p>
            </div>
          ) : (
            <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-stone-400">Carregando mapa...</div>}>
              <BusinessMap
                leads={mappable}
                height="100%"
                focus={focus}
                onMarkerClick={selectLead}
              />
            </Suspense>
          )}
        </div>

        <div className="flex flex-col rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-100 p-4">
            <h2 className="text-sm font-bold text-stone-800">
              {filtered.length} leads
            </h2>
            <p className="text-xs text-stone-400">Selecione para centralizar o mapa.</p>
          </div>
          <div className="max-h-[520px] space-y-2 overflow-y-auto p-3 lg:max-h-[560px]">
            {filtered.map((l) => {
              const Icon = getCategoryIcon(l.category);
              const active = selected?.id === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => selectLead(l)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${active ? 'border-primary-400 bg-primary-50' : 'border-stone-200 hover:border-primary-200 hover:bg-stone-50'}`}
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${categoryColor(l.category)}1a` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: categoryColor(l.category) }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-800">{l.name}</p>
                    <p className="truncate text-xs text-stone-500">
                      {l.category} · {l.city ? `${l.city}, ${l.state}` : 'Online'}
                    </p>
                  </div>
                  {l.coordinates ? (
                    <MapPin className="h-4 w-4 shrink-0 text-primary-500" />
                  ) : (
                    <span className="text-[10px] text-stone-400 shrink-0">Online</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selected && (
        <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900">{selected.name}</h3>
                <DemoBadge />
              </div>
              <p className="mt-1 text-sm text-stone-600">{selected.description}</p>
              <p className="mt-2 text-xs text-stone-500">
                {selected.category} · {selected.city ? `${selected.city}, ${selected.state}` : 'Exclusivamente online'}
              </p>
            </div>
            <Link
              to={`/app/leads/${selected.id}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
            >
              Ver detalhes
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-stone-400">
        <MapIcon className="h-3.5 w-3.5" />
        <span>
          Mapa © contribuidores do{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            OpenStreetMap
          </a>
          . Marcadores são ilustrativos.
        </span>
      </div>
    </div>
  );
}
