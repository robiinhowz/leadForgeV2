import { AlertTriangle } from 'lucide-react';

export default function MapError({ message }: { message?: string }) {
  return (
    <div className="flex h-full min-h-[320px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50 p-6 text-center">
      <AlertTriangle className="h-8 w-8 text-red-400" />
      <p className="mt-3 text-sm font-semibold text-red-700">
        {message ?? 'Não foi possível carregar o mapa.'}
      </p>
      <p className="mt-1 text-xs text-red-500">
        Verifique sua conexão. Você ainda pode navegar pela lista de negócios.
      </p>
    </div>
  );
}
