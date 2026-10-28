import type { Lead, MessageTemplate, DigitalPresence, FunnelStage } from '@/types';

/**
 * Base de dados DEMONSTRATIVA de leads.
 * Todos os registros são fictícios e marcados com isDemo = true.
 * Nomes, coordenadas e contatos NÃO representam empresas reais.
 * Substituir este módulo por uma API/banco de dados na integração futura.
 */

const today = new Date('2026-10-27T00:00:00Z');
function daysAgo(n: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function calcOpportunityScore(opts: {
  website?: string;
  whatsapp?: string;
  socialLinks?: { platform: string }[];
  presenceType: string;
}): number {
  let score = 20;
  if (opts.website) score += 15;
  if (opts.whatsapp) score += 15;
  if (opts.socialLinks?.length) score += opts.socialLinks.length * 10;
  if (opts.presenceType === 'ambos') score += 20;
  if (opts.presenceType === 'fisico') score += 10;
  if (score > 100) score = 100;
  return score;
}

function inferDigitalPresence(opts: {
  website?: string;
  whatsapp?: string;
  socialLinks?: { platform: string }[];
}): DigitalPresence[] {
  const arr: DigitalPresence[] = [];
  if (opts.website) arr.push('site');
  if (opts.whatsapp) arr.push('whatsapp');
  opts.socialLinks?.forEach((s) => {
    if (s.platform === 'instagram' && !arr.includes('instagram')) arr.push('instagram');
    if (s.platform === 'youtube' && !arr.includes('youtube')) arr.push('youtube');
    if (s.platform === 'tiktok' && !arr.includes('tiktok')) arr.push('tiktok');
  });
  return arr.length ? arr : ['nenhuma'];
}

interface RawLead {
  id: string;
  slug: string;
  name: string;
  category: Lead['category'];
  profileType: Lead['profileType'];
  description: string;
  longDescription?: string;
  city?: string;
  state?: Lead['state'];
  presenceType: Lead['presenceType'];
  coordinates?: { lat: number; lng: number };
  website?: string;
  whatsapp?: string;
  socialLinks?: { platform: string; label: string; url: string }[];
  summary: string;
  stage: FunnelStage;
  notes: string;
  proposedService?: string;
  nextAction?: string;
  saved: boolean;
  verifiedDaysAgo: number;
}

const rawLeads: RawLead[] = [
  {
    id: '1',
    slug: 'sabor-da-terra',
    name: 'Sabor da Terra',
    category: 'Alimentação',
    profileType: 'empresa',
    description: 'Restaurante de comida regional com ingredientes de produtores locais.',
    longDescription:
      'O Sabor da Terra é um restaurante fictício dedicado à gastronomia regional brasileira, valorizando ingredientes de produtores locais e pratos que representam a cultura do estado. Este perfil é ilustrativo.',
    city: 'Recife',
    state: 'PE',
    presenceType: 'fisico',
    coordinates: { lat: -8.0476, lng: -34.877 },
    website: 'https://example.com',
    whatsapp: '55819000000000',
    summary: 'Comida regional com ingredientes locais.',
    stage: 'novo',
    notes: '',
    saved: true,
    verifiedDaysAgo: 3,
  },
  {
    id: '2',
    slug: 'trama-brasil',
    name: 'Trama Brasil',
    category: 'Moda e acessórios',
    profileType: 'empresa',
    description: 'Marca de roupas com tecidos sustentáveis e produção ética.',
    longDescription:
      'A Trama Brasil é uma marca fictícia de moda que utiliza tecidos sustentáveis e produção com práticas éticas. Perfil ilustrativo para demonstração da plataforma.',
    city: 'São Paulo',
    state: 'SP',
    presenceType: 'ambos',
    coordinates: { lat: -23.5505, lng: -46.6333 },
    website: 'https://example.com',
    whatsapp: '55119000000000',
    socialLinks: [{ platform: 'instagram', label: 'Instagram', url: 'https://example.com/instagram' }],
    summary: 'Moda sustentável com produção ética.',
    stage: 'contatado',
    notes: 'Responderam asking sobre landing page. Mandar proposta.',
    proposedService: 'Landing page para coleção sustentável',
    nextAction: 'Enviar proposta de landing page',
    saved: true,
    verifiedDaysAgo: 7,
  },
  {
    id: '3',
    slug: 'atelier-madeira',
    name: 'Atelier Madeira',
    category: 'Casa e decoração',
    profileType: 'empresa',
    description: 'Móveis artesanais em madeira de reflorestamento.',
    longDescription:
      'Atelier fictício especializado em móveis artesanais feitos com madeira de reflorestamento, combinando design e responsabilidade ambiental.',
    city: 'Belo Horizonte',
    state: 'MG',
    presenceType: 'ambos',
    coordinates: { lat: -19.9208, lng: -43.9378 },
    website: 'https://example.com',
    summary: 'Móveis artesanais em madeira reflorestada.',
    stage: 'para_contatar',
    notes: 'Site existe mas parece desatualizado. Bom candidato para redesign.',
    proposedService: 'Redesign de site + e-commerce',
    saved: true,
    verifiedDaysAgo: 5,
  },
  {
    id: '4',
    slug: 'dra-helena-martins',
    name: 'Dra. Helena Martins',
    category: 'Serviços profissionais',
    profileType: 'profissional',
    description: 'Advogada especializada em direito do consumidor.',
    longDescription:
      'Perfil ilustrativo de uma advogada fictícia especializada em direito do consumidor, atendendo presencialmente e online.',
    city: 'Porto Alegre',
    state: 'RS',
    presenceType: 'ambos',
    coordinates: { lat: -30.0346, lng: -51.2177 },
    website: 'https://example.com',
    whatsapp: '55519000000000',
    summary: 'Direito do consumidor — presencial e online.',
    stage: 'respondeu',
    notes: 'Interessada em marketing digital. Agendar call.',
    proposedService: 'Marketing digital + gestão de redes',
    nextAction: 'Agendar call de diagnóstico',
    saved: true,
    verifiedDaysAgo: 2,
  },
  {
    id: '5',
    slug: 'loja-cantinho-do-norte',
    name: 'Cantinho do Norte',
    category: 'Comércio e lojas virtuais',
    profileType: 'empresa',
    description: 'Loja virtual de produtos típicos da região amazônica.',
    longDescription:
      'Loja fictícia que comercializa produtos típicos da Amazônia, como castanhas, mel e artesanato, exclusivamente online.',
    presenceType: 'online',
    website: 'https://example.com',
    whatsapp: '55920000000000',
    socialLinks: [{ platform: 'instagram', label: 'Instagram', url: 'https://example.com/instagram' }],
    summary: 'Produtos típicos da Amazônia online.',
    stage: 'novo',
    notes: '',
    saved: false,
    verifiedDaysAgo: 10,
  },
  {
    id: '6',
    slug: 'canal-matuta',
    name: 'Canal Matuta',
    category: 'Criadores de conteúdo',
    profileType: 'criador',
    description: 'Canal sobre cultura sertaneja e vida no interior.',
    longDescription:
      'Perfil fictício de um canal de conteúdo sobre cultura sertaneja, tradições do interior e música caipira. Exclusivamente online.',
    presenceType: 'online',
    socialLinks: [
      { platform: 'youtube', label: 'YouTube', url: 'https://example.com/youtube' },
      { platform: 'instagram', label: 'Instagram', url: 'https://example.com/instagram' },
    ],
    summary: 'Conteúdo sobre cultura sertaneja.',
    stage: 'interessado',
    notes: 'Quer edição de vídeos para o canal. Proposta enviada.',
    proposedService: 'Edição de vídeos para YouTube',
    nextAction: 'Aguardar resposta da proposta',
    saved: true,
    verifiedDaysAgo: 4,
  },
  {
    id: '7',
    slug: 'tech-raiz',
    name: 'Tech Raiz',
    category: 'Tecnologia',
    profileType: 'empresa',
    description: 'Startup de software para pequenos produtores rurais.',
    longDescription:
      'Startup fictícia que desenvolve software de gestão para pequenos produtores rurais, facilitando o controle de produção e vendas.',
    city: 'Florianópolis',
    state: 'SC',
    presenceType: 'ambos',
    coordinates: { lat: -27.5954, lng: -48.5482 },
    website: 'https://example.com',
    summary: 'Software para produtores rurais.',
    stage: 'cliente',
    notes: 'Fechou contrato de landing page + SEO. Em produção.',
    proposedService: 'Landing page + SEO',
    nextAction: 'Iniciar onboarding do projeto',
    saved: true,
    verifiedDaysAgo: 1,
  },
  {
    id: '8',
    slug: 'casa-do-pao-de-queijo',
    name: 'Casa do Pão de Queijo',
    category: 'Alimentação',
    profileType: 'empresa',
    description: 'Cafeteria e padaria com receitas mineiras tradicionais.',
    longDescription:
      'Cafeteria fictícia com receitas mineiras tradicionais de pão de queijo, café e doces. Atendimento presencial.',
    city: 'Ouro Preto',
    state: 'MG',
    presenceType: 'fisico',
    coordinates: { lat: -20.3889, lng: -43.5078 },
    whatsapp: '55319000000000',
    summary: 'Padaria com receitas mineiras.',
    stage: 'novo',
    notes: '',
    saved: false,
    verifiedDaysAgo: 8,
  },
  {
    id: '9',
    slug: 'estilo-praia',
    name: 'Estilo Praia',
    category: 'Moda e acessórios',
    profileType: 'empresa',
    description: 'Loja de moda praia com estampas exclusivas.',
    longDescription:
      'Loja fictícia de moda praia com estampas exclusivas inspiradas no litoral brasileiro. Venda online e física.',
    city: 'Fortaleza',
    state: 'CE',
    presenceType: 'ambos',
    coordinates: { lat: -3.7319, lng: -38.5267 },
    website: 'https://example.com',
    whatsapp: '55850000000000',
    socialLinks: [{ platform: 'instagram', label: 'Instagram', url: 'https://example.com/instagram' }],
    summary: 'Moda praia com estampas exclusivas.',
    stage: 'para_contatar',
    notes: 'Instagram ativo. Bom fit para gestão de redes.',
    proposedService: 'Gestão de Instagram + tráfego pago',
    saved: true,
    verifiedDaysAgo: 6,
  },
  {
    id: '10',
    slug: 'raizes-decor',
    name: 'Raízes Decor',
    category: 'Casa e decoração',
    profileType: 'empresa',
    description: 'Objetos de decoração inspirados em artesanato nordestino.',
    longDescription:
      'Loja fictícia de objetos de decoração inspirados no artesanato nordestino, com venda online e física.',
    city: 'Salvador',
    state: 'BA',
    presenceType: 'ambos',
    coordinates: { lat: -12.9714, lng: -38.5014 },
    website: 'https://example.com',
    summary: 'Decoração com artesanato nordestino.',
    stage: 'novo',
    notes: '',
    saved: false,
    verifiedDaysAgo: 12,
  },
  {
    id: '11',
    slug: 'prof-rafael-oliveira',
    name: 'Prof. Rafael Oliveira',
    category: 'Serviços profissionais',
    profileType: 'profissional',
    description: 'Professor particular de matemática e física.',
    longDescription:
      'Perfil fictício de um professor particular de matemática e física que atende online e presencialmente em Curitiba.',
    city: 'Curitiba',
    state: 'PR',
    presenceType: 'ambos',
    coordinates: { lat: -25.4284, lng: -49.2733 },
    website: 'https://example.com',
    whatsapp: '55410000000000',
    summary: 'Aulas particulares de matemática e física.',
    stage: 'descartado',
    notes: 'Não tem orçamento no momento. Revisitar em 6 meses.',
    saved: false,
    verifiedDaysAgo: 15,
  },
  {
    id: '12',
    slug: 'mercado-raiz-online',
    name: 'Mercado Raiz Online',
    category: 'Comércio e lojas virtuais',
    profileType: 'empresa',
    description: 'Marketplace de produtos naturais e orgânicos.',
    longDescription:
      'Marketplace fictício de produtos naturais e orgânicos de diversos produtores. Exclusivamente online.',
    presenceType: 'online',
    website: 'https://example.com',
    socialLinks: [{ platform: 'instagram', label: 'Instagram', url: 'https://example.com/instagram' }],
    summary: 'Marketplace de produtos naturais online.',
    stage: 'novo',
    notes: '',
    saved: false,
    verifiedDaysAgo: 9,
  },
  {
    id: '13',
    slug: 'marina-cria',
    name: 'Marina Cria',
    category: 'Criadores de conteúdo',
    profileType: 'criador',
    description: 'Criadora de conteúdo sobre literatura brasileira.',
    longDescription:
      'Perfil fictício de uma criadora de conteúdo que produz vídeos e textos sobre literatura brasileira. Exclusivamente online.',
    presenceType: 'online',
    socialLinks: [
      { platform: 'youtube', label: 'YouTube', url: 'https://example.com/youtube' },
      { platform: 'instagram', label: 'Instagram', url: 'https://example.com/instagram' },
      { platform: 'tiktok', label: 'TikTok', url: 'https://example.com/tiktok' },
    ],
    summary: 'Conteúdo sobre literatura brasileira.',
    stage: 'contatado',
    notes: 'Abordagem enviada. Aguardando retorno.',
    proposedService: 'Edição de vídeos + thumbnails',
    saved: true,
    verifiedDaysAgo: 3,
  },
  {
    id: '14',
    slug: 'dev-rural',
    name: 'Dev Rural',
    category: 'Tecnologia',
    profileType: 'empresa',
    description: 'Plataforma de cursos de programação para o interior.',
    longDescription:
      'Plataforma fictícia de cursos de programação voltada para estudantes do interior. Exclusivamente online.',
    city: 'Goiânia',
    state: 'GO',
    presenceType: 'online',
    website: 'https://example.com',
    socialLinks: [{ platform: 'instagram', label: 'Instagram', url: 'https://example.com/instagram' }],
    summary: 'Cursos de programação online.',
    stage: 'novo',
    notes: '',
    saved: false,
    verifiedDaysAgo: 11,
  },
  {
    id: '15',
    slug: 'feira-verde',
    name: 'Feira Verde',
    category: 'Alimentação',
    profileType: 'empresa',
    description: 'Feira de produtos orgânicos direto do produtor.',
    longDescription:
      'Feira fictícia que conecta produtores orgânicos locais aos consumidores, com ponto físico de venda.',
    city: 'Niterói',
    state: 'RJ',
    presenceType: 'fisico',
    coordinates: { lat: -22.8828, lng: -43.1036 },
    website: 'https://example.com',
    whatsapp: '55210000000000',
    summary: 'Produtos orgânicos direto do produtor.',
    stage: 'para_contatar',
    notes: 'Sem site. Oportunidade de criação de site + delivery.',
    proposedService: 'Site + sistema de pedidos online',
    saved: true,
    verifiedDaysAgo: 2,
  },
  {
    id: '16',
    slug: 'boutique-amazonia',
    name: 'Boutique Amazônia',
    category: 'Moda e acessórios',
    profileType: 'empresa',
    description: 'Acessórios com sementes e fibras naturais da Amazônia.',
    longDescription:
      'Boutique fictícia de acessórios confeccionados com sementes e fibras naturais da Amazônia. Venda física e online.',
    city: 'Manaus',
    state: 'AM',
    presenceType: 'ambos',
    coordinates: { lat: -3.119, lng: -60.0217 },
    website: 'https://example.com',
    summary: 'Acessórios com fibras naturais da Amazônia.',
    stage: 'novo',
    notes: '',
    saved: false,
    verifiedDaysAgo: 14,
  },
  {
    id: '17',
    slug: 'arquiteta-juliana-costa',
    name: 'Arquiteta Juliana Costa',
    category: 'Serviços profissionais',
    profileType: 'profissional',
    description: 'Arquitetura residencial com foco em sustentabilidade.',
    longDescription:
      'Perfil fictício de uma arquiteta especializada em projetos residenciais sustentáveis. Atende online e presencialmente.',
    city: 'Brasília',
    state: 'DF',
    presenceType: 'ambos',
    coordinates: { lat: -15.7942, lng: -47.8822 },
    website: 'https://example.com',
    whatsapp: '55610000000000',
    summary: 'Arquitetura residencial sustentável.',
    stage: 'respondeu',
    notes: 'Quer portfólio online. Já tem projetos prontos.',
    proposedService: 'Site portfólio + blog',
    nextAction: 'Enviar proposta de portfólio',
    saved: true,
    verifiedDaysAgo: 4,
  },
  {
    id: '18',
    slug: 'pet-norte',
    name: 'Pet Norte',
    category: 'Outros negócios',
    profileType: 'empresa',
    description: 'Pet shop com produtos para o clima tropical.',
    longDescription:
      'Pet shop fictício especializado em produtos e cuidados para animais em clima tropical. Atendimento físico.',
    city: 'Belém',
    state: 'PA',
    presenceType: 'fisico',
    coordinates: { lat: -1.4558, lng: -48.4902 },
    whatsapp: '55910000000000',
    summary: 'Pet shop para clima tropical.',
    stage: 'novo',
    notes: '',
    saved: false,
    verifiedDaysAgo: 13,
  },
];

function buildActivities(lead: RawLead): Lead['activities'] {
  const acts: Lead['activities'] = [
    {
      id: `${lead.id}-a1`,
      date: daysAgo(lead.verifiedDaysAgo),
      type: 'criacao',
      description: 'Lead adicionado à base de demonstração.',
    },
  ];
  if (lead.stage === 'contatado' || lead.stage === 'respondeu' || lead.stage === 'interessado' || lead.stage === 'cliente') {
    acts.push({
      id: `${lead.id}-a2`,
      date: daysAgo(lead.verifiedDaysAgo - 1),
      type: 'contato',
      description: 'Primeira abordagem enviada.',
    });
  }
  if (lead.stage === 'respondeu' || lead.stage === 'interessado' || lead.stage === 'cliente') {
    acts.push({
      id: `${lead.id}-a3`,
      date: daysAgo(lead.verifiedDaysAgo - 2),
      type: 'status',
      description: 'Lead respondeu à abordagem.',
    });
  }
  if (lead.stage === 'cliente') {
    acts.push({
      id: `${lead.id}-a4`,
      date: daysAgo(lead.verifiedDaysAgo - 3),
      type: 'status',
      description: 'Contrato assinado. Lead convertido em cliente.',
    });
  }
  return acts;
}

export const leads: Lead[] = rawLeads.map((r) => {
  const digitalPresence = inferDigitalPresence({
    website: r.website,
    whatsapp: r.whatsapp,
    socialLinks: r.socialLinks,
  });
  return {
    ...r,
    isDemo: true,
    source: 'Base de demonstração',
    verifiedAt: daysAgo(r.verifiedDaysAgo),
    digitalPresence,
    opportunityScore: calcOpportunityScore({
      website: r.website,
      whatsapp: r.whatsapp,
      socialLinks: r.socialLinks,
      presenceType: r.presenceType,
    }),
    activities: buildActivities(r),
  };
});

export const messageTemplates: MessageTemplate[] = [
  {
    id: 'tpl-site',
    title: 'Oferta de site institucional',
    service: 'Criação de site',
    body: `Olá, {{empresa}}!

Notei seu trabalho e acredito que um site profissional pode fortalecer sua presença online. Tenho experiência na criação de sites institucionais que transmitem credibilidade e facilitam o contato com clientes.

Gostaria de conversar sobre como posso ajudar {{empresa}} a ter um site que represente bem seu trabalho. Podemos marcar uma breve conversa?

Abraço!`,
  },
  {
    id: 'tpl-landing',
    title: 'Oferta de landing page',
    service: 'Landing page',
    body: `Olá, {{empresa}}!

Vi seu perfil e percebi que você poderia se beneficiar de uma landing page focada em conversão. Uma página bem estruturada pode ajudar a transformar visitantes em clientes.

Tenho experiência em landing pages que carregam rápido, são otimizadas para mobile e têm chamadas claras para ação.

Posso te mostrar alguns exemplos. Fica à disposição!`,
  },
  {
    id: 'tpl-marketing',
    title: 'Oferta de marketing digital',
    service: 'Marketing digital',
    body: `Olá, {{empresa}}!

Acompanho seu conteúdo e acredito que uma estratégia de marketing digital bem feita pode ampliar seu alcance. Trabalho com gestão de redes sociais, tráfego pago e produção de conteúdo.

Cada projeto é personalizado — não trabalho com pacotes genéricos. Gostaria de entender seus objetivos e propor um plano sob medida para {{empresa}}.

Podemos conversar?`,
  },
  {
    id: 'tpl-video',
    title: 'Oferta de edição de vídeos',
    service: 'Edição de vídeos',
    body: `Olá, {{empresa}}!

Notei seus vídeos e vejo potencial para elevar a qualidade da edição. Trabalho com edição profissional, cortes dinâmicos, legendas e thumbnails que aumentam o engajamento.

Se tiver interesse, posso editar um vídeo de teste para você avaliar meu trabalho.

Fico no aguardo!`,
  },
];
