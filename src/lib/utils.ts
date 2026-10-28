import type { Category } from '@/types';
import {
  UtensilsCrossed,
  Shirt,
  House,
  Briefcase,
  ShoppingCart,
  Video,
  Cpu,
  Store,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Shirt,
  House,
  Briefcase,
  ShoppingCart,
  Video,
  Cpu,
  Store,
};

export function getCategoryIcon(category: Category): LucideIcon {
  const entries: Record<string, string> = {
    'Alimentação': 'UtensilsCrossed',
    'Moda e acessórios': 'Shirt',
    'Casa e decoração': 'House',
    'Serviços profissionais': 'Briefcase',
    'Comércio e lojas virtuais': 'ShoppingCart',
    'Criadores de conteúdo': 'Video',
    'Tecnologia': 'Cpu',
    'Outros negócios': 'Store',
  };
  return iconMap[entries[category] ?? 'Store'];
}

/** Remove acentos e normaliza para busca. */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Cor do marcador por categoria (usado no mapa Leaflet). */
export function categoryColor(category: Category): string {
  const map: Record<string, string> = {
    'Alimentação': '#f59e0b',
    'Moda e acessórios': '#ec4899',
    'Casa e decoração': '#10b858',
    'Serviços profissionais': '#3b82f6',
    'Comércio e lojas virtuais': '#8b5cf6',
    'Criadores de conteúdo': '#ef4444',
    'Tecnologia': '#06b6d4',
    'Outros negócios': '#64748b',
  };
  return map[category] ?? '#64748b';
}

/** Formata uma data ISO em pt-BR legível. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}
