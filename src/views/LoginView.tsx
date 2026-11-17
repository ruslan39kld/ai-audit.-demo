import React, { useState } from 'react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { LogIn, Shield, User, Building2, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@ai-audit.ru');
  const [role, setRole] = useState<UserRole>('admin');

  const handleRoleSelect = (newRole: UserRole) => {
    setRole(newRole);
    if (!email || email === 'admin@ai-audit.ru' || email === 'auditor@ai-audit.ru' || email === 'client@company.ru') {
      if (newRole === 'admin') setEmail('admin@ai-audit.ru');
      else if (newRole === 'auditor') setEmail('auditor@ai-audit.ru');
      else setEmail('client@company.ru');
    }
  };

  const handleQuickLogin = (quickRole: UserRole, quickEmail: string) => {
    login(quickEmail, quickRole);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      login(email, role);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-accent/20">
             <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight">AI Audit Platform</h1>
          <p className="text-[var(--text-secondary)] text-sm">Вход в систему управления аудитами</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-6 shadow-2xl">
          <div className="space-y-3">
             <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Выберите роль</label>
             <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center",
                    role === 'admin' ? "border-accent bg-accent/10 text-accent font-bold shadow-sm" : "border-[var(--border)] hover:bg-[var(--background)]"
                  )}
                >
                  <Building2 size={22} />
                  <span className="text-xs">Администратор</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('auditor')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center",
                    role === 'auditor' ? "border-accent bg-accent/10 text-accent font-bold shadow-sm" : "border-[var(--border)] hover:bg-[var(--background)]"
                  )}
                >
                  <Shield size={22} />
                  <span className="text-xs">Аудитор</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('client')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center",
                    role === 'client' ? "border-accent bg-accent/10 text-accent font-bold shadow-sm" : "border-[var(--border)] hover:bg-[var(--background)]"
                  )}
                >
                  <User size={22} />
                  <span className="text-xs">Заказчик</span>
                </button>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Email учетной записи</label>
            <div className="relative">
              <LogIn className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
              <input 
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-accent outline-none transition-all text-sm font-medium"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3.5 text-sm font-bold shadow-lg shadow-accent/20">
            Войти как {role === 'admin' ? 'Администратор' : role === 'auditor' ? 'Аудитор' : 'Заказчик'}
          </button>
        </form>

        {/* Quick entry links for rapid testing */}
        <div className="space-y-2 text-center">
          <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Быстрый вход в 1 клик:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => handleQuickLogin('admin', 'admin@ai-audit.ru')}
              className="px-3 py-1.5 rounded-lg text-xs bg-[var(--surface)] border border-[var(--border)] hover:border-accent text-[var(--text-primary)] transition-all font-medium"
            >
              👑 Администратор
            </button>
            <button
              onClick={() => handleQuickLogin('auditor', 'auditor@ai-audit.ru')}
              className="px-3 py-1.5 rounded-lg text-xs bg-[var(--surface)] border border-[var(--border)] hover:border-accent text-[var(--text-primary)] transition-all font-medium"
            >
              🔍 Аудитор
            </button>
            <button
              onClick={() => handleQuickLogin('client', 'client@company.ru')}
              className="px-3 py-1.5 rounded-lg text-xs bg-[var(--surface)] border border-[var(--border)] hover:border-accent text-[var(--text-primary)] transition-all font-medium"
            >
              🏢 Заказчик
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-[var(--text-secondary)] px-8 leading-relaxed">
          Продолжая, вы соглашаетесь с правилами обработки персональных данных и условиями использования платформы AI-аудита.
        </p>
      </div>
    </div>
  );
};
