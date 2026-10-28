import { useMemo } from 'react';
import type { Lead } from '@/types';
import { normalize } from '@/lib/utils';
import type { FilterState } from '@/components/Filters';
import { leads } from '@/data/businesses';

export function useFilteredLeads(filters: FilterState, leadSource?: Lead[]): Lead[] {
  const source = leadSource ?? leads;
  return useMemo(() => {
    const q = normalize(filters.query);
    let result = source.filter((b) => {
      if (q) {
        const haystack = normalize(
          [b.name, b.description, b.summary, b.category, b.city ?? '', b.state ?? ''].join(' '),
        );
        if (!haystack.includes(q)) return false;
      }
      if (filters.category && b.category !== filters.category) return false;
      if (filters.presenceType && b.presenceType !== filters.presenceType) return false;
      if (filters.profileType && b.profileType !== filters.profileType) return false;
      if (filters.state && b.state !== filters.state) return false;
      if (filters.city && b.city !== filters.city) return false;
      if (filters.stage && b.stage !== filters.stage) return false;
      if (filters.digitalPresence && !b.digitalPresence.includes(filters.digitalPresence)) return false;
      return true;
    });

    if (filters.sort === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    } else if (filters.sort === 'opportunity') {
      result = [...result].sort((a, b) => b.opportunityScore - a.opportunityScore);
    }
    return result;
  }, [filters, source]);
}

export function getCitiesForState(state: string): string[] {
  return Array.from(
    new Set(
      leads.filter((b) => b.state === state && b.city).map((b) => b.city as string),
    ),
  ).sort();
}
