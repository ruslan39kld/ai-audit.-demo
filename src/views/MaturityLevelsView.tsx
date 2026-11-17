import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Edit3, 
  Sparkles, 
  Layers,
  Award,
  ShieldCheck
} from 'lucide-react';
import { MATURITY_LEVELS } from '../auditMetadata';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export const MaturityLevelsView: React.FC = () => {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
    setIsEditMode(false);
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Уровни зрелости процессов</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Шестиуровневая шкала готовности корпоративных процессов и команд к внедрению ИИ
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {saveToast && (
            <span className="flex items-center gap-1.5 text-xs text-success font-medium animate-in fade-in">
              <CheckCircle2 size={15} /> Шкала зрелости сохранена
            </span>
          )}

          {isAdmin && (
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
          )}
        </div>
      </div>

      {isAdmin && isEditMode && (
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5 text-accent text-sm font-medium">
            <Sparkles size={18} />
            <span>Режим редактирования шкалы зрелости активен. Вы можете калибровать характеристики уровней 01–06.</span>
          </div>
          <button 
            onClick={handleSave}
            className="btn-primary text-xs py-1.5 px-3"
          >
            Готово
          </button>
        </div>
      )}

      {/* Maturity Levels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MATURITY_LEVELS.map(lvl => (
          <div 
            key={lvl.level} 
            className="card p-6 flex flex-col justify-between border-t-4 border-accent relative hover:shadow-lg transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-accent/25">0{lvl.level}</span>
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider px-2 py-0.5 bg-accent/10 rounded-md">
                  Уровень {lvl.level}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-lg text-[var(--text-primary)]">{lvl.name}</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                  {lvl.description}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-[var(--border)]">
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Ключевые характеристики:
                </p>
                <ul className="space-y-1.5">
                  {lvl.characteristics.map((char, idx) => (
                    <li key={idx} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                      <ArrowRight size={12} className="text-accent shrink-0 mt-0.5" />
                      <span>{char}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
