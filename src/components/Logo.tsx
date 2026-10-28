import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group" aria-label="LeadForge — página inicial">
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-700 text-gold-400 shadow-sm transition-transform group-hover:scale-105">
        <Flame className="h-5 w-5" strokeWidth={2.2} />
        <span className="absolute inset-0 rounded-xl ring-1 ring-gold-400/40" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-extrabold text-base tracking-tight text-primary-800">
            LeadForge
          </span>
          <span className="text-[11px] font-medium text-stone-500">Prospecção comercial</span>
        </span>
      )}
    </Link>
  );
}
