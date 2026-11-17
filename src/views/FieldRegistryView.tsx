import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  CheckCircle2, 
  Edit3, 
  Sparkles, 
  Filter, 
  Layers,
  HelpCircle,
  Tag
} from 'lucide-react';
import { FIELD_REGISTRY } from '../lib/fieldRegistry';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export const FieldRegistryView: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [isEditMode, setIsEditMode] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
    setIsEditMode(false);
  };

  const levelCounts = {
    all: FIELD_REGISTRY.length,
    company: FIELD_REGISTRY.filter(f => f.level === 'company').length,
    department: FIELD_REGISTRY.filter(f => f.level === 'department').length,
    process: FIELD_REGISTRY.filter(f => f.level === 'process').length,
  };

  const filteredFields = FIELD_REGISTRY.filter(f => {
    const matchesLevel = selectedLevel === 'all' || f.level === selectedLevel;
    const matchesSearch = 
      f.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.type.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
            <Database size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Реестр полей</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Единый каталог {FIELD_REGISTRY.length} параметров аудита (профиль компании, подразделения и процессы)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {saveToast && (
            <span className="flex items-center gap-1.5 text-xs text-success font-medium animate-in fade-in">
              <CheckCircle2 size={15} /> Реестр сохранен
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
            <span>Режим редактирования реестра полей активен. Вы можете настраивать формулировки вопросов и типы данных.</span>
          </div>
          <button 
            onClick={handleSave}
            className="btn-primary text-xs py-1.5 px-3"
          >
            Готово
          </button>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedLevel('all')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              selectedLevel === 'all'
                ? "bg-accent text-white"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background)]"
            )}
          >
            Все поля ({levelCounts.all})
          </button>
          <button
            onClick={() => setSelectedLevel('company')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              selectedLevel === 'company'
                ? "bg-accent text-white"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background)]"
            )}
          >
            Компания ({levelCounts.company})
          </button>
          <button
            onClick={() => setSelectedLevel('department')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              selectedLevel === 'department'
                ? "bg-accent text-white"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background)]"
            )}
          >
            Подразделения ({levelCounts.department})
          </button>
          <button
            onClick={() => setSelectedLevel('process')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              selectedLevel === 'process'
                ? "bg-accent text-white"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background)]"
            )}
          >
            Процессы ({levelCounts.process})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
          <input
            type="text"
            placeholder="Поиск по ключу или вопросу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Fields Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--background)] border-b border-[var(--border)] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 w-48">Ключ поля</th>
                <th className="px-5 py-3.5 w-32">Уровень</th>
                <th className="px-5 py-3.5 w-48">Блок</th>
                <th className="px-5 py-3.5">Вопрос / Описание поля</th>
                <th className="px-5 py-3.5 w-28">Тип данных</th>
                <th className="px-5 py-3.5 w-64">Опции / Значения</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredFields.map(f => (
                <tr key={f.key} className="hover:bg-[var(--background)]/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-accent">{f.key}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-semibold uppercase",
                      f.level === 'company' && "bg-blue-500/10 text-blue-500",
                      f.level === 'department' && "bg-purple-500/10 text-purple-500",
                      f.level === 'process' && "bg-amber-500/10 text-amber-500"
                    )}>
                      {f.level === 'company' ? 'Компания' : f.level === 'department' ? 'Отдел' : 'Процесс'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-[var(--text-secondary)]">
                    {f.block}
                  </td>
                  <td className="px-5 py-3.5 text-[var(--text-primary)] font-medium">
                    {f.label}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-[var(--text-secondary)]">
                    {f.type}
                  </td>
                  <td className="px-5 py-3.5 text-[var(--text-secondary)] text-[11px]">
                    {f.options && f.options.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {f.options.slice(0, 3).map((opt, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-[var(--background)] rounded border border-[var(--border)] text-[10px]">
                            {typeof opt === 'string' ? opt : opt.label}
                          </span>
                        ))}
                        {f.options.length > 3 && (
                          <span className="text-[10px] text-[var(--text-secondary)] self-center">
                            +{f.options.length - 3} ещё
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="opacity-50">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
