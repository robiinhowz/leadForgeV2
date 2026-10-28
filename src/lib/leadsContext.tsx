import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Lead, FunnelStage, LeadActivity } from '@/types';
import { leads as initialLeads } from '@/data/businesses';

interface LeadsContextValue {
  leads: Lead[];
  getLead: (id: string) => Lead | undefined;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  setStage: (id: string, stage: FunnelStage) => void;
  setNotes: (id: string, notes: string) => void;
  setProposedService: (id: string, service: string) => void;
  setNextAction: (id: string, action: string) => void;
  toggleSaved: (id: string) => void;
  importLeads: (newLeads: Lead[]) => void;
  /** Importa leads evitando duplicatas (por sourceId ou nome normalizado). Retorna os efetivamente adicionados. */
  importLeadsDedup: (newLeads: Lead[]) => Lead[];
}

const LeadsContext = createContext<LeadsContextValue | null>(null);

function addActivity(lead: Lead, type: LeadActivity['type'], description: string): Lead {
  const activity: LeadActivity = {
    id: `${lead.id}-a${Date.now()}`,
    date: new Date().toISOString(),
    type,
    description,
  };
  return { ...lead, activities: [activity, ...lead.activities] };
}

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  const getLead = useCallback(
    (id: string) => leads.find((l) => l.id === id),
    [leads],
  );

  const updateLead = useCallback((id: string, patch: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const setStage = useCallback((id: string, stage: FunnelStage) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id ? addActivity(l, 'status', `Status alterado para "${stage}".`) : l,
      ),
    );
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, stage } : l)),
    );
  }, []);

  const setNotes = useCallback((id: string, notes: string) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes } : l)));
  }, []);

  const setProposedService = useCallback((id: string, proposedService: string) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, proposedService } : l)));
  }, []);

  const setNextAction = useCallback((id: string, nextAction: string) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, nextAction } : l)));
  }, []);

  const toggleSaved = useCallback((id: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, saved: !l.saved } : l)),
    );
  }, []);

  const importLeads = useCallback((newLeads: Lead[]) => {
    setLeads((prev) => [...newLeads, ...prev]);
  }, []);

  const importLeadsDedup = useCallback((newLeads: Lead[]): Lead[] => {
    let added: Lead[] = [];
    setLeads((prev) => {
      added = newLeads.filter((nl) => {
        if (nl.sourceId) return !prev.some((l) => l.sourceId === nl.sourceId);
        const normName = nl.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        return !prev.some((l) => {
          const existingNorm = l.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
          return existingNorm === normName && l.city === nl.city;
        });
      });
      return [...added, ...prev];
    });
    return added;
  }, []);

  return (
    <LeadsContext.Provider
      value={{ leads, getLead, updateLead, setStage, setNotes, setProposedService, setNextAction, toggleSaved, importLeads, importLeadsDedup }}
    >
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads(): LeadsContextValue {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error('useLeads deve ser usado dentro de LeadsProvider');
  return ctx;
}
