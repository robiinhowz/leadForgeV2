import { Link } from 'react-router-dom';
import {
  Search, ArrowRight, Rocket, Target, ListChecks, MapPin, BarChart3,
  ShieldCheck, Info, Sparkles,
} from 'lucide-react';
import { useLeads } from '@/lib/leadsContext';

export default function HomePage() {
  const { leads } = useLeads();
  const savedCount = leads.filter((l) => l.saved).length;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white">
        <div className="absolute inset-0 opacity-[0.04]" aria-hidden>
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-primary-600 blur-3xl" />
          <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-gold-400 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-3 py-1 text-xs font-medium text-stone-600 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary-600" />
              Prospecção comercial para freelancers e agências
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-5xl">
              Encontre empresas que podem se tornar <span className="text-primary-700">seus próximos clientes</span>.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-stone-600">
              Busque oportunidades, organize contatos, priorize por sinais observáveis e acompanhe
              cada abordagem em um único lugar.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/app"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-800 active:scale-95"
              >
                <Rocket className="h-4 w-4" />
                Conhecer a plataforma
              </Link>
              <Link
                to="/planos"
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-6 py-3.5 text-sm font-semibold text-stone-700 transition-all hover:border-primary-300 hover:text-primary-700"
              >
                Ver planos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-stone-400">
              <Info className="h-3.5 w-3.5" />
              Versão demonstrativa — {leads.length} empresas fictícias para explorar
            </p>
          </div>
        </div>
      </section>

      {/* PREVIA DA INTERFACE */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-stone-900">Tudo em um lugar</h2>
            <p className="mx-auto mt-2 max-w-2xl text-stone-600">
              Da busca à abordagem, do funil ao acompanhamento — sem planilhas espalhadas.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { icon: Search, title: 'Busque empresas', text: 'Filtre por nicho, região, presença digital e tipo de negócio. Cada resultado mostra a origem e a data de verificação.' },
              { icon: BarChart3, title: 'Priorize oportunidades', text: 'Uma pontuação demonstrativa baseada em sinais observáveis ajuda a decidar por onde começar — não é probabilidade real de compra.' },
              { icon: ListChecks, title: 'Organize contatos', text: 'Salve leads, adicione notas privadas, defina o serviço que oferece e marque a próxima ação de cada um.' },
              { icon: Target, title: 'Acompanhe no funil', text: 'Mova leads entre etapas — de novo a cliente — e veja o progresso em uma visão de funil clara.' },
              { icon: MapPin, title: 'Mapa de oportunidades', text: 'Visualize empresas com localização válida no mapa. Empresas sem coordenadas não recebem marcadores inventados.' },
              { icon: Rocket, title: 'Aborde com modelos', text: 'Modelos de mensagem para sites, landing pages, marketing digital e edição de vídeos — personalize antes de enviar.' },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl border border-stone-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary-200">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <f.icon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <h3 className="mt-4 text-lg font-bold text-stone-900">{f.title}</h3>
                <p className="mt-2 text-sm text-stone-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRANSPARÊNCIA */}
      <section className="bg-stone-50 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
            <ShieldCheck className="mx-auto h-10 w-10 text-primary-600" />
            <h2 className="mt-4 text-2xl font-bold text-stone-900">Transparência sobre os dados</h2>
            <p className="mt-3 text-sm text-stone-600">
              A disponibilidade de leads depende das fontes integradas. Não prometemos leads
              exclusivos, vendas garantidas ou resultados. As informações exibidas são sinais
              públicos observáveis — não inferências sobre pessoas. A pontuação de oportunidade é
              uma estimativa baseada nesses sinais, não uma probabilidade real de compra.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-stone-400">
              <Info className="h-3.5 w-3.5" />
              <span>Dados de demonstração fictícios. Integração com fontes reais em desenvolvimento.</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-gold-200 bg-gradient-to-br from-gold-50 to-white p-8 sm:p-12">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-700 text-gold-400">
                <Rocket className="h-8 w-8" />
              </span>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-stone-900">Comece a prospectar hoje</h2>
                <p className="mt-2 text-sm text-stone-600">
                  Explore a plataforma com dados de demonstração. Sem cadastro, sem pagamento —
                  apenas navegue e veja como funciona.
                </p>
                <p className="mt-1 text-xs text-stone-400">
                  {leads.length} empresas fictícias · {savedCount} salvas na sessão atual
                </p>
              </div>
              <Link
                to="/app"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary-700 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-800 active:scale-95"
              >
                Abrir plataforma
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
