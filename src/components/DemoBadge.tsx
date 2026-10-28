import { Info } from 'lucide-react';

export default function DemoBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200 ${className}`}
    >
      <Info className="h-3 w-3" />
      Demonstração
    </span>
  );
}
