import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Edit3, 
  Sparkles, 
  Layers, 
  X, 
  Plus, 
  Trash2, 
  Save, 
  Lock,
  PowerOff,
  Power
} from 'lucide-react';
import { RULES_REGISTRY, Rule, RuleCondition, saveRule } from '../lib/rulesRegistry';
import { FIELD_REGISTRY } from '../lib/fieldRegistry';
import { AI_SOLUTIONS } from '../auditMetadata';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

// Вспомогательные функции парсинга и форматирования значений условий
function parseConditionValue(raw: string, op: string): any {
  const trimmed = raw.trim();
  if (op === '>' || op === '<' || op === 'len_gt') {
    const num = Number(trimmed);
    return isNaN(num) ? trimmed : num;
  }
  if (op === 'in' || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    }
  }
  if (!isNaN(Number(trimmed)) && trimmed !== '') {
    return Number(trimmed);
  }
  return trimmed;
}

function formatConditionValue(val: any): string {
  if (Array.isArray(val)) {
    return val.join(', ');
  }
  return String(val ?? '');
}

export const MatchingRulesView: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSolution, setSelectedSolution] = useState<string>('all');
  const [isEditMode, setIsEditMode] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [editFormData, setEditFormData] = useState<Rule | null>(null);
  const [conditionValueDrafts, setConditionValueDrafts] = useState<string[]>([]);
  const [, setVersion] = useState(0);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const handleUpdate = () => setVersion(v => v + 1);
    window.addEventListener('aiaudit:rules_updated', handleUpdate);
    return () => window.removeEventListener('aiaudit:rules_updated', handleUpdate);
  }, []);

  // Доступные поля из реестра для выпадающего списка
  const availableFields = useMemo(() => {
    const list = [
      ...FIELD_REGISTRY.map(f => ({
        key: f.key,
        label: `${f.key} — ${f.label} (${f.level === 'company' ? 'компания' : f.level === 'department' ? 'отдел' : 'процесс'})`
      })),
      { key: 'name', label: 'name — Наименование процесса (процесс)' },
      { key: 'description', label: 'description — Описание процесса (процесс)' },
      { key: 'department', label: 'department — Подразделение (отдел)' },
    ];
    // Удаляем дубликаты ключей
    const map = new Map<string, { key: string; label: string }>();
    list.forEach(item => {
      if (!map.has(item.key)) {
        map.set(item.key, item);
      }
    });
    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, []);

  // Compute diagnostics
  const validKeys = useMemo(() => {
    const s = new Set(FIELD_REGISTRY.map(f => f.key));
    s.add('name');
    s.add('description');
    s.add('department');
    return s;
  }, []);

  const diagnostics = RULES_REGISTRY.map(rule => {
    const missingKeys = rule.conditions
      .filter(c => !validKeys.has(c.key))
      .map(c => c.key);
    return {
      ...rule,
      missingKeys,
      isValid: missingKeys.length === 0
    };
  });

  const invalidRules = diagnostics.filter(d => !d.isValid);
  const distinctKeysUsed = new Set<string>();
  RULES_REGISTRY.forEach(r => r.conditions.forEach(c => distinctKeysUsed.add(c.key)));

  // Подсчет активных правил
  const activeRulesCount = RULES_REGISTRY.filter(r => r.enabled !== false).length;

  const filteredRules = diagnostics.filter(rule => {
    const matchesSearch = 
      rule.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rule.name && rule.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rule.description && rule.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      rule.solution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.conditions.some(c => c.key.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSol = selectedSolution === 'all' || rule.solution === selectedSolution;

    return matchesSearch && matchesSol;
  });

  const handleRowClick = (rule: Rule) => {
    if (!isAdmin) return; // У аудитора и заказчика форма не открывается
    setEditingRule(rule);
    const cloned: Rule = JSON.parse(JSON.stringify(rule));
    if (cloned.enabled === undefined) cloned.enabled = true;
    setEditFormData(cloned);
    setConditionValueDrafts(cloned.conditions.map(c => formatConditionValue(c.value)));
  };

  const handleAddCondition = () => {
    if (!editFormData) return;
    const defaultKey = availableFields[0]?.key || 'pr_losses';
    const newCond: RuleCondition = {
      key: defaultKey,
      op: '==',
      value: ''
    };
    setEditFormData({
      ...editFormData,
      conditions: [...editFormData.conditions, newCond]
    });
    setConditionValueDrafts([...conditionValueDrafts, '']);
  };

  const handleRemoveCondition = (index: number) => {
    if (!editFormData) return;
    const newConds = editFormData.conditions.filter((_, i) => i !== index);
    const newDrafts = conditionValueDrafts.filter((_, i) => i !== index);
    setEditFormData({
      ...editFormData,
      conditions: newConds
    });
    setConditionValueDrafts(newDrafts);
  };

  const handleConditionChange = (index: number, field: 'key' | 'op' | 'value', val: any) => {
    if (!editFormData) return;
    const newConds = [...editFormData.conditions];
    const newDrafts = [...conditionValueDrafts];

    if (field === 'value') {
      newDrafts[index] = val;
      newConds[index] = {
        ...newConds[index],
        value: parseConditionValue(val, newConds[index].op)
      };
    } else if (field === 'op') {
      newConds[index] = {
        ...newConds[index],
        op: val,
        value: parseConditionValue(newDrafts[index], val)
      };
    } else {
      newConds[index] = {
        ...newConds[index],
        key: val
      };
    }

    setEditFormData({
      ...editFormData,
      conditions: newConds
    });
    setConditionValueDrafts(newDrafts);
  };

  const handleFormSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;

    // Финализируем парсинг значений условий
    const finalizedConditions: RuleCondition[] = editFormData.conditions.map((c, i) => ({
      key: c.key,
      op: c.op,
      value: parseConditionValue(conditionValueDrafts[i] ?? '', c.op)
    }));

    const ruleToSave: Rule = {
      ...editFormData,
      conditions: finalizedConditions
    };

    saveRule(ruleToSave);
    setSaveToast(`Правило ${ruleToSave.id} успешно сохранено`);
    setTimeout(() => setSaveToast(null), 3000);
    setEditingRule(null);
    setEditFormData(null);
    setVersion(v => v + 1);
  };

  const solutionsList = Array.from(new Set(RULES_REGISTRY.map(r => r.solution))).sort();

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Правила подбора решений</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Реестр 38 детерминированных правил маппинга ответов чек-листа на решения S01–S16
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

          {isAdmin ? (
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
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--border)]">
              <Lock size={14} />
              <span>Изменения вносит администратор</span>
            </div>
          )}
        </div>
      </div>

      {isAdmin && isEditMode && (
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5 text-accent text-sm font-medium">
            <Sparkles size={18} />
            <span>Режим редактирования активен: нажмите на любую строку правила для изменения описания, условий, решения или статуса активности.</span>
          </div>
          <button 
            onClick={() => setIsEditMode(false)}
            className="btn-primary text-xs py-1.5 px-3 cursor-pointer"
          >
            Готово
          </button>
        </div>
      )}

      {/* Metrics Banner (Диагностика модели) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Активных правил в модели</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-black text-[var(--text-primary)]">{activeRulesCount}</h3>
              <span className="text-xs text-[var(--text-secondary)] font-medium">из {RULES_REGISTRY.length} в реестре</span>
            </div>
          </div>
          <div className={cn(
            "p-3 rounded-xl",
            activeRulesCount === RULES_REGISTRY.length ? "bg-accent/10 text-accent" : "bg-amber-500/10 text-amber-600"
          )}>
            <ShieldCheck size={24} />
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Охват полей чек-листа</p>
            <h3 className="text-3xl font-black mt-1 text-[var(--text-primary)]">{distinctKeysUsed.size}</h3>
          </div>
          <div className="p-3 bg-success/10 text-success rounded-xl">
            <Layers size={24} />
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Статус целостности связей</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-success">{invalidRules.length} ошибок</span>
              <CheckCircle2 size={18} className="text-success" />
            </div>
          </div>
          <div className="p-3 bg-success/10 text-success rounded-xl">
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedSolution('all')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
              selectedSolution === 'all'
                ? "bg-accent text-white"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background)]"
            )}
          >
            Все решения ({RULES_REGISTRY.length})
          </button>
          {solutionsList.map(sol => (
            <button
              key={sol}
              onClick={() => setSelectedSolution(sol)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                selectedSolution === sol
                  ? "bg-accent text-white"
                  : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background)]"
              )}
            >
              {sol}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
          <input
            type="text"
            placeholder="Поиск по правилу или ключу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Rules Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--background)] border-b border-[var(--border)] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 w-16">ID</th>
                <th className="px-5 py-3.5 w-64">Наименование правила</th>
                <th className="px-5 py-3.5">Условия срабатывания</th>
                <th className="px-5 py-3.5 w-28">Решение</th>
                <th className="px-5 py-3.5 w-32">Статус</th>
                {isAdmin && isEditMode && (
                  <th className="px-5 py-3.5 w-24 text-right">Действие</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredRules.map(rule => {
                const isRuleActive = rule.enabled !== false;
                return (
                  <tr 
                    key={rule.id} 
                    onClick={() => isAdmin && isEditMode && handleRowClick(rule)}
                    className={cn(
                      "transition-colors",
                      !isRuleActive ? "opacity-60 bg-[var(--background)]/30" : "hover:bg-[var(--background)]/50",
                      isAdmin && isEditMode ? "cursor-pointer hover:bg-accent/[0.04]" : ""
                    )}
                  >
                    <td className="px-5 py-4 font-mono font-bold text-accent">
                      <span className={cn(!isRuleActive && "line-through text-gray-400")}>
                        {rule.id}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[var(--text-primary)]">{rule.name}</p>
                      <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mt-0.5">{rule.description}</p>
                      <span className="text-[10px] text-accent font-mono font-semibold mt-1 inline-block">Логика: {rule.logic}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {rule.conditions.map((c, i) => (
                          <span 
                            key={i} 
                            className="px-2 py-1 bg-[var(--background)] rounded-md border border-[var(--border)] font-mono text-[11px] text-[var(--text-primary)]"
                          >
                            <span className="text-accent font-semibold">{c.key}</span>{' '}
                            <span className="text-[var(--text-secondary)]">{c.op}</span>{' '}
                            <span className="font-bold">
                              {Array.isArray(c.value) ? `[${c.value.join(', ')}]` : String(c.value)}
                            </span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-md text-xs">
                        {rule.solution}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {isRuleActive ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-success font-medium bg-success/10 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 size={13} /> Активно
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] font-medium bg-[var(--border)]/40 px-2.5 py-1 rounded-lg">
                          <PowerOff size={13} /> Отключено
                        </span>
                      )}
                    </td>
                    {isAdmin && isEditMode && (
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(rule);
                          }}
                          className="px-2.5 py-1 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Edit3 size={12} /> Изменить
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно редактирования правила для администратора */}
      {isAdmin && editingRule && editFormData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <div className="w-full max-w-3xl bg-[var(--surface)] rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-[var(--border)] animate-in fade-in zoom-in-95 duration-150">
            {/* Header модального окна */}
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between sticky top-0 bg-[var(--surface)] z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent/10 text-accent rounded-xl font-bold font-mono text-base">
                  {editFormData.id}
                </div>
                <div>
                  <h3 className="text-lg font-bold">Редактирование правила подбора</h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Номер правила зафиксирован в методологии (не редактируется). Изменения сохраняются в реестр правил.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setEditingRule(null);
                  setEditFormData(null);
                }}
                className="p-2 hover:bg-[var(--background)] rounded-xl transition-colors text-[var(--text-secondary)] cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Тело формы */}
            <form onSubmit={handleFormSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Номер правила и статус активности */}
              <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-[var(--text-secondary)] block">Идентификатор правила</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-bold text-accent bg-accent/10 px-3 py-1 rounded-lg text-sm">
                      {editFormData.id}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">Только для чтения</span>
                  </div>
                </div>

                {/* Переключатель «правило активно / отключено» */}
                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                    Статус активности правила <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, enabled: true })}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                        editFormData.enabled !== false
                          ? "bg-success text-white shadow-sm"
                          : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--surface)]/80"
                      )}
                    >
                      <Power size={13} />
                      Активно
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, enabled: false })}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                        editFormData.enabled === false
                          ? "bg-gray-600 text-white shadow-sm"
                          : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--surface)]/80"
                      )}
                    >
                      <PowerOff size={13} />
                      Отключено
                    </button>
                  </div>
                </div>
              </div>

              {/* Описание правила */}
              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1.5">
                  Описание правила (методическое назначение) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={editFormData.description ?? ''}
                  onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[var(--background)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-accent leading-relaxed text-[var(--text-primary)]"
                  placeholder="Опишите, в каких процессах и сценариях срабатывает это правило..."
                />
              </div>

              {/* Привязка к решению и логика объединения условий */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1.5">
                    Целевое решение (S01–S16) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.solution}
                    onChange={e => setEditFormData({ ...editFormData, solution: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[var(--background)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-accent font-medium text-[var(--text-primary)] cursor-pointer"
                  >
                    {AI_SOLUTIONS.map(sol => (
                      <option key={sol.code} value={sol.code}>
                        {sol.code} — {sol.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1.5">
                    Логика объединения условий <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.logic}
                    onChange={e => setEditFormData({ ...editFormData, logic: e.target.value as 'AND' | 'OR' })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[var(--background)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-accent font-medium text-[var(--text-primary)] cursor-pointer"
                  >
                    <option value="AND">AND (Все условия должны выполняться)</option>
                    <option value="OR">OR (Достаточно выполнения одного из условий)</option>
                  </select>
                </div>
              </div>

              {/* Список условий */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider block">
                      Условия правила: ключ поля | оператор | значение
                    </label>
                    <span className="text-[11px] text-[var(--text-secondary)]">
                      Ключи полей берутся строго из реестра полей, предотвращая опечатки и ошибки связей
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCondition}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-accent/10 hover:bg-accent/20 text-accent transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    Добавить условие
                  </button>
                </div>

                {editFormData.conditions.length === 0 ? (
                  <div className="p-4 bg-[var(--background)] rounded-xl border border-dashed border-[var(--border)] text-center text-xs text-[var(--text-secondary)]">
                    У правила нет условий. Нажмите «Добавить условие» для создания условий срабатывания.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {editFormData.conditions.map((cond, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 bg-[var(--background)] rounded-xl border border-[var(--border)] flex flex-col md:flex-row md:items-center gap-2.5"
                      >
                        {/* Ключ поля (выбор из реестра) */}
                        <div className="flex-1">
                          <label className="text-[10px] text-[var(--text-secondary)] font-semibold block mb-1">
                            Ключ поля из реестра
                          </label>
                          <select
                            value={cond.key}
                            onChange={e => handleConditionChange(idx, 'key', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-lg outline-none focus:ring-1 focus:ring-accent font-medium text-[var(--text-primary)] cursor-pointer"
                          >
                            {availableFields.map(f => (
                              <option key={f.key} value={f.key}>
                                {f.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Оператор */}
                        <div className="w-full md:w-36">
                          <label className="text-[10px] text-[var(--text-secondary)] font-semibold block mb-1">
                            Оператор
                          </label>
                          <select
                            value={cond.op}
                            onChange={e => handleConditionChange(idx, 'op', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-lg outline-none focus:ring-1 focus:ring-accent font-medium text-[var(--text-primary)] cursor-pointer"
                          >
                            <option value="==">== (равно)</option>
                            <option value="!=">!= (не равно)</option>
                            <option value="contains">contains (содержит)</option>
                            <option value="not_contains">not_contains (не содерж.)</option>
                            <option value="in">in (в списке)</option>
                            <option value=">">&gt; (больше)</option>
                            <option value="<">&lt; (меньше)</option>
                            <option value="len_gt">len_gt (число элементов &gt;)</option>
                          </select>
                        </div>

                        {/* Значение */}
                        <div className="flex-1">
                          <label className="text-[10px] text-[var(--text-secondary)] font-semibold block mb-1">
                            Значение (строка, число или через запятую)
                          </label>
                          <input
                            type="text"
                            value={conditionValueDrafts[idx] ?? ''}
                            onChange={e => handleConditionChange(idx, 'value', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-lg outline-none focus:ring-1 focus:ring-accent font-medium text-[var(--text-primary)]"
                            placeholder="Например: 50 или скан, бумага"
                          />
                        </div>

                        {/* Кнопка удаления условия */}
                        <div className="self-end md:self-center pt-2 md:pt-4">
                          <button
                            type="button"
                            onClick={() => handleRemoveCondition(idx)}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Удалить условие"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Кнопки действий */}
              <div className="pt-4 border-t border-[var(--border)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRule(null);
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
                  Сохранить правило
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
