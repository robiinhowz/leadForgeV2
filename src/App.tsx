import { Component, type ReactNode } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import DashboardPage from '@/pages/DashboardPage';
import LeadsPage from '@/pages/LeadsPage';
import LeadDetailPage from '@/pages/LeadDetailPage';
import MapPage from '@/pages/MapPage';
import FunnelPage from '@/pages/FunnelPage';
import MessagesPage from '@/pages/MessagesPage';
import PlanosPage from '@/pages/PlanosPage';
import SobrePage from '@/pages/SobrePage';
import NotFoundPage from '@/pages/NotFoundPage';

const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/app', element: <DashboardPage /> },
      { path: '/app/leads', element: <LeadsPage /> },
      { path: '/app/leads/:id', element: <LeadDetailPage /> },
      { path: '/app/mapa', element: <MapPage /> },
      { path: '/app/funil', element: <FunnelPage /> },
      { path: '/app/mensagens', element: <MessagesPage /> },
      { path: '/planos', element: <PlanosPage /> },
      { path: '/sobre', element: <SobrePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message?: string }> {
  state = { hasError: false, message: undefined as string | undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 text-center">
          <h1 className="text-2xl font-bold text-stone-900">Algo deu errado</h1>
          <p className="mt-2 max-w-md text-sm text-stone-600">
            A aplicação encontrou um erro ao carregar. Tente recarregar a página.
          </p>
          {this.state.message && (
            <pre className="mt-4 max-w-md overflow-auto rounded-lg bg-stone-100 p-3 text-left text-xs text-stone-500">
              {this.state.message}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <RouterProvider router={router} />
    </AppErrorBoundary>
  );
}
