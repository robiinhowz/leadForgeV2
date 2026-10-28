import { CATEGORIES, FUNNEL_STAGES, DIGITAL_PRESENCE_LABELS } from '@/types';
import type { Category, PresenceType, ProfileType, StateUF, FunnelStage, DigitalPresence } from '@/types';
import { leads } from '@/data/businesses';
import { X, Filter } from 'lucide-react';

export interface FilterState {
  query: string;
  category: Category | '';
  presenceType: PresenceType | '';
  state: StateUF | '';
  city: string;
  profileType: ProfileType | '';
  stage: FunnelStage | '';
  digitalPresence: DigitalPresence | '';
  sort: 'opportunity' | 'name';
}

export const emptyFilters: FilterState = {
  query: '',
  category: '',
  presenceType: '',
  state: '',
  city: '',
  profileType: '',
  stage: '',
  digitalPresence: '',
  sort: 'opportunity',
};

const states = Array.from(new Set(leads.map((b) => b.state).filter(Boolean))).sort() as StateUF[];
const presenceLabels: Record<PresenceType, string> = {
  fisico: 'Presença física',
  online: 'Exclusivamente online',
  ambos: 'Físico e online',
};
const profileLabels: Record<ProfileType, string> = {
  empresa: 'Empresa',
  profissional: 'Profissional',
  criador: 'Criador de conteúdo',
};

export default function Filters({
  filters,
  onChange,
  onClear,
  cities,
}: {
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  onClear: () => void;
  cities: string[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-800">
          <Filter className="h-4 w-4 text-primary-600" />
          Filtros
        </h3>
        <button
          onClick={onClear}
          className="text-xs font-medium text-stone-500 hover:text-red-600 transition-colors"
        >
          Limpar filtros
        </button>
      </div>

      {/* Busca */}
      <div>
        <label htmlFor="f-query" className="mb-1 block text-xs font-medium text-stone-500">
          Busca por palavra-chave
        </label>
        <input
          id="f-query"
          type="search"
          value={filters.query}
          onChange={(e) => onChange({ query: e.target.value })}
          placeholder="nome, produto, serviço..."
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-primary-400"
        />
      </div>

      {/* Categoria */}
      <div>
        <label htmlFor="f-category" className="mb-1 block text-xs font-medium text-stone-500">
          Nicho
        </label>
        <select
          id="f-category"
          value={filters.category}
          onChange={(e) => onChange({ category: e.target.value as Category | '' })}
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-primary-400"
        >
          <option value="">Todos os nichos</option>
          {CATEGORIES.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tipo de presença */}
      <div>
        <label htmlFor="f-presence" className="mb-1 block text-xs font-medium text-stone-500">
          Presença digital observada
        </label>
        <select
          id="f-presence"
          value={filters.presenceType}
          onChange={(e) => onChange({ presenceType: e.target.value as PresenceType | '' })}
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-primary-400"
        >
          <option value="">Todos</option>
          {(Object.keys(presenceLabels) as PresenceType[]).map((p) => (
            <option key={p} value={p}>
              {presenceLabels[p]}
            </option>
          ))}
        </select>
      </div>

      {/* Presença digital observada */}
      <div>
        <label htmlFor="f-digital" className="mb-1 block text-xs font-medium text-stone-500">
          Canal digital observado
        </label>
        <select
          id="f-digital"
          value={filters.digitalPresence}
          onChange={(e) => onChange({ digitalPresence: e.target.value as DigitalPresence | '' })}
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-primary-400"
        >
          <option value="">Todos</option>
          {(Object.keys(DIGITAL_PRESENCE_LABELS) as DigitalPresence[]).map((d) => (
            <option key={d} value={d}>
              {DIGITAL_PRESENCE_LABELS[d]}
            </option>
          ))}
        </select>
      </div>

      {/* Tipo de perfil */}
      <div>
        <label htmlFor="f-profile" className="mb-1 block text-xs font-medium text-stone-500">
          Tipo de negócio
        </label>
        <select
          id="f-profile"
          value={filters.profileType}
          onChange={(e) => onChange({ profileType: e.target.value as ProfileType | '' })}
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-primary-400"
        >
          <option value="">Todos</option>
          {(Object.keys(profileLabels) as ProfileType[]).map((p) => (
            <option key={p} value={p}>
              {profileLabels[p]}
            </option>
          ))}
        </select>
      </div>

      {/* Status de prospecção */}
      <div>
        <label htmlFor="f-stage" className="mb-1 block text-xs font-medium text-stone-500">
          Status de prospecção
        </label>
        <select
          id="f-stage"
          value={filters.stage}
          onChange={(e) => onChange({ stage: e.target.value as FunnelStage | '' })}
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-primary-400"
        >
          <option value="">Todos os status</option>
          {FUNNEL_STAGES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Estado */}
      <div>
        <label htmlFor="f-state" className="mb-1 block text-xs font-medium text-stone-500">
          Estado
        </label>
        <select
          id="f-state"
          value={filters.state}
          onChange={(e) => onChange({ state: e.target.value as StateUF | '', city: '' })}
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-primary-400"
        >
          <option value="">Todos os estados</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Cidade */}
      {filters.state && (
        <div>
          <label htmlFor="f-city" className="mb-1 block text-xs font-medium text-stone-500">
            Cidade
          </label>
          <select
            id="f-city"
            value={filters.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-primary-400"
          >
            <option value="">Todas as cidades</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Ordenação */}
      <div>
        <label htmlFor="f-sort" className="mb-1 block text-xs font-medium text-stone-500">
          Ordenar por
        </label>
        <select
          id="f-sort"
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value as FilterState['sort'] })}
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-primary-400"
        >
          <option value="opportunity">Pontuação de oportunidade</option>
          <option value="name">Nome (A–Z)</option>
        </select>
      </div>
    </div>
  );
}

export function ActiveFilterChips({
  filters,
  onRemove,
}: {
  filters: FilterState;
  onRemove: (key: keyof FilterState) => void;
}) {
  const chips: { key: keyof FilterState; label: string }[] = [];

  if (filters.query)
    chips.push({ key: 'query', label: `Busca: "${filters.query}"` });
  if (filters.category) chips.push({ key: 'category', label: filters.category });
  if (filters.presenceType)
    chips.push({ key: 'presenceType', label: presenceLabels[filters.presenceType] });
  if (filters.profileType)
    chips.push({ key: 'profileType', label: profileLabels[filters.profileType] });
  if (filters.stage) {
    const stageLabel = FUNNEL_STAGES.find((s) => s.value === filters.stage)?.label ?? filters.stage;
    chips.push({ key: 'stage', label: stageLabel });
  }
  if (filters.digitalPresence)
    chips.push({ key: 'digitalPresence', label: DIGITAL_PRESENCE_LABELS[filters.digitalPresence] });
  if (filters.state) chips.push({ key: 'state', label: filters.state });
  if (filters.city) chips.push({ key: 'city', label: filters.city });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          onClick={() => onRemove(c.key)}
          className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 border border-primary-200 hover:bg-primary-100"
        >
          {c.label}
          <X className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}
