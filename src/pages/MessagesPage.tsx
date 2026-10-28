import { useState } from 'react';
import { messageTemplates } from '@/data/businesses';
import type { MessageTemplate } from '@/types';
import { Copy, Check, Pencil, Info, MessageSquare } from 'lucide-react';
import { useLeads } from '@/lib/leadsContext';

export default function MessagesPage() {
  const { leads } = useLeads();
  const [selectedId, setSelectedId] = useState(messageTemplates[0]?.id ?? '');
  const [templates, setTemplates] = useState<MessageTemplate[]>(messageTemplates);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [copied, setCopied] = useState(false);

  const selected = templates.find((t) => t.id === selectedId) ?? templates[0];
  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  function fillTemplate(body: string): string {
    const empresa = selectedLead?.name ?? '{{empresa}}';
    return body.replace(/\{\{empresa\}\}/g, empresa);
  }

  function startEdit() {
    setDraft(selected.body);
    setEditing(true);
  }

  function saveEdit() {
    setTemplates((prev) => prev.map((t) => (t.id === selected.id ? { ...t, body: draft } : t)));
    setEditing(false);
  }

  async function copyToClipboard() {
    const text = fillTemplate(selected.body);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stone-900">Modelos de mensagem</h1>
        <p className="mt-1 text-stone-600">
          Modelos de abordagem para diferentes serviços. Edite, personalize e copie — mas sempre
          adapte para cada lead.
        </p>
      </div>

      <div className="mb-4 flex items-start gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          Estes modelos são pontos de partida. Abordagens personalizadas, honestas e respeitosas
          geram melhores resultados. <strong>Não enviamos mensagens automaticamente.</strong>
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* LISTA DE MODELOS */}
        <div className="space-y-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => { setSelectedId(t.id); setEditing(false); }}
              className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all ${selectedId === t.id ? 'border-primary-400 bg-primary-50' : 'border-stone-200 bg-white hover:border-primary-200'}`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                <MessageSquare className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-stone-900">{t.title}</p>
                <p className="text-xs text-stone-500">{t.service}</p>
              </div>
            </button>
          ))}
        </div>

        {/* DETALHE DO MODELO */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          {selected && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">{selected.title}</h2>
                  <p className="text-sm text-stone-500">{selected.service}</p>
                </div>
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <button
                        onClick={() => setEditing(false)}
                        className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={saveEdit}
                        className="rounded-lg bg-primary-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-800"
                      >
                        Salvar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={startEdit}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>
                  )}
                </div>
              </div>

              {/* SELETOR DE LEAD */}
              <div className="mb-4">
                <label htmlFor="lead-select" className="mb-1 block text-xs font-medium text-stone-500">
                  Personalizar para o lead (opcional)
                </label>
                <select
                  id="lead-select"
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-primary-400"
                >
                  <option value="">Sem personalização — mostrar variáveis</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              {/* CORPO DA MENSAGEM */}
              {editing ? (
                <textarea
                  rows={14}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm leading-relaxed text-stone-700 focus:border-primary-400 focus:bg-white"
                />
              ) : (
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-stone-700">
                    {fillTemplate(selected.body)}
                  </pre>
                </div>
              )}

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copiado!' : 'Copiar mensagem'}
                </button>
                <p className="text-xs text-stone-400">
                  A variável <code className="rounded bg-stone-100 px-1">{'{{empresa}}'}</code> é
                  substituída pelo nome do lead selecionado.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
