import { useState, Suspense, lazy } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  MapPin, Globe, ExternalLink, ArrowLeft, Info, Star,
  Clock, FileText, Target, MessageSquare, Shield, Save,
} from 'lucide-react';
import { useLeads } from '@/lib/leadsContext';
import { getCategoryIcon, formatDate } from '@/lib/utils';
import {
  STAGE_LABELS, FUNNEL_STAGES, DIGITAL_PRESENCE_LABELS,
} from '@/types';
import type { FunnelStage } from '@/types';
import DemoBadge from '@/components/DemoBadge';

const BusinessMap = lazy(() => import('@/components/BusinessMap'));

const stageColors: Record<string, string> = {
  novo: 'bg-stone-100 text-stone-600',
  para_contatar: 'bg-blue-50 text-blue-700',
  contatado: 'bg-azure-50 text-azure-700',
  respondeu: 'bg-amber-50 text-amber-700',
  interessado: 'bg-primary-50 text-primary-700',
  cliente: 'bg-primary-700 text-white',
  descartado: 'bg-red-50 text-red-600',
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getLead, setStage, setNotes, setProposedService, setNextAction, toggleSaved } = useLeads();
  const lead = id ? getLead(id) : undefined;

  const [notesDraft, setNotesDraft] = useState(lead?.notes ?? '');
  const [serviceDraft, setServiceDraft] = useState(lead?.proposedService ?? '');
  const [actionDraft, setActionDraft] = useState(lead?.nextAction ?? '');
  const [savedFlash, setSavedFlash] = useState(false);

  if (!lead) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <span className="text-7xl font-extrabold text-primary-200">404</span>
        <h1 className="mt-4 text-2xl font-bold text-stone-900">Lead não encontrado</h1>
        <p className="mt-2 text-stone-600">O lead que você procura não existe na base de demonstração.</p>
        <Link
          to="/app/leads"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar aos leads
        </Link>
      </div>
    );
  }

  const Icon = getCategoryIcon(lead.category);

  function saveAll() {
    if (!lead) return;
    setNotes(lead.id, notesDraft);
    setProposedService(lead.id, serviceDraft);
    setNextAction(lead.id, actionDraft);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/app/leads"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar aos leads
      </Link>

      {/* AVISO DEMO */}
      <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Shield className="h-4 w-4 shrink-0" />
        <span>
          <strong>Perfil demonstrativo.</strong> Os dados são fictícios e ilustrativos, não
          representam uma empresa real.
        </span>
        <DemoBadge className="ml-auto" />
      </div>

      {/* HEADER */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div  className="h-3 bg-gradient-to-r from-primary-700 to-primary-500">
          </div>
        <div className="px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-stone-50 shadow-sm sm:h-28 sm:w-28">
              <Icon className="h-10 w-10 text-primary-400" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-stone-900">{lead.name}</h1>
                <button
                  onClick={() => toggleSaved(lead.id)}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${lead.saved ? 'bg-gold-100 text-gold-800' : 'border border-stone-200 text-stone-400 hover:text-gold-600'}`}
                >
                  <Star className={`h-3 w-3 ${lead.saved ? 'fill-gold-500 text-gold-500' : ''}`} />
                  {lead.saved ? 'Salvo' : 'Salvar'}
                </button>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
                <span className="inline-flex items-center gap-1">
                  <Icon className="h-4 w-4 text-primary-500" />
                  {lead.category}
                </span>
                {lead.presenceType !== 'online' && lead.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-red-400" />
                    {lead.city}, {lead.state}
                  </span>
                )}
                {lead.presenceType === 'online' && (
                  <span className="inline-flex items-center gap-1">
                    <Globe className="h-4 w-4 text-azure-500" />
                    Online
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-stone-400">
                <Clock className="h-3.5 w-3.5" />
                Verificado {formatDate(lead.verifiedAt ?? new Date().toISOString())} · Origem: {lead.source}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stageColors[lead.stage] ?? 'bg-stone-100 text-stone-600'}`}>
                {STAGE_LABELS[lead.stage]}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">Pontuação:</span>
                <span className="text-lg font-bold text-primary-700">{lead.opportunityScore}</span>
                <span className="text-xs text-stone-400">/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* CONTEÚDO */}
        <div className="space-y-6">
          {/* Sobre */}
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900">Perfil comercial</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              {lead.longDescription ?? lead.description}
            </p>

            {/* Pontuação */}
            <div className="mt-4 rounded-xl bg-stone-50 border border-stone-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-stone-700">Pontuação de oportunidade</h3>
                <span className="text-xl font-bold text-primary-700">{lead.opportunityScore}</span>
              </div>
              <p className="mt-1 text-xs text-stone-500">
                Estimativa baseada em sinais observáveis (presença de site, WhatsApp, redes sociais,
                tipo de presença). <strong>Não é uma probabilidade real de compra.</strong>
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all"
                  style={{ width: `${lead.opportunityScore}%` }}
                />
              </div>
            </div>

            {/* Presença digital */}
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-stone-700">Presença digital observada</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {lead.digitalPresence.map((d) => (
                  <span key={d} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                    {DIGITAL_PRESENCE_LABELS[d]}
                  </span>
                ))}
              </div>
              <p className="mt-1 text-xs text-stone-400">
                Sinais públicos observados, não verificados ativamente.
              </p>
            </div>
          </section>

          {/* Localização */}
          {lead.coordinates && (
            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-stone-900">Localização</h2>
              <p className="mt-1 text-sm text-stone-500">
                {lead.city}, {lead.state} — coordenadas ilustrativas.
              </p>
              <div className="mt-4 h-64 overflow-hidden rounded-xl border border-stone-200">
                <Suspense fallback={<div className="flex h-full items-center justify-center text-xs text-stone-400">Carregando mapa...</div>}>
                  <BusinessMap
                    leads={[lead]}
                    height="256px"
                    focus={{ coordinates: lead.coordinates, zoom: 13 }}
                  />
                </Suspense>
              </div>
            </section>
          )}

          {/* Notas e campos de gestão */}
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-bold text-stone-900">Gestão do lead</h2>
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-stone-500">Status de prospecção</label>
              <select
                value={lead.stage}
                onChange={(e) => setStage(lead.id, e.target.value as FunnelStage)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-primary-400"
              >
                {FUNNEL_STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Serviço proposto */}
            <div className="mb-4">
              <label htmlFor="d-service" className="mb-1 flex items-center gap-1.5 text-xs font-medium text-stone-500">
                <Target className="h-3.5 w-3.5" />
                Serviço que poderia ser oferecido
              </label>
              <input
                id="d-service"
                type="text"
                value={serviceDraft}
                onChange={(e) => setServiceDraft(e.target.value)}
                placeholder="Ex: Landing page, Marketing digital, Edição de vídeos..."
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-primary-400"
              />
            </div>

            {/* Próxima ação */}
            <div className="mb-4">
              <label htmlFor="d-action" className="mb-1 flex items-center gap-1.5 text-xs font-medium text-stone-500">
                <MessageSquare className="h-3.5 w-3.5" />
                Próxima ação
              </label>
              <input
                id="d-action"
                type="text"
                value={actionDraft}
                onChange={(e) => setActionDraft(e.target.value)}
                placeholder="Ex: Enviar proposta, Agendar call..."
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-primary-400"
              />
            </div>

            {/* Notas */}
            <div className="mb-4">
              <label htmlFor="d-notes" className="mb-1 block text-xs font-medium text-stone-500">Notas privadas</label>
              <textarea
                id="d-notes"
                rows={4}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Suas anotações sobre este lead..."
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-primary-400"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={saveAll}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
              >
                <Save className="h-4 w-4" />
                Salvar alterações
              </button>
              {savedFlash && (
                <span className="text-sm text-primary-600 animate-fade-in">Alterações salvas!</span>
              )}
            </div>
            <p className="mt-2 text-xs text-stone-400">
              As alterações são salvas apenas nesta sessão. A persistência entre sessões será implementada com o backend.
            </p>
          </section>

          {/* Histórico de atividades */}
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900">Histórico de atividades</h2>
            <ul className="mt-4 space-y-3">
              {lead.activities.map((a) => (
                <li key={a.id} className="flex items-start gap-3 border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-400" />
                  <div>
                    <p className="text-sm text-stone-700">{a.description}</p>
                    <p className="text-xs text-stone-400">{formatDate(a.date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* CANAIS OFICIAIS */}
        <aside className="space-y-4">
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-stone-800">Canais públicos</h2>
            <p className="mt-1 text-xs text-stone-400">
              Links disponíveis apenas quando existem. Não inventamos contatos.
            </p>
            <div className="mt-3 space-y-2">
              {lead.website && (
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 hover:border-primary-300 hover:bg-primary-50"
                >
                  <Globe className="h-4 w-4 text-primary-600" />
                  <span className="flex-1">Site</span>
                  <ExternalLink className="h-3.5 w-3.5 text-stone-400" />
                </a>
              )}
              {lead.whatsapp && (
                <a
                  href={`https://wa.me/${lead.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 hover:border-primary-300 hover:bg-primary-50"
                >
                  <MessageSquare className="h-4 w-4 text-primary-600" />
                  <span className="flex-1">WhatsApp</span>
                  <ExternalLink className="h-3.5 w-3.5 text-stone-400" />
                </a>
              )}
              {lead.socialLinks?.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 hover:border-primary-300 hover:bg-primary-50"
                >
                  <ExternalLink className="h-4 w-4 text-primary-600" />
                  <span className="flex-1">{s.label}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-stone-400" />
                </a>
              ))}
              {!lead.website && !lead.whatsapp && !lead.socialLinks?.length && (
                <p className="text-xs text-stone-400">
                  Nenhum canal público definido neste perfil.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-stone-400" />
              <p className="text-xs text-stone-500">
                Não afirmamos que uma empresa não tem site sem verificação válida.
                Dados não verificados são diferenciados de dados verificados.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
