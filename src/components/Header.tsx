import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Rocket } from 'lucide-react';
import Logo from './Logo';

const publicNav = [
  { to: '/', label: 'Início' },
  { to: '/planos', label: 'Planos' },
  { to: '/sobre', label: 'Sobre' },
];

const appNav = [
  { to: '/app', label: 'Dashboard' },
  { to: '/app/leads', label: 'Leads' },
  { to: '/app/mapa', label: 'Mapa' },
  { to: '/app/funil', label: 'Funil' },
  { to: '/app/mensagens', label: 'Mensagens' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const isApp = location.hash.includes('/app');
  const navLinks = isApp ? appNav : publicNav;

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/app/leads?q=${encodeURIComponent(q)}` : '/app/leads');
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden lg:flex items-center gap-7" aria-label="Navegação principal">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/app' || l.to === '/'}
              className={({ isActive }) =>
                `link-underline text-sm font-medium transition-colors ${isActive ? 'active text-primary-700' : 'text-stone-600 hover:text-primary-700'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {isApp && (
            <form onSubmit={submitSearch} role="search" className="relative">
              <label htmlFor="header-search" className="sr-only">Buscar leads</label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                id="header-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar leads..."
                className="w-44 rounded-full border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-sm text-stone-700 transition-all focus:w-56 focus:border-primary-400 focus:bg-white"
              />
            </form>
          )}
          <Link
            to={isApp ? '/app/leads' : '/planos'}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-stone-900 shadow-sm transition-all hover:bg-gold-500 hover:shadow active:scale-95"
          >
            <Rocket className="h-4 w-4" />
            {isApp ? 'Buscar empresas' : 'Começar agora'}
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-stone-700 hover:bg-stone-100"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-4 sm:px-6 animate-fade-in">
          {isApp && (
            <form onSubmit={submitSearch} role="search" className="relative mb-4">
              <label htmlFor="mobile-search" className="sr-only">Buscar leads</label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                id="mobile-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar leads..."
                className="w-full rounded-full border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-3 text-sm"
              />
            </form>
          )}
          <nav className="flex flex-col gap-1" aria-label="Navegação móvel">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/app' || l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-stone-700 hover:bg-stone-100'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to={isApp ? '/app/leads' : '/planos'}
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-400 px-4 py-2.5 text-sm font-semibold text-stone-900"
            >
              <Rocket className="h-4 w-4" />
              {isApp ? 'Buscar empresas' : 'Começar agora'}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
