import { Link, useNavigate } from 'react-router-dom';
import { Flame, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <Flame className="h-12 w-12 text-primary-300" />
      <span className="mt-4 text-7xl font-extrabold text-primary-200">404</span>
      <h1 className="mt-2 text-2xl font-bold text-stone-900">Página não encontrada</h1>
      <p className="mt-2 text-stone-600">
        A página que você procura não existe ou foi movida.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 hover:border-primary-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
        >
          <Home className="h-4 w-4" />
          Ir para o início
        </Link>
      </div>
    </div>
  );
}
