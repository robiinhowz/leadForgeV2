import { Link } from 'react-router-dom';
import { CheckCircle2, Info, Sparkles, Zap, Building2 } from 'lucide-react';
import DemoBadge from '@/components/DemoBadge';

const plans = [
  {
    name: 'Inicial',
    price: 'R$ 29,90',
    period: '/mês',
    icon: Sparkles,
    features: [
      'Acesso ao buscador de leads',
      'Filtros por nicho, estado e cidade',
      'Funil comercial com etapas',
      'Notas privadas por lead',
      'Mapa de oportunidades',
      'Modelos de mensagem editáveis',
    ],
    highlight: false,
  },
  {
    name: 'Profissional',
    price: 'Em breve',
    period: '',
    icon: Zap,
    features: [
      'Tudo do plano Inicial',
      'Importação e exportação de leads',
      'Múltiplos funis personalizados',
      'Histórico de atividades detalhado',
      'Métricas e relatórios de prospecção',
      'Integrações com fontes de dados',
    ],
    highlight: true,
  },
];

export default function PlanosPage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-primary-50 to-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-3 py-1 text-xs font-medium text-stone-600 shadow-sm">
            <Building2 className="h-3.5 w-3.5 text-primary-600" />
            Planos LeadForge
          </span>
          <h1 className="mt-6 text-4xl font-extrabold text-stone-900 sm:text-5xl">
            Planos para prospectar <span className="text-primary-700">com organização</span>
          </h1>
          <p className="mt-5 text-lg text-stone-600">
            Comece com um plano de entrada acessível. Os limites e funcionalidades finais dependerão
            das fontes de dados e dos custos operacionais.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <DemoBadge />
            <span className="text-sm text-stone-500">
              Planos demonstrativos — assinatura ainda não disponível.
            </span>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border-2 p-8 shadow-sm ${plan.highlight ? 'border-primary-600 bg-white shadow-lg' : 'border-stone-200 bg-stone-50'}`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-700 px-3 py-0.5 text-xs font-bold text-white">
                    Futuro
                  </span>
                )}
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <plan.icon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <h2 className="mt-4 text-xl font-bold text-stone-900">{plan.name}</h2>
                <p className="mt-2 text-4xl font-extrabold text-stone-900">
                  {plan.price}
                  {plan.period && <span className="text-lg font-medium text-stone-400">{plan.period}</span>}
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-stone-700">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.highlight ? (
                  <div className="mt-6 rounded-lg bg-stone-100 p-3 text-center text-sm text-stone-500">
                    Em desenvolvimento. Notificaremos quando disponível.
                  </div>
                ) : (
                  <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 p-3 text-center text-sm text-amber-700">
                    Assinatura ainda não disponível nesta versão demonstrativa.
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-6">
            <Info className="h-5 w-5 mt-0.5 shrink-0 text-stone-400" />
            <div>
              <h3 className="text-sm font-bold text-stone-800">Sobre os valores</h3>
              <p className="mt-1 text-sm text-stone-600">
                Os valores apresentados são uma <strong>proposta inicial</strong> e estão sujeitos a
                validação. Os limites de uso e as funcionalidades finais de cada plano dependerão das
                fontes de dados integradas e dos custos operacionais. Não criamos botões de checkout
                falsos — quando a assinatura estiver disponível, o processo será real e transparente.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-700 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-800"
            >
              Explar a plataforma gratuita
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
