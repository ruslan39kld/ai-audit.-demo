import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  Users, 
  FolderOpen, 
  BarChart3, 
  RussianRuble, 
  Settings2, 
  BookOpen, 
  Database, 
  History as HistoryIcon,
  Layers,
  ShieldCheck,
  UserCheck,
  TrendingUp,
  Coins
} from 'lucide-react';
import { View } from './types';
import { UserRole } from './contexts/AuthContext';

export type NavCategory = 'work' | 'analytics' | 'reference' | 'setup' | 'system';

export interface NavItem {
  id: View;
  label: string;
  icon: any;
  category: NavCategory;
  badge?: number | string;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  // НАСТРОЙКА СИСТЕМЫ
  { id: 'methodology', label: 'Методика', icon: BookOpen, category: 'setup' },
  { id: 'solutions_catalog', label: 'Каталог решений', icon: Layers, category: 'setup' },
  { id: 'matching_rules', label: 'Правила подбора', icon: ShieldCheck, category: 'setup' },
  { id: 'price_guide', label: 'Справочник цен', icon: Coins, category: 'setup' },
  { id: 'maturity_levels', label: 'Уровни зрелости', icon: TrendingUp, category: 'setup' },
  { id: 'field_registry', label: 'Реестр полей', icon: Database, category: 'setup' },

  // СИСТЕМА
  { id: 'settings', label: 'Настройки', icon: Settings2, category: 'system' },
  { id: 'users', label: 'Пользователи', icon: UserCheck, category: 'system' },
  { id: 'activity_log', label: 'Журнал действий', icon: HistoryIcon, category: 'system' },
];

export const AUDITOR_NAV_ITEMS: NavItem[] = [
  // РАБОТА
  { id: 'dashboard', label: 'Главная', icon: LayoutDashboard, category: 'work' },
  { id: 'new_audit', label: 'Новый аудит', icon: PlusCircle, category: 'work' },
  { id: 'audits', label: 'Аудиты', icon: FileText, category: 'work' },
  { id: 'clients', label: 'Клиенты', icon: Users, category: 'work' },
  { id: 'documents', label: 'Документы', icon: FolderOpen, category: 'work' },

  // АНАЛИТИКА
  { id: 'reports', label: 'Отчёты', icon: BarChart3, category: 'analytics' },
  { id: 'finances', label: 'Финансы', icon: RussianRuble, category: 'analytics' },

  // СПРАВКА
  { id: 'methodology', label: 'Методика (только чтение)', icon: BookOpen, category: 'reference' },
  { id: 'solutions_catalog', label: 'Каталог решений (только чтение)', icon: Layers, category: 'reference' },
  { id: 'matching_rules', label: 'Правила подбора (только чтение)', icon: ShieldCheck, category: 'reference' },
  { id: 'price_guide', label: 'Справочник цен (только чтение)', icon: Coins, category: 'reference' },
];

export const CLIENT_NAV_ITEMS: NavItem[] = [
  // РАБОТА
  { id: 'dashboard', label: 'Главная', icon: LayoutDashboard, category: 'work' },
  { id: 'new_audit', label: 'Новый аудит', icon: PlusCircle, category: 'work' },
  { id: 'audits', label: 'Аудиты', icon: FileText, category: 'work' },
  { id: 'documents', label: 'Документы', icon: FolderOpen, category: 'work' },
];

export const getNavItemsForRole = (role: UserRole): NavItem[] => {
  switch (role) {
    case 'admin':
      return ADMIN_NAV_ITEMS;
    case 'client':
      return CLIENT_NAV_ITEMS;
    case 'auditor':
    default:
      return AUDITOR_NAV_ITEMS;
  }
};
