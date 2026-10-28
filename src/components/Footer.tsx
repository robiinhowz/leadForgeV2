import { Link } from 'react-router-dom';
import { Flame, Mail, Shield } from 'lucide-react';
import Logo from './Logo';

const footerLinks = [
  { to: '/', label: 'Início' },
  { to: '/app', label: 'Plataforma' },
  { to: '/planos', label: 'Planos' },
  { to: '/sobre', label: 'Sobre' },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <Logo />
            <p className="text-sm text-stone-500 max-w-xs">
              Ferramenta de prospecção comercial para freelancers, agências e pequenos negócios.
              Encontre oportunidades, organize contatos e conquiste clientes.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-stone-800">Navegação</h3>
            <ul className="space-y-2">
              {footerLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-stone-500 hover:text-primary-700 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="mb-1 text-sm font-semibold text-stone-800">Avisos</h3>
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
              <Shield className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                Esta é uma <strong>versão demonstrativa em desenvolvimento</strong>. Os dados exibidos
                são fictícios e ilustrativos. A persistência entre sessões ainda não está disponível.
              </p>
            </div>
            <a
              href="mailto:contato@leadforge.com.br"
              className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-primary-700"
            >
              <Mail className="h-4 w-4" />
              contato@leadforge.com.br
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-stone-100 pt-6 sm:flex-row">
          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} LeadForge. Projeto demonstrativo.
          </p>
          <div className="flex items-center gap-1 text-xs text-stone-400">
            <Flame className="h-3.5 w-3.5 text-primary-600" />
            <span>Encontre oportunidades. Organize contatos. Conquiste clientes.</span>
          </div>
          <span className="text-xs text-stone-400">
            Mapa: © contribuidores do{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary-700"
            >
              OpenStreetMap
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
