import React from 'react';
import { NavItem } from '../navigation';
import { View } from '../types';
import { cn } from '../lib/utils';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  navItems: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, collapsed, onToggleCollapse, navItems }) => {
  const { user, logout } = useAuth();
  const categories: Record<string, string> = {
    work: 'РАБОТА',
    analytics: 'АНАЛИТИКА',
    reference: 'СПРАВКА',
    setup: 'НАСТРОЙКА СИСТЕМЫ',
    system: 'СИСТЕМА'
  };

  const categoryOrder = ['work', 'analytics', 'reference', 'setup', 'system'];

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-[var(--surface)] border-r border-[var(--border)] transition-all duration-300 z-40 flex flex-col",
      collapsed ? "w-20" : "w-[260px]"
    )}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)]">
        {!collapsed && <span className="font-bold text-lg text-accent">AI Audit</span>}
        <button 
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-[var(--background)] transition-colors text-[var(--text-secondary)]"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
        {categoryOrder.map(category => {
          const items = navItems.filter(item => item.category === category);
          if (items.length === 0) return null;
          
          return (
            <div key={category} className="space-y-1">
              {!collapsed && (
                <h3 className="px-3 text-[10px] font-bold text-[var(--text-secondary)] tracking-wider mb-2">
                  {categories[category]}
                </h3>
              )}
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative",
                    currentView === item.id 
                      ? "bg-accent/10 text-accent" 
                      : "text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {currentView === item.id && (
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-accent rounded-r-full" />
                  )}
                  <item.icon size={20} className={cn(
                    "shrink-0",
                    currentView === item.id ? "text-accent" : "group-hover:text-[var(--text-primary)]"
                  )} />
                  {!collapsed && (
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="text-[10px] font-bold bg-[var(--background)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded-md border border-[var(--border)]">
                      {item.badge}
                    </span>
                  )}
                  {collapsed && (
                     <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-[var(--border)] space-y-4">
          <div className="flex items-center justify-between">
            {!collapsed ? (
                <div className="flex items-center gap-3 px-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {user?.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate">{user?.name}</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {user?.role === 'admin' ? 'Администратор' : user?.role === 'auditor' ? 'Аудитор' : 'Заказчик'}
                    </span>
                  </div>
                </div>
            ) : (
                <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs mx-auto">
                  {user?.name.substring(0, 2).toUpperCase()}
                </div>
            )}
            
            {!collapsed && (
              <button 
                onClick={logout}
                className="p-2 text-[var(--text-secondary)] hover:text-error hover:bg-error/10 rounded-lg transition-all"
                title="Выйти"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
      </div>
    </aside>
  );
};
