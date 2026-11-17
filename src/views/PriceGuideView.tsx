import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Search, 
  CheckCircle2, 
  Edit3, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  Users, 
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { AI_SOLUTIONS } from '../auditMetadata';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export const PriceGuideView: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [, setVersion] = useState(0);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const handleUpdate = () => setVersion(v => v + 1);
    window.addEventListener('aiaudit:solutions_updated', handleUpdate);
    return () => window.removeEventListener('aiaudit:solutions_updated', handleUpdate);
  }, []);

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
    setIsEditMode(false);
  };

  const SPECIALIST_RATES = [
    { role: 'AI Solution Architect / Архитектор ИИ', rate: '5 500 – 8 000 ₽/час', level: 'Senior / Lead', desc: 'Проектирование RAG, валидация гипотез, выбор моделей' },
    { role: 'ML / Data Scientist', rate: '4 000 – 6 500 ₽/час', level: 'Middle / Senior', desc: 'Пайплайны данных, дообучение, эмбеддинги, эвалюация' },
    { role: 'Senior Python / Fullstack Developer', rate: '3 500 – 5 000 ₽/час', level: 'Middle / Senior', desc: 'API интеграции, оркестрация промптов, веб-интерфейсы' },
    { role: 'DevOps / MLOps Инженер', rate: '4 000 – 6 000 ₽/час', level: 'Senior', desc: 'Локальный хостинг vLLM/Ollama, контейнеризация, мониторинг' },
    { role: 'QA & Safety Evaluator', rate: '2 500 – 3 500 ₽/час', level: 'Middle', desc: 'Тестирование галлюцинаций, регресс промптов, безопасность' },
  ];

  const filteredSolutions = AI_SOLUTIONS.filter(sol =>
    sol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sol.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sol.budgetRange.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
            <Coins size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Справочник цен</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Нормативы бюджетов внедрения, подписок на инфраструктуру и часовых ставок специалистов
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {saveToast && (
            <span className="flex items-center gap-1.5 text-xs text-success font-medium animate-in fade-in">
              <CheckCircle2 size={15} /> Справочник цен сохранен
            </span>
          )}

          {isAdmin ? (
            <button
              onClick={() => isEditMode ? handleSave() : setIsEditMode(true)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm",
                isEditMode 
                  ? "bg-accent text-white hover:opacity-90" 
                  : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--background)]"
              )}
            >
              <Edit3 size={16} />
              {isEditMode ? 'Сохранить изменения' : 'Редактировать'}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--border)]">
              <Lock size={14} className="text-[var(--text-secondary)]" />
              <span>Изменения вносит администратор</span>
            </div>
          )}
        </div>
      </div>

      {isAdmin && isEditMode && (
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5 text-accent text-sm font-medium">
            <Sparkles size={18} />
            <span>Режим редактирования справочника цен активен. Вы можете калибровать финансовые сетки решений.</span>
          </div>
          <button 
            onClick={handleSave}
            className="btn-primary text-xs py-1.5 px-3"
          >
            Готово
          </button>
        </div>
      )}

      {/* Specialist Hourly Rates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Базовые часовые ставки специалистов (ФОТ + налоги)</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Используются движком расчёта ROI для оценки стоимости разработки и интеграции
            </p>
          </div>
          <span className="text-xs text-[var(--text-secondary)] bg-[var(--background)] px-2.5 py-1 rounded-lg border border-[var(--border)]">
            Актуальность: Текущий квартал
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SPECIALIST_RATES.map((spec, i) => (
            <div key={i} className="card p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">{spec.level}</span>
                <Briefcase size={14} className="text-[var(--text-secondary)]" />
              </div>
              <h4 className="font-bold text-sm text-[var(--text-primary)]">{spec.role}</h4>
              <p className="text-base font-black text-accent">{spec.rate}</p>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed pt-1 border-t border-[var(--border)]">
                {spec.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Solutions Price Guide Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold">Бюджеты решений S01–S16 и стоимость владения</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Нормативные диапазоны бюджета пилота и регулярных ежемесячных затрат
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
            <input
              type="text"
              placeholder="Поиск по коду или бюджету..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--background)] border-b border-[var(--border)] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 w-16">Код</th>
                  <th className="px-5 py-3.5 w-64">Решение</th>
                  <th className="px-5 py-3.5 w-40">Срок пилота</th>
                  <th className="px-5 py-3.5 w-48">Бюджет внедрения</th>
                  <th className="px-5 py-3.5">Стоимость владения и подписки (OPEX)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredSolutions.map(sol => (
                  <tr key={sol.code} className="hover:bg-[var(--background)]/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-accent">{sol.code}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[var(--text-primary)]">{sol.name}</p>
                      <span className="text-[10px] text-[var(--text-secondary)]">{sol.type}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock size={13} className="text-[var(--text-secondary)]" />
                        <span>{sol.durationWeeks} нед.</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-accent text-sm">
                      {sol.budgetRange}
                    </td>
                    <td className="px-5 py-4 text-[var(--text-secondary)] text-xs">
                      {sol.maintenanceCost || 'Индивидуальный расчет инфраструктуры'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
