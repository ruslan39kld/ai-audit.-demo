import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  UserCheck, 
  Cpu, 
  AlertTriangle, 
  Layers, 
  TrendingUp, 
  ChevronRight,
  Info,
  Edit3,
  Sparkles,
  RotateCcw,
  ChevronLeft,
  Check,
  X
} from 'lucide-react';
import { Initiative, InitiativeCriteriaScores } from '../types';
import { evaluateInitiativeSevenCriteria, SevenCriteriaItem } from '../lib/sevenCriteria';
import { formatCurrency, cn } from '../lib/utils';

interface SevenCriteriaMatrixProps {
  initiatives: Initiative[];
  completeness: number;
  onSelectInitiative?: (ini: Initiative) => void;
  onUpdateInitiativeScores?: (initiativeId: string, scores: Partial<InitiativeCriteriaScores>) => void;
  externalScores?: Record<string, { risks?: number; staffImpact?: number }>;
}

const RISK_DESCRIPTIONS: Record<number, { label: string; desc: string }> = {
  1: { label: 'Критический риск', desc: 'Сложная интеграция, легаси-системы, строгая безопасность' },
  2: { label: 'Существенный риск', desc: 'Требуются специальные меры защиты и доработки API' },
  3: { label: 'Умеренный риск', desc: 'Стандартные технические и процессные риски' },
  4: { label: 'Низкий риск', desc: 'Готовые проверенные решения, минимальные доработки' },
  5: { label: 'Минимальный риск', desc: 'Готовое облачное/коробочное решение, риски нулевые' }
};

const STAFF_DESCRIPTIONS: Record<number, { label: string; desc: string }> = {
  1: { label: 'Высокое сопротивление', desc: 'Опасения увольнений, жесткий саботаж команды' },
  2: { label: 'Опасения и консерватизм', desc: 'Скепсис сотрудников, требуется длительное обучение' },
  3: { label: 'Нейтральное / норма', desc: 'Готовность осваивать при наличии понятных инструкций' },
  4: { label: 'Позитивное восприятие', desc: 'Снимает рутину, сотрудники активно ждут внедрения' },
  5: { label: 'Полная поддержка', desc: 'Максимальный энтузиазм команды и руководства' }
};

export const SevenCriteriaMatrix: React.FC<SevenCriteriaMatrixProps> = ({
  initiatives,
  completeness,
  onSelectInitiative,
  onUpdateInitiativeScores,
  externalScores
}) => {
  // Local state for manual auditor scores if not persisted in parent
  const [internalScores, setInternalScores] = useState<Record<string, { risks?: number; staffImpact?: number }>>({});
  const manualScores = externalScores || internalScores;

  const [activeInitiativeId, setActiveInitiativeId] = useState<string | null>(null);

  // Popover state for in-table quick rating
  const [activePopover, setActivePopover] = useState<{
    initiativeId: string;
    criterion: 'risks' | 'staffImpact';
  } | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    }
    if (activePopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activePopover]);

  // Evaluate all initiatives with 7 criteria and sort by overall priority descending
  const evaluatedInitiatives = initiatives.map(ini => {
    const override = manualScores[ini.id] || {};
    const evalResult = evaluateInitiativeSevenCriteria(
      ini,
      completeness,
      initiatives,
      {
        risks: override.risks ?? ini.criteriaScores?.risks,
        staffImpact: override.staffImpact ?? ini.criteriaScores?.staffImpact
      }
    );
    return {
      initiative: ini,
      evaluation: evalResult
    };
  });

  // Sort by overallPriority descending
  const sortedInitiatives = [...evaluatedInitiatives].sort((a, b) => {
    return b.evaluation.overallPriority - a.evaluation.overallPriority;
  });

  const selectedItem = activeInitiativeId 
    ? sortedInitiatives.find(item => item.initiative.id === activeInitiativeId) || sortedInitiatives[0]
    : sortedInitiatives[0];

  const handleScoreChange = (initId: string, criterionKey: 'risks' | 'staffImpact', value: number | undefined) => {
    if (!externalScores) {
      setInternalScores(prev => {
        const next = { ...prev };
        if (value === undefined) {
          if (next[initId]) {
            const copy = { ...next[initId] };
            delete copy[criterionKey];
            if (Object.keys(copy).length === 0) delete next[initId];
            else next[initId] = copy;
          }
        } else {
          next[initId] = {
            ...next[initId],
            [criterionKey]: value
          };
        }
        return next;
      });
    }
    if (onUpdateInitiativeScores) {
      onUpdateInitiativeScores(initId, { [criterionKey]: value });
    }
  };

  const handleBulkFillBaseline = () => {
    initiatives.forEach(ini => {
      const current = manualScores[ini.id] || {};
      const newRisks = current.risks ?? 3;
      const newStaff = current.staffImpact ?? 3;
      handleScoreChange(ini.id, 'risks', newRisks);
      handleScoreChange(ini.id, 'staffImpact', newStaff);
    });
  };

  const handleClearAllAuditorScores = () => {
    initiatives.forEach(ini => {
      handleScoreChange(ini.id, 'risks', undefined);
      handleScoreChange(ini.id, 'staffImpact', undefined);
    });
  };

  const getScoreBadgeClass = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'bg-[var(--background)] text-[var(--text-secondary)] border border-[var(--border)]';
    if (score >= 4.5) return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold shadow-sm';
    if (score >= 3.5) return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-bold shadow-sm';
    if (score >= 2.5) return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold shadow-sm';
    return 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 font-bold shadow-sm';
  };

  const unassessedCount = sortedInitiatives.filter(i => !i.evaluation.isComplete).length;

  return (
    <div className="card p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Layers size={22} className="text-accent" />
              Оценка инициатив по семи критериям
            </h3>
            {unassessedCount > 0 ? (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold flex items-center gap-1">
                <AlertTriangle size={12} />
                Не оценено: {unassessedCount}
              </span>
            ) : (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} />
                Все 7 критериев заполнены
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            5 критериев рассчитываются автоматически на основе анкеты и экономики, 2 критерия оцениваются экспертом (шкала 1–5). Нажмите на ячейку для быстрой оценки.
          </p>
        </div>

        {/* Action Controls & Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={handleBulkFillBaseline}
            className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 font-medium hover:text-accent"
            title="Заполнить неоцененные поля базовым значением 3 из 5"
          >
            <Sparkles size={14} className="text-amber-500" />
            Автооценка 3/5
          </button>
          
          <button
            onClick={handleClearAllAuditorScores}
            className="p-1.5 hover:bg-[var(--background)] rounded-lg text-[var(--text-secondary)] hover:text-red-500 transition-colors border border-[var(--border)]"
            title="Очистить оценки аудитора"
          >
            <RotateCcw size={14} />
          </button>

          <div className="h-4 w-px bg-[var(--border)] mx-1 hidden sm:block" />

          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 text-accent font-medium">
            <Cpu size={14} />
            5 авто
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
            <UserCheck size={14} />
            2 аудитор
          </span>
        </div>
      </div>

      {/* Main Container: Initiatives Table and Detailed Inspector */}
      <div className="space-y-6">
        {/* Table of all initiatives with 7 criteria */}
        <div className="overflow-x-auto relative">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)]/50 text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-3">Инициатива / Процесс</th>
                <th className="py-3 px-2 text-center" title="Автоматически по экономии">Экономика</th>
                <th className="py-3 px-2 text-center" title="Автоматически по сроку пилота">Скорость</th>
                <th className="py-3 px-2 text-center" title="Автоматически по бюджету">Стоимость</th>
                <th className="py-3 px-2 text-center" title="Автоматически по полноте анкеты">Данные</th>
                <th className="py-3 px-2 text-center text-emerald-600 dark:text-emerald-400 bg-emerald-500/5" title="Нажмите для выбора оценки 1-5">
                  <span className="flex items-center justify-center gap-1">
                    <Edit3 size={11} />
                    Риски (аудит)
                  </span>
                </th>
                <th className="py-3 px-2 text-center" title="Автоматически по числу процессов">Масштаб</th>
                <th className="py-3 px-2 text-center text-emerald-600 dark:text-emerald-400 bg-emerald-500/5" title="Нажмите для выбора оценки 1-5">
                  <span className="flex items-center justify-center gap-1">
                    <Edit3 size={11} />
                    Персонал (аудит)
                  </span>
                </th>
                <th className="py-3 px-3 text-right">Приоритет</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {sortedInitiatives.map(({ initiative: ini, evaluation }, idx) => {
                const isSelected = (selectedItem?.initiative.id === ini.id);
                const scoreRisks = evaluation.criteria.find(c => c.id === 'risks')?.score;
                const scoreStaff = evaluation.criteria.find(c => c.id === 'staffImpact')?.score;

                const isPopoverRisks = activePopover?.initiativeId === ini.id && activePopover.criterion === 'risks';
                const isPopoverStaff = activePopover?.initiativeId === ini.id && activePopover.criterion === 'staffImpact';

                return (
                  <tr 
                    key={ini.id}
                    onClick={() => setActiveInitiativeId(ini.id)}
                    className={cn(
                      "transition-colors cursor-pointer hover:bg-accent/5",
                      isSelected ? "bg-accent/10 border-l-4 border-l-accent font-medium" : ""
                    )}
                  >
                    <td className="py-3 px-3 min-w-[220px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[var(--text-secondary)] font-bold">#{idx + 1}</span>
                        <div>
                          <p className="font-bold text-sm text-[var(--text-primary)]">{ini.name}</p>
                          <p className="text-[11px] text-[var(--text-secondary)]">
                            {ini.departmentName} • {ini.processes && ini.processes.length > 1 ? `${ini.processes.length} процессов` : ini.processName}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 1. Экономический эффект */}
                    <td className="py-3 px-2 text-center">
                      <span className={cn("inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs", getScoreBadgeClass(evaluation.criteria[0]?.score))}>
                        {evaluation.criteria[0]?.score ?? '—'}
                      </span>
                    </td>

                    {/* 2. Скорость внедрения */}
                    <td className="py-3 px-2 text-center">
                      <span className={cn("inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs", getScoreBadgeClass(evaluation.criteria[1]?.score))}>
                        {evaluation.criteria[1]?.score ?? '—'}
                      </span>
                    </td>

                    {/* 3. Стоимость */}
                    <td className="py-3 px-2 text-center">
                      <span className={cn("inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs", getScoreBadgeClass(evaluation.criteria[2]?.score))}>
                        {evaluation.criteria[2]?.score ?? '—'}
                      </span>
                    </td>

                    {/* 4. Качество данных */}
                    <td className="py-3 px-2 text-center">
                      <span className={cn("inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs", getScoreBadgeClass(evaluation.criteria[3]?.score))}>
                        {evaluation.criteria[3]?.score ?? '—'}
                      </span>
                    </td>

                    {/* 5. Риски (ручной) with Interactive Quick Popover */}
                    <td className="py-3 px-2 text-center relative bg-emerald-500/5" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => {
                          setActiveInitiativeId(ini.id);
                          setActivePopover(isPopoverRisks ? null : { initiativeId: ini.id, criterion: 'risks' });
                        }}
                        className={cn(
                          "transition-all duration-150 transform active:scale-95",
                          scoreRisks !== null && scoreRisks !== undefined
                            ? cn("inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs cursor-pointer hover:ring-2 hover:ring-accent", getScoreBadgeClass(scoreRisks))
                            : "px-2.5 py-1 text-[11px] rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/30 hover:bg-amber-500/25 cursor-pointer whitespace-nowrap shadow-xs"
                        )}
                        title="Нажмите для выбора оценки рисков 1–5"
                      >
                        {scoreRisks ?? 'не оценено'}
                      </button>

                      {/* Floating Quick Rating Popover for Risks */}
                      {isPopoverRisks && (
                        <div 
                          ref={popoverRef}
                          className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-1.5 w-64 bg-[var(--surface)] p-3 rounded-xl shadow-2xl border border-[var(--border)] text-left animate-in fade-in zoom-in-95 duration-150"
                        >
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)]">
                            <span className="text-[11px] font-bold text-[var(--text-primary)] flex items-center gap-1">
                              <Edit3 size={12} className="text-accent" />
                              Оценка рисков (1–5)
                            </span>
                            <button 
                              onClick={() => setActivePopover(null)} 
                              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          <div className="grid grid-cols-5 gap-1.5 mb-2">
                            {[1, 2, 3, 4, 5].map((val) => (
                              <button
                                key={val}
                                onClick={() => {
                                  handleScoreChange(ini.id, 'risks', val);
                                  setActivePopover(null);
                                }}
                                className={cn(
                                  "h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                                  scoreRisks === val
                                    ? "bg-accent text-white shadow-md ring-2 ring-accent/30"
                                    : "bg-[var(--background)] hover:bg-accent/15 text-[var(--text-primary)] border border-[var(--border)]"
                                )}
                              >
                                {val}
                              </button>
                            ))}
                          </div>

                          <div className="text-[10px] text-[var(--text-secondary)] bg-[var(--background)] p-2 rounded-lg border border-[var(--border)] space-y-0.5 mb-2">
                            <p className="font-semibold text-[var(--text-primary)]">
                              {scoreRisks ? `${scoreRisks} — ${RISK_DESCRIPTIONS[scoreRisks]?.label}` : 'Выберите балл:'}
                            </p>
                            <p className="line-clamp-2">
                              {scoreRisks ? RISK_DESCRIPTIONS[scoreRisks]?.desc : '1 = высокий риск, 5 = риски отсутствуют'}
                            </p>
                          </div>

                          {scoreRisks !== null && scoreRisks !== undefined && (
                            <button
                              onClick={() => {
                                handleScoreChange(ini.id, 'risks', undefined);
                                setActivePopover(null);
                              }}
                              className="w-full text-center text-[10px] text-red-500 hover:text-red-600 font-medium py-1"
                            >
                              Сбросить оценку
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* 6. Масштабируемость */}
                    <td className="py-3 px-2 text-center">
                      <span className={cn("inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs", getScoreBadgeClass(evaluation.criteria[5]?.score))}>
                        {evaluation.criteria[5]?.score ?? '—'}
                      </span>
                    </td>

                    {/* 7. Влияние на сотрудников (ручной) with Interactive Quick Popover */}
                    <td className="py-3 px-2 text-center relative bg-emerald-500/5" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => {
                          setActiveInitiativeId(ini.id);
                          setActivePopover(isPopoverStaff ? null : { initiativeId: ini.id, criterion: 'staffImpact' });
                        }}
                        className={cn(
                          "transition-all duration-150 transform active:scale-95",
                          scoreStaff !== null && scoreStaff !== undefined
                            ? cn("inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs cursor-pointer hover:ring-2 hover:ring-accent", getScoreBadgeClass(scoreStaff))
                            : "px-2.5 py-1 text-[11px] rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/30 hover:bg-amber-500/25 cursor-pointer whitespace-nowrap shadow-xs"
                        )}
                        title="Нажмите для выбора оценки влияния на персонал 1–5"
                      >
                        {scoreStaff ?? 'не оценено'}
                      </button>

                      {/* Floating Quick Rating Popover for Staff Impact */}
                      {isPopoverStaff && (
                        <div 
                          ref={popoverRef}
                          className="absolute z-50 right-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-1.5 w-64 bg-[var(--surface)] p-3 rounded-xl shadow-2xl border border-[var(--border)] text-left animate-in fade-in zoom-in-95 duration-150"
                        >
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)]">
                            <span className="text-[11px] font-bold text-[var(--text-primary)] flex items-center gap-1">
                              <UserCheck size={12} className="text-emerald-500" />
                              Влияние на команду (1–5)
                            </span>
                            <button 
                              onClick={() => setActivePopover(null)} 
                              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          <div className="grid grid-cols-5 gap-1.5 mb-2">
                            {[1, 2, 3, 4, 5].map((val) => (
                              <button
                                key={val}
                                onClick={() => {
                                  handleScoreChange(ini.id, 'staffImpact', val);
                                  setActivePopover(null);
                                }}
                                className={cn(
                                  "h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                                  scoreStaff === val
                                    ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/30"
                                    : "bg-[var(--background)] hover:bg-emerald-500/15 text-[var(--text-primary)] border border-[var(--border)]"
                                )}
                              >
                                {val}
                              </button>
                            ))}
                          </div>

                          <div className="text-[10px] text-[var(--text-secondary)] bg-[var(--background)] p-2 rounded-lg border border-[var(--border)] space-y-0.5 mb-2">
                            <p className="font-semibold text-[var(--text-primary)]">
                              {scoreStaff ? `${scoreStaff} — ${STAFF_DESCRIPTIONS[scoreStaff]?.label}` : 'Выберите балл:'}
                            </p>
                            <p className="line-clamp-2">
                              {scoreStaff ? STAFF_DESCRIPTIONS[scoreStaff]?.desc : '1 = высокое сопротивление, 5 = полная поддержка'}
                            </p>
                          </div>

                          {scoreStaff !== null && scoreStaff !== undefined && (
                            <button
                              onClick={() => {
                                handleScoreChange(ini.id, 'staffImpact', undefined);
                                setActivePopover(null);
                              }}
                              className="w-full text-center text-[10px] text-red-500 hover:text-red-600 font-medium py-1"
                            >
                              Сбросить оценку
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Итоговый приоритет */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-bold font-mono text-accent">
                            {evaluation.overallPriority.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-[var(--text-secondary)]">/ 5.0</span>
                        </div>
                        {!evaluation.isComplete && (
                          <span className="text-[9px] text-amber-600 dark:text-amber-400 flex items-center gap-1 text-right mt-0.5">
                            <AlertTriangle size={10} className="shrink-0" />
                            оценка неполная
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Initiative Detailed Criteria Card & Auditor Input Controls */}
        {selectedItem && (
          <div className="p-5 sm:p-6 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs bg-accent/10 text-accent font-bold px-2 py-0.5 rounded-full">
                    {selectedItem.initiative.solutionCode}
                  </span>
                  <h4 className="font-bold text-lg">{selectedItem.initiative.name}</h4>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Подразделение: <span className="font-semibold text-[var(--text-primary)]">{selectedItem.initiative.departmentName}</span> • Процесс: <span className="font-semibold text-[var(--text-primary)]">{selectedItem.initiative.processName}</span>
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Итоговый приоритет</p>
                  <p className="text-2xl font-bold font-mono text-accent">
                    {selectedItem.evaluation.overallPriority.toFixed(1)} <span className="text-xs font-normal text-[var(--text-secondary)]">/ 5.0</span>
                  </p>
                </div>
                {onSelectInitiative && (
                  <button 
                    onClick={() => onSelectInitiative(selectedItem.initiative)}
                    className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-medium shadow-xs"
                  >
                    <HelpCircle size={15} />
                    Расчёт экономики
                  </button>
                )}
              </div>
            </div>

            {/* Warning if auditor criteria missing */}
            {!selectedItem.evaluation.isComplete && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-300">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                  <span>
                    <b>Оценка неполная:</b> заполните риски и влияние на сотрудников для корректного расчёта итогового приоритета.
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleScoreChange(selectedItem.initiative.id, 'risks', 3);
                    handleScoreChange(selectedItem.initiative.id, 'staffImpact', 3);
                  }}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg font-bold text-[11px] whitespace-nowrap transition-colors"
                >
                  Поставить 3 и 3
                </button>
              </div>
            )}

            {/* Criteria Grid (7 items detailed cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
              {selectedItem.evaluation.criteria.map((crit) => {
                const isAuditor = crit.isAuditorManual;
                const score = crit.score;

                return (
                  <div 
                    key={crit.id} 
                    className={cn(
                      "p-3.5 rounded-xl border flex flex-col justify-between space-y-3 transition-all",
                      isAuditor 
                        ? "bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/10" 
                        : "bg-[var(--surface)] border-[var(--border)]"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                          isAuditor ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-accent/10 text-accent"
                        )}>
                          {crit.source}
                        </span>
                        {score !== null && score !== undefined ? (
                          <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded", getScoreBadgeClass(score))}>
                            {score} / 5
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                            не оценено
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-xs leading-snug">{crit.name}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-1 line-clamp-3 leading-normal">
                        {crit.explanation}
                      </p>
                    </div>

                    {/* Auditor interactive rating buttons (1 to 5) */}
                    {isAuditor && (
                      <div className="pt-2 border-t border-[var(--border)]">
                        <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Edit3 size={10} className="text-emerald-600" />
                            Оценка (1–5):
                          </span>
                          {score !== null && score !== undefined && (
                            <button
                              onClick={() => handleScoreChange(
                                selectedItem.initiative.id, 
                                crit.id as 'risks' | 'staffImpact', 
                                undefined
                              )}
                              className="text-[9px] text-red-500 hover:underline"
                            >
                              сброс
                            </button>
                          )}
                        </p>
                        <div className="grid grid-cols-5 gap-1">
                          {[1, 2, 3, 4, 5].map((val) => {
                            const isValSelected = score === val;
                            return (
                              <button
                                key={val}
                                onClick={() => handleScoreChange(
                                  selectedItem.initiative.id, 
                                  crit.id as 'risks' | 'staffImpact', 
                                  val
                                )}
                                className={cn(
                                  "py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                                  isValSelected 
                                    ? "bg-accent text-white shadow-sm ring-2 ring-accent/30 scale-105" 
                                    : "bg-[var(--background)] hover:bg-accent/15 text-[var(--text-primary)] border border-[var(--border)] active:scale-95"
                                )}
                                title={
                                  crit.id === 'risks' 
                                    ? RISK_DESCRIPTIONS[val]?.label 
                                    : STAFF_DESCRIPTIONS[val]?.label
                                }
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                        {score && (
                          <p className="text-[9px] text-[var(--text-secondary)] mt-1 text-center truncate">
                            {crit.id === 'risks' ? RISK_DESCRIPTIONS[score]?.label : STAFF_DESCRIPTIONS[score]?.label}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation between initiatives */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
              <span>
                Инициатива {sortedInitiatives.findIndex(i => i.initiative.id === selectedItem.initiative.id) + 1} из {sortedInitiatives.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const currentIndex = sortedInitiatives.findIndex(i => i.initiative.id === selectedItem.initiative.id);
                    if (currentIndex > 0) {
                      setActiveInitiativeId(sortedInitiatives[currentIndex - 1].initiative.id);
                    }
                  }}
                  disabled={sortedInitiatives.findIndex(i => i.initiative.id === selectedItem.initiative.id) === 0}
                  className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  Предыдущая
                </button>
                <button
                  onClick={() => {
                    const currentIndex = sortedInitiatives.findIndex(i => i.initiative.id === selectedItem.initiative.id);
                    if (currentIndex < sortedInitiatives.length - 1) {
                      setActiveInitiativeId(sortedInitiatives[currentIndex + 1].initiative.id);
                    }
                  }}
                  disabled={sortedInitiatives.findIndex(i => i.initiative.id === selectedItem.initiative.id) === sortedInitiatives.length - 1}
                  className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1 disabled:opacity-40"
                >
                  Следующая
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

