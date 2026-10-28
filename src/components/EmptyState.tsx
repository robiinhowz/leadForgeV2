import { SearchX } from 'lucide-react';

export default function EmptyState({
  title = 'Nenhum negócio encontrado',
  message = 'Tente remover alguns filtros para ver mais resultados.',
  action,
}: {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-16 text-center">
      <SearchX className="h-10 w-10 text-stone-300" />
      <h3 className="mt-4 text-base font-semibold text-stone-700">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-stone-500">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
