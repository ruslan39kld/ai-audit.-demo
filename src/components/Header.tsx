import React from 'react';
import { Search, Sun, Moon, Bell } from 'lucide-react';
import { Theme } from '../types';

interface HeaderProps {
  title: string;
  theme: Theme;
  onThemeToggle: () => void;
  user: any;
}

export const Header: React.FC<HeaderProps> = ({ title, theme, onThemeToggle, user }) => {
  return (
    <header className="h-16 bg-[var(--surface)] border-b border-[var(--border)] px-8 flex items-center justify-between sticky top-0 z-30">
      <h1 className="text-xl font-bold">{title}</h1>

      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input 
            type="text" 
            placeholder="Поиск по системе..." 
            className="pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onThemeToggle}
            className="p-2 rounded-lg hover:bg-[var(--background)] transition-colors text-[var(--text-secondary)]"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          <button className="p-2 rounded-lg hover:bg-[var(--background)] transition-colors text-[var(--text-secondary)] relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-[var(--surface)]" />
          </button>
        </div>

        <div className="h-8 w-px bg-[var(--border)] mx-2" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold leading-none">{user.name}</p>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1 uppercase tracking-tighter">
              {user.role === 'admin' ? 'Администратор' : user.role === 'auditor' ? 'Аудитор' : 'Заказчик'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent text-white border border-accent flex items-center justify-center font-bold">
            {user.name.substring(0, 1).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
