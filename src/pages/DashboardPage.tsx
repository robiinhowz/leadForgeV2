import { Link } from 'react-router-dom';
import {
  Users, MessageCircle, Clock, Trophy, ArrowRight, Search,
  Target, Info, TrendingUp,
} from 'lucide-react';
import { useLeads } from '@/lib/leadsContext';
import { STAGE_LABELS } from '@/types';
import type { FunnelStage } from '@/types';
import { getCategoryIcon, formatDate } from '@/lib/utils';
import DemoBadge from '@/components/DemoBadge';

export default function DashboardPage() {
  const { leads } = useLeads();

  const stats = {
    saved: leads.filter((l) => l.saved).length,
    contacted: leads.filter((l) =>
      ['contatado', 'respondeu', 'interessado', 'cliente'].includes(l.stage),
    ).length,
    followUps: leads.filter((l) => l.nextAction && l.stage !== 'cliente' && l.stage !== 'descartado').length,
    clients: leads.filter((l) => l.stage === 'cliente').length,
  };

  const recentActivities = leads
    .flatMap((l) => l.activities.map((a) => ({ ...a, leadName: l.name, leadId: l.id })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const pendingFollowUps = leads
    .filter((l) => l.nextAction && l.stage !== 'cliente' && l.stage !== 'descartado')
    .slice(0, 5);

  const cards = [
    { icon: Users, label: 'Leads salvos', value: stats.saved, color: 'text-primary-600', bg: 'bg-primary-50' },
    { icon: MessageCircle, label: 'Contatados', value: stats.contacted, color: 'text-azure-600', bg: 'bg-azure-50' },
    { icon: Clock, label: 'Follow-ups pendentes', value: stats.followUps, color: 'text-gold-600', bg: 'bg-gold-50' },
    { icon: Trophy, label: 'Clientes conquistados', value: stats.clients, color: 'text-primary-700', bg: 'bg-primary-100' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* AVISO DEMO */}
      <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Info className="h-4 w-4 shrink-0" />
        <span>
          <strong>Dashboard demonstrativo.</strong> Os números abaixo são calculados a partir de
          dados fictícios de demonstração, não representam resultados reais.
        </span>
        <DemoBadge className="ml-auto" />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Dashboard</h1>
        <p className="mt-1 text-stone-600">Visão geral da sua prospecção comercial.</p>
      </div>

      {/* CARDS DE MÉTRICAS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} ${c.color}`}>
                <c.icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <span className="text-3xl font-extrabold text-stone-900">{c.value}</span>
            </div>
            <p className="mt-3 text-sm font-medium text-stone-500">{c.label}</p>
          </div>
        ))}
      </div>

      {/* ATALHOS */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          to="/app/leads"
          className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Search className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <h3 className="text-base font-bold text-stone-900">Buscar empresas</h3>
            <p className="text-sm text-stone-500">Encontre novos leads por nicho e região.</p>
          </div>
          <ArrowRight className="h-5 w-5 text-stone-300 group-hover:text-primary-600" />
        </Link>
        <Link
          to="/app/funil"
          className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-50 text-gold-600">
            <Target className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <h3 className="text-base font-bold text-stone-900">Abrir funil</h3>
            <p className="text-sm text-stone-500">Veja seus leads por etapa de prospecção.</p>
          </div>
          <ArrowRight className="h-5 w-5 text-stone-300 group-hover:text-primary-600" />
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* ATIVIDADES RECENTES */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <h2 className="text-base font-bold text-stone-900">Atividades recentes</h2>
          </div>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-stone-400">Nenhuma atividade ainda.</p>
          ) : (
            <ul className="space-y-3">
              {recentActivities.map((a) => (
                <li key={a.id} className="flex items-start gap-3 border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-stone-700">{a.description}</p>
                    <p className="text-xs text-stone-400">
                      {a.leadName} · {formatDate(a.date)}
                    </p>
                  </div>
                  <Link
                    to={`/app/leads/${a.leadId}`}
                    className="shrink-0 text-xs font-medium text-primary-600 hover:underline"
                  >
                    Ver
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* FOLLOW-UPS PENDENTES */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-gold-600" />
            <h2 className="text-base font-bold text-stone-900">Tarefas de acompanhamento</h2>
          </div>
          {pendingFollowUps.length === 0 ? (
            <p className="text-sm text-stone-400">Nenhuma tarefa pendente.</p>
          ) : (
            <ul className="space-y-3">
              {pendingFollowUps.map((l) => {
                const Icon = getCategoryIcon(l.category);
                return (
                  <li key={l.id} className="flex items-center gap-3 border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                      <Icon className="h-4 w-4 text-primary-500" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-stone-800">{l.name}</p>
                      <p className="truncate text-xs text-stone-500">{l.nextAction}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
                      {STAGE_LABELS[l.stage as FunnelStage]}
                    </span>
                    <Link
                      to={`/app/leads/${l.id}`}
                      className="shrink-0 text-xs font-medium text-primary-600 hover:underline"
                    >
                      Abrir
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
