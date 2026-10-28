import type { Lead } from '@/types';
import { Link } from 'react-router-dom';
import { MapPin, Globe, ArrowRight, Star } from 'lucide-react';
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

export default function LeadListItem({ lead }: { lead: Lead }) {
  const Icon = getCategoryIcon(lead.category);
  return (
    <Link
      to={`/app/leads/${lead.id}`}
      className="group flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 transition-all hover:border-primary-200 hover:shadow-sm"
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-stone-100">
        <Icon className="h-7 w-7 text-primary-400" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-bold text-stone-900 group-hover:text-primary-700">
            {lead.name}
          </h3>
          <DemoBadge />
          {lead.saved && <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />}
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-stone-500">{lead.summary}</p>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-stone-400">
          <span className="inline-flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {lead.category}
          </span>
          {lead.presenceType !== 'online' && lead.city ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {lead.city}, {lead.state}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Online
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            Verificado {formatDate(lead.verifiedAt ?? new Date().toISOString())}
          </span>
        </div>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${stageColors[lead.stage] ?? 'bg-stone-100 text-stone-600'}`}>
        {STAGE_LABELS[lead.stage]}
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-stone-300 group-hover:text-primary-600" />
    </Link>
  );
}
