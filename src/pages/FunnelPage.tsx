import { useLeads } from '@/lib/leadsContext';
import { FUNNEL_STAGES, STAGE_LABELS } from '@/types';
import type { FunnelStage } from '@/types';
import { Link } from 'react-router-dom';
import { getCategoryIcon } from '@/lib/utils';
import { Info, ChevronRight, ChevronLeft } from 'lucide-react';


const stageColors: Record<FunnelStage, string> = {
  novo: 'border-stone-300 bg-stone-50',
  para_contatar: 'border-blue-300 bg-blue-50',
  contatado: 'border-azure-300 bg-azure-50',
  respondeu: 'border-amber-300 bg-amber-50',
  interessado: 'border-primary-300 bg-primary-50',
  cliente: 'border-primary-600 bg-primary-100',
  descartado: 'border-red-300 bg-red-50',
};

export default function FunnelPage() {
  const { leads, setStage } = useLeads();

  function moveLead(id: string, currentStage: FunnelStage, direction: 'next' | 'prev') {
    const idx = FUNNEL_STAGES.findIndex((s) => s.value === currentStage);
    if (direction === 'next' && idx < FUNNEL_STAGES.length - 1) {
      setStage(id, FUNNEL_STAGES[idx + 1].value);
    } else if (direction === 'prev' && idx > 0) {
      setStage(id, FUNNEL_STAGES[idx - 1].value);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stone-900">Funil comercial</h1>
        <p className="mt-1 text-stone-600">
          Mova os leads entre etapas usando as setas. As alterações refletem em todas as páginas.
        </p>
      </div>

      <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          <strong>Persistência entre sessões ainda não existe.</strong> As alterações são mantidas
          apenas durante a sessão atual. A integração com backend permitirá salvar permanentemente.
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-7 md:grid-cols-2 sm:grid-cols-1">
        {FUNNEL_STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.value);
          return (
            <div
              key={stage.value}
              className={`flex flex-col rounded-2xl border-2 ${stageColors[stage.value]} p-3 min-h-[200px]`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-stone-800">{stage.label}</h2>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-stone-600">
                  {stageLeads.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '500px' }}>
                {stageLeads.length === 0 ? (
                  <p className="py-4 text-center text-xs text-stone-400">Vazio</p>
                ) : (
                  stageLeads.map((lead) => {
                    const Icon = getCategoryIcon(lead.category);
                    return (
                      <div
                        key={lead.id}
                        className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm transition-all hover:shadow-md"
                      >
                        <Link
                          to={`/app/leads/${lead.id}`}
                          className="block"
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                              <Icon className="h-4 w-4 text-primary-500" />
                            </span>
                            <p className="truncate text-sm font-semibold text-stone-800 hover:text-primary-700">
                              {lead.name}
                            </p>
                          </div>
                          <p className="mt-1 truncate text-xs text-stone-500">
                            {lead.category} · {lead.city ? `${lead.city}, ${lead.state}` : 'Online'}
                          </p>
                          {lead.proposedService && (
                            <p className="mt-1 truncate text-[11px] text-stone-400">
                              {lead.proposedService}
                            </p>
                          )}
                        </Link>
                        <div className="mt-2 flex items-center justify-between">
                          <button
                            onClick={() => moveLead(lead.id, lead.stage, 'prev')}
                            disabled={stage.value === 'novo'}
                            className="inline-flex h-6 w-6 items-center justify-center rounded text-stone-400 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Mover para etapa anterior"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <span className="text-[10px] text-stone-400">{STAGE_LABELS[lead.stage]}</span>
                          <button
                            onClick={() => moveLead(lead.id, lead.stage, 'next')}
                            disabled={stage.value === 'descartado'}
                            className="inline-flex h-6 w-6 items-center justify-center rounded text-stone-400 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Mover para próxima etapa"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
