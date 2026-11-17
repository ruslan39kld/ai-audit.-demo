import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Clock, 
  Wallet, 
  ArrowRight, 
  X, 
  Search, 
  Edit3, 
  Lock, 
  CheckCircle2, 
  Sparkles,
  ShieldAlert,
  Server,
  Workflow,
  Save
} from 'lucide-react';
import { AI_SOLUTIONS, AISolution, saveSolution, AIRole } from '../auditMetadata';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export const SolutionsCatalogView: React.FC = () => {
  const { user } = useAuth();
  const [selectedSolution, setSelectedSolution] = useState<AISolution | null>(null);
  const [editingSolution, setEditingSolution] = useState<AISolution | null>(null);
  const [editFormData, setEditFormData] = useState<AISolution | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [, setVersion] = useState(0);

  const isAdmin = user?.role === 'admin';
  const isAuditor = user?.role === 'auditor';

  useEffect(() => {
    const handleUpdate = () => setVersion(v => v + 1);
    window.addEventListener('aiaudit:solutions_updated', handleUpdate);
    return () => window.removeEventListener('aiaudit:solutions_updated', handleUpdate);
  }, []);

  const handleCardClick = (sol: AISolution) => {
    if (isAdmin && isEditMode) {
      setEditingSolution(sol);
      setEditFormData({ ...sol });
    } else {
      setSelectedSolution(sol);
    }
  };

  const handleFormSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;

    saveSolution(editFormData);
    setSaveToast(`Изменения в решении ${editFormData.code} сохранены`);
    setTimeout(() => setSaveToast(null), 3000);
    setEditingSolution(null);
    setEditFormData(null);
    setVersion(v => v + 1);
  };

  const filteredSolutions = AI_SOLUTIONS.filter(sol => 
    sol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sol.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sol.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sol.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
            <Layers size={24} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Каталог решений</h2>
              {isAuditor && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--text-secondary)]">
                  Только чтение
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              16 типовых архитектурных решений на базе прикладного и генеративного ИИ (S01–S16)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {saveToast && (
            <span className="flex items-center gap-1.5 text-xs text-success font-medium animate-in fade-in">
              <CheckCircle2 size={15} /> {saveToast}
            </span>
          )}

          {isAdmin && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer",
                isEditMode 
                  ? "bg-accent text-white hover:opacity-90 shadow-accent/20" 
                  : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--background)]"
              )}
            >
              <Edit3 size={16} />
              {isEditMode ? 'Завершить редактирование' : 'Редактировать'}
            </button>
          )}

          {!isAdmin && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--border)]">
              <Lock size={14} className="text-[var(--text-secondary)]" />
              <span>Редактирование доступно только администратору</span>
            </div>
          )}
        </div>
      </div>

      {isAdmin && isEditMode && (
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5 text-accent text-sm font-medium">
            <Sparkles size={18} />
            <span>Режим редактирования каталога активен: нажмите на любую карточку решения для изменения параметров.</span>
          </div>
          <button 
            onClick={() => setIsEditMode(false)}
            className="btn-primary text-xs py-1.5 px-3 cursor-pointer"
          >
            Готово
          </button>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            Всего решений: {AI_SOLUTIONS.length}
          </span>
          <span className="text-xs text-[var(--text-secondary)]">•</span>
          <span className="text-xs text-[var(--text-secondary)]">
            Охват: 16 типовых потерь
          </span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
          <input
            type="text"
            placeholder="Поиск по коду или названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Grid of Solutions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSolutions.map(sol => (
          <div 
            key={sol.code} 
            onClick={() => handleCardClick(sol)}
            className={cn(
              "card p-6 flex flex-col justify-between transition-all group cursor-pointer",
              isAdmin && isEditMode 
                ? "border-accent/40 hover:border-accent hover:shadow-md ring-1 ring-accent/20 bg-accent/[0.02]" 
                : "hover:border-accent"
            )}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                    {sol.code} • {sol.type} • {sol.aiRole}
                  </span>
                  {isAdmin && isEditMode && (
                    <span className="text-[10px] bg-accent text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Edit3 size={10} /> Изменить
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1" title={`Сложность внедрения: ${sol.complexity}/5`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-3 rounded-full ${i < sol.complexity ? 'bg-accent' : 'bg-[var(--border)]'}`} 
                    />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-lg group-hover:text-accent transition-colors">{sol.name}</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">{sol.description}</p>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                  <Clock size={14} />
                  <span className="text-[11px] font-medium">{sol.durationWeeks} нед.</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                  <Wallet size={14} />
                  <span className="text-[11px] font-bold text-accent">{sol.budgetRange}</span>
                </div>
              </div>
              <div className="text-accent group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Edit Modal */}
      {isAdmin && editingSolution && editFormData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[var(--surface)] rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-[var(--border)] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between sticky top-0 bg-[var(--surface)] z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent/10 text-accent rounded-xl font-bold font-mono text-base">
                  {editFormData.code}
                </div>
                <div>
                  <h3 className="text-lg font-bold">Редактирование решения</h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Изменения сразу вступят в силу во всей системе
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setEditingSolution(null);
                  setEditFormData(null);
                }}
                className="p-2 hover:bg-[var(--background)] rounded-xl transition-colors text-[var(--text-secondary)] cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Код (Read-only) */}
              <div className="p-3.5 bg-[var(--background)] rounded-xl border border-[var(--border)] flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block">Код решения</label>
                  <span className="text-xs text-[var(--text-secondary)]/80">Идентификатор в методике (не редактируется)</span>
                </div>
                <span className="font-mono font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-lg text-sm">
                  {editFormData.code}
                </span>
              </div>

              {/* Название */}
              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1.5">
                  Название <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[var(--background)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-accent font-medium text-[var(--text-primary)]"
                  placeholder="Название решения"
                />
              </div>

              {/* Краткое описание */}
              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1.5">
                  Краткое описание <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={editFormData.description}
                  onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[var(--background)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-accent leading-relaxed text-[var(--text-primary)]"
                  placeholder="Краткое описание назначения и пользы решения"
                />
              </div>

              {/* Роль ИИ и Категория */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1.5">
                    Роль ИИ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.aiRole}
                    onChange={e => setEditFormData({ ...editFormData, aiRole: e.target.value as AIRole })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[var(--background)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-accent font-medium text-[var(--text-primary)] cursor-pointer"
                  >
                    <option value="помощник сотрудника">помощник сотрудника</option>
                    <option value="контролёр">контролёр</option>
                    <option value="исполнитель">исполнитель</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1.5">
                    Категория <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.type}
                    onChange={e => setEditFormData({ ...editFormData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[var(--background)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-accent font-medium text-[var(--text-primary)]"
                    placeholder="Например: Ассистент, Агент, Аналитика"
                  />
                </div>
              </div>

              {/* Срок пилота и Бюджет внедрения */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1.5">
                    Срок пилота в неделях <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    required
                    value={editFormData.durationWeeks}
                    onChange={e => setEditFormData({ ...editFormData, durationWeeks: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[var(--background)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-accent font-medium text-[var(--text-primary)]"
                    placeholder="Число недель"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1.5">
                    Бюджет внедрения <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.budgetRange}
                    onChange={e => setEditFormData({ ...editFormData, budgetRange: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[var(--background)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-accent font-medium text-[var(--text-primary)]"
                    placeholder="Например: от 500 000 ₽"
                  />
                </div>
              </div>

              {/* Стоимость владения */}
              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1.5">
                  Стоимость владения <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.maintenanceCost}
                  onChange={e => setEditFormData({ ...editFormData, maintenanceCost: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[var(--background)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-accent font-medium text-[var(--text-primary)]"
                  placeholder="Например: Хостинг векторной БД + API LLM"
                />
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSolution(null);
                    setEditFormData(null);
                  }}
                  className="px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] hover:bg-[var(--background)] text-[var(--text-secondary)] font-medium transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 cursor-pointer"
                >
                  <Save size={16} />
                  Сохранить изменения
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Solution Detail Modal (Read-Only) */}
      {selectedSolution && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-4xl bg-[var(--surface)] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-[var(--border)]">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between sticky top-0 bg-[var(--surface)] z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 text-accent rounded-2xl font-black text-xl">
                  {selectedSolution.code}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedSolution.name}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">{selectedSolution.type} • Роль: {selectedSolution.aiRole}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSolution(null)}
                className="p-2 hover:bg-[var(--background)] rounded-xl transition-colors text-[var(--text-secondary)] cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* What is it */}
              <section className="space-y-3">
                <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  01. Что это такое?
                </h4>
                <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                  {selectedSolution.whatIsIt || selectedSolution.description}
                </p>
              </section>

              {/* How it works */}
              {selectedSolution.howItWorks && (
                <section className="space-y-3">
                  <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    02. Архитектура и принцип работы
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {selectedSolution.howItWorks.map((item, i) => (
                      <li key={i} className="text-xs p-3 bg-[var(--background)] rounded-xl border border-[var(--border)] flex items-start gap-2">
                        <Workflow size={14} className="text-accent shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Requirements & Costs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border)]">
                {selectedSolution.requirements && (
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      Требования к инфраструктуре
                    </h4>
                    <ul className="space-y-2">
                      {selectedSolution.requirements.map((req, i) => (
                        <li key={i} className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                          <Server size={13} className="text-accent shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    Стоимость внедрения и владения
                  </h4>
                  <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[var(--text-secondary)]">Бюджет пилота:</span>
                      <span className="font-bold text-accent">{selectedSolution.budgetRange}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[var(--text-secondary)]">Срок запуска:</span>
                      <span className="font-bold">{selectedSolution.durationWeeks} нед.</span>
                    </div>
                    <div className="flex justify-between items-start text-xs pt-2 border-t border-[var(--border)]">
                      <span className="text-[var(--text-secondary)]">Поддержка и API:</span>
                      <span className="text-right text-[11px] text-[var(--text-secondary)] max-w-[200px]">
                        {selectedSolution.maintenanceCost || 'По запросу'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedSolution.limitations && (
                <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl flex items-start gap-3">
                  <ShieldAlert size={18} className="text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-warning mb-0.5">Ограничения и риски</p>
                    <p className="text-xs text-[var(--text-secondary)]">{selectedSolution.limitations}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
