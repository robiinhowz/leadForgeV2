import type { Lead } from '@/types';
import { Link } from 'react-router-dom';
import { MapPin, Globe, ArrowRight, Star, Clock } from 'lucide-react';
import DemoBadge from './DemoBadge';
import { getCategoryIcon, formatDate } from '@/lib/utils';
import { STAGE_LABELS } from '@/types';

const stageColors: Record<string, string> = {
  novo: 'bg-stone-100 text-stone-600',
  para_contatar: 'bg-blue-50 text-blue-700',
  contatado: 'bg-azure-50 text-azure-700',
  respondeu: 'bg-amber-50 text-amber-700',
  interessado: 'bg-primary-50 text-primary-700',
  cliente: 'bg-primary-700 text-white',
  descartado: 'bg-red-50 text-red-600',
};

export default function LeadCard({ lead }: { lead: Lead }) {
  const Icon = getCategoryIcon(lead.category);
  const presenceLabel =
    lead.presenceType === 'fisico'
      ? 'Presença física'
      : lead.presenceType === 'online'
        ? 'Exclusivamente online'
        : 'Físico e online';

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary-200">
      <Link to={`/app/leads/${lead.id}`} className="flex flex-1 flex-col">
        <div className="relative">
          <div className="flex h-28 w-full items-center justify-center bg-gradient-to-br from-primary-50 to-stone-100 transition-transform duration-500 group-hover:scale-105">
            <Icon className="h-10 w-10 text-primary-300" strokeWidth={1.5} />
          </div>
          <div className="absolute left-3 top-3">
            <DemoBadge />
          </div>
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-medium text-stone-700 backdrop-blur">
            <Icon className="h-3 w-3" />
            {lead.category}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-base font-bold text-stone-900 group-hover:text-primary-700 transition-colors">
            {lead.name}
          </h3>

          <div className="mt-1 flex items-center gap-2 text-xs text-stone-500">
            {lead.presenceType !== 'online' && lead.city ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary-500" />
                {lead.city}, {lead.state}
              </span>
            ) : lead.presenceType === 'online' ? (
              <span className="inline-flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-azure-500" />
                Online
              </span>
            ) : null}
          </div>

          <p className="mt-3 text-sm text-stone-600 line-clamp-2">{lead.summary}</p>

          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${stageColors[lead.stage] ?? 'bg-stone-100 text-stone-600'}`}>
              {STAGE_LABELS[lead.stage]}
            </span>
            {lead.saved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-semibold text-gold-800">
                <Star className="h-3 w-3 fill-gold-500 text-gold-500" />
                Salvo
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-stone-400">{presenceLabel}</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-stone-400">
                <Clock className="h-3 w-3" />
                Verificado {formatDate(lead.verifiedAt ?? new Date().toISOString())}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 group-hover:gap-2 transition-all">
              Ver detalhes
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
