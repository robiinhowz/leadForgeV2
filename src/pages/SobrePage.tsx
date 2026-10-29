import { Link } from 'react-router-dom';
import {
  Flame, Search, Target, BarChart3, Rocket, ShieldAlert,
  BookOpen, ArrowRight,
} from 'lucide-react';
import DemoBadge from '@/components/DemoBadge';

const features = [
  { icon: Search, title: 'Busca de empresas', text: 'Encontre leads por nicho, região, presença digital e tipo de negócio. Cada resultado mostra origem e data de verificação.' },
  { icon: BarChart3, title: 'Pontuação de oportunidade', text: 'Uma estimativa baseada em sinais observáveis ajuda a priorizar. Não é probabilidade real de compra — é um guia.' },
  { icon: Target, title: 'Funil comercial', text: 'Acompanhe leads desde o primeiro contato até o fechamento. Mova entre etapas e mantenha o controle.' },
  { icon: Rocket, title: 'Modelos de abordagem', text: 'Modelos editáveis para sites, landing pages, marketing digital e edição de vídeos. Personalize antes de enviar.' },
];

export default function SobrePage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-primary-50 to-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-3 py-1 text-xs font-medium text-stone-600 shadow-sm">
            <Flame className="h-3.5 w-3.5 text-primary-600" />
            Sobre o LeadForge
          </span>
          <h1 className="mt-6 text-4xl font-extrabold text-stone-900 sm:text-5xl">
            Prospecção comercial <span className="text-primary-700">com organização</span>
          </h1>
          <p className="mt-5 text-lg text-stone-600">
            O LeadForge é uma ferramenta de prospecção para freelancers, agências e pequenos negócios.
            Encontre oportunidades, organize contatos e acompanhe cada abordagem — sem planilhas
            espalhadas.
          </p>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-stone-900">O que você pode fazer</h2>
            <p className="mt-2 text-stone-600">Do primeiro lead ao cliente conquistado.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <f.icon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-stone-900">{f.title}</h3>
                  <p className="mt-1 text-sm text-stone-600">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-50 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <BookOpen className="mt-1 h-6 w-6 shrink-0 text-primary-600" />
            <div>
              <h2 className="text-xl font-bold text-stone-900">Nossos princípios</h2>
              <ul className="mt-3 space-y-2 text-sm text-stone-600">
                <li className="flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-primary-500" />
                  <span>Não prometemos leads exclusivos, vendas garantidas ou resultados.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-primary-500" />
                  <span>A disponibilidade de dados depende das fontes integradas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-primary-500" />
                  <span>Não inferimos características pessoais dos contatos. Exibimos sinais públicos observáveis.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-primary-500" />
                  <span>A pontuação de oportunidade é uma estimativa, não uma probabilidade real de compra.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-primary-50 to-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-8 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <DemoBadge />
            </div>
            <h2 className="text-xl font-bold text-stone-900">Versão demonstrativa</h2>
            <p className="mt-2 text-sm text-amber-800">
              Esta versão utiliza <strong>dados demonstrativos fictícios</strong>. Todas as empresas,
              contatos e coordenadas são ilustrativos. A persistência entre sessões ainda não está
              disponível. Na integração com backend, os dados serão substituídos por fontes reais.
            </p>
            <Link
              to="/app"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
            >
              <Rocket className="h-4 w-4" />
              Explorar a plataforma
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
