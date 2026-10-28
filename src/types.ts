export type Category =
  | 'Alimentação'
  | 'Moda e acessórios'
  | 'Casa e decoração'
  | 'Serviços profissionais'
  | 'Comércio e lojas virtuais'
  | 'Criadores de conteúdo'
  | 'Tecnologia'
  | 'Outros negócios';

export type ProfileType = 'empresa' | 'profissional' | 'criador';

export type PresenceType = 'fisico' | 'online' | 'ambos';

export type StateUF =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export type FunnelStage =
  | 'novo'
  | 'para_contatar'
  | 'contatado'
  | 'respondeu'
  | 'interessado'
  | 'cliente'
  | 'descartado';

export type DigitalPresence =
  | 'site'
  | 'instagram'
  | 'whatsapp'
  | 'youtube'
  | 'tiktok'
  | 'nenhuma';

export interface SocialLink {
  platform: string;
  label: string;
  url: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LeadActivity {
  id: string;
  date: string;
  type: 'nota' | 'status' | 'contato' | 'criacao';
  description: string;
}

export interface Lead {
  id: string;
  slug: string;
  name: string;
  category: Category;
  profileType: ProfileType;
  description: string;
  longDescription?: string;
  city?: string;
  state?: StateUF;
  presenceType: PresenceType;
  coordinates?: Coordinates;
  website?: string;
  whatsapp?: string;
  socialLinks?: SocialLink[];
  image?: string;
  summary: string;
  isDemo: boolean;
  /** Origem do registro (ex.: "Base de demonstração", "Importação CSV"). */
  source: string;
  /** Data de verificação do registro (ISO date string). */
  verifiedAt?: string;
  /** Presenças digitais observadas (sinais públicos, não verificados ativamente). */
  digitalPresence: DigitalPresence[];
  /** Pontuação demonstrativa de oportunidade (0–100). Estimativa baseada em sinais observáveis. */
  opportunityScore: number;
  /** Status de prospecção no funil. */
  stage: FunnelStage;
  /** Notas privadas do usuário. */
  notes: string;
  /** Serviço que poderia ser oferecido a este lead. */
  proposedService?: string;
  /** Próxima ação planejada. */
  nextAction?: string;
  /** Histórico de atividades demonstrativo. */
  activities: LeadActivity[];
  /** Indica se o lead foi salvo pelo usuário. */
  saved: boolean;
  /** Identificador do objeto na fonte original (ex.: node/123456 do OpenStreetMap). */
  sourceId?: string;
  /** URL do objeto na fonte original (ex.: openstreetmap.org/node/123456). */
  sourceUrl?: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  service: string;
  body: string;
}

export const CATEGORIES: { name: Category; icon: string }[] = [
  { name: 'Alimentação', icon: 'UtensilsCrossed' },
  { name: 'Moda e acessórios', icon: 'Shirt' },
  { name: 'Casa e decoração', icon: 'House' },
  { name: 'Serviços profissionais', icon: 'Briefcase' },
  { name: 'Comércio e lojas virtuais', icon: 'ShoppingCart' },
  { name: 'Criadores de conteúdo', icon: 'Video' },
  { name: 'Tecnologia', icon: 'Cpu' },
  { name: 'Outros negócios', icon: 'Store' },
];

export const FUNNEL_STAGES: { value: FunnelStage; label: string }[] = [
  { value: 'novo', label: 'Novo' },
  { value: 'para_contatar', label: 'Para contatar' },
  { value: 'contatado', label: 'Contatado' },
  { value: 'respondeu', label: 'Respondeu' },
  { value: 'interessado', label: 'Interessado' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'descartado', label: 'Descartado' },
];

export const STAGE_LABELS: Record<FunnelStage, string> = {
  novo: 'Novo',
  para_contatar: 'Para contatar',
  contatado: 'Contatado',
  respondeu: 'Respondeu',
  interessado: 'Interessado',
  cliente: 'Cliente',
  descartado: 'Descartado',
};

export const DIGITAL_PRESENCE_LABELS: Record<DigitalPresence, string> = {
  site: 'Site',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  nenhuma: 'Sem presença observada',
};
