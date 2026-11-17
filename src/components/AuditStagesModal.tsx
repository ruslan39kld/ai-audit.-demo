import React, { useState, useEffect } from 'react';
import { Audit, StageStatus, AuditStagesData, ProcessAudit } from '../types';
import { storage } from '../storage';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ChevronRight, 
  ArrowLeft, 
  Save, 
  Sparkles, 
  FileText, 
  Layers, 
  X,
  ExternalLink,
  CheckSquare,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface StageDefinition {
  id: number;
  title: string;
  shortDesc: string;
  checklistItems: string[];
  hasCustomScreen?: boolean;
}

export const AUDIT_STAGES_DEFINITIONS: StageDefinition[] = [
  {
    id: 1,
    title: '1. Установочная диагностика',
    shortDesc: 'Цели руководства, оргструктура, перечень подразделений, используемые системы, ограничения по безопасности',
    checklistItems: [
      'Цели руководства',
      'Оргструктура',
      'Перечень подразделений',
      'Используемые системы',
      'Ограничения по безопасности',
      'Стратегические показатели',
      'Проблемные зоны'
    ]
  },
  {
    id: 2,
    title: '2. Интервью с сотрудниками',
    shortDesc: 'До 10–15 интервью: руководители, владельцы процессов, ключевые специалисты, исполнители, ИТ',
    checklistItems: [
      'Руководители',
      'Владельцы процессов',
      'Ключевые специалисты',
      'Исполнители',
      'ИТ'
    ]
  },
  {
    id: 3,
    title: '3. Анализ процессов',
    shortDesc: 'До 10 процессов: как выполняется сейчас, участники, документы, ручные операции, время, ошибки, задержки, стоимость',
    checklistItems: [
      'Как выполняется сейчас',
      'Участники',
      'Документы',
      'Ручные операции',
      'Время',
      'Ошибки',
      'Задержки',
      'Стоимость',
      'Входные и выходные данные'
    ]
  },
  {
    id: 4,
    title: '4. Оптимизация до автоматизации',
    shortDesc: 'Что исключить, что стандартизировать, что автоматизировать обычными средствами, где нужен ИИ, что оставить человеку',
    checklistItems: [
      'Что исключить',
      'Что стандартизировать',
      'Что автоматизировать обычными средствами',
      'Где нужен ИИ',
      'Что оставить человеку'
    ],
    hasCustomScreen: true
  },
  {
    id: 5,
    title: '5. Оценка AI-готовности',
    shortDesc: 'Наличие и качество данных, доступность документов, возможность интеграции, требования к конфиденциальности, допустимый уровень ошибок',
    checklistItems: [
      'Наличие и качество данных',
      'Доступность документов',
      'Возможность интеграции',
      'Требования к конфиденциальности',
      'Допустимый уровень ошибок',
      'Качество и структура данных',
      'Необходимость размещения на своих серверах',
      'Требования к контролю человека'
    ]
  },
  {
    id: 6,
    title: '6. Целевая модель',
    shortDesc: 'Схема процесса после изменений, распределение работы между человеком и ИИ, контрольные точки, обработка исключений, показатели качества',
    checklistItems: [
      'Схема процесса после изменений',
      'Распределение работы между человеком и ИИ',
      'Контрольные точки',
      'Обработка исключений',
      'Показатели качества',
      'Требования к результату',
      'Кто за что отвечает'
    ]
  },
  {
    id: 7,
    title: '7. Расчёт экономического эффекта',
    shortDesc: 'Трудозатраты, фонд оплаты труда, ошибки и переделки, простои, стоимость внедрения, сопровождение, обучение',
    checklistItems: [
      'Трудозатраты',
      'Фонд оплаты труда',
      'Ошибки и переделки',
      'Простои',
      'Стоимость внедрения',
      'Сопровождение',
      'Обучение',
      'Сроки обработки',
      'Потери выручки',
      'Лицензии',
      'Интеграции'
    ]
  },
  {
    id: 8,
    title: '8. Приоритизация решений',
    shortDesc: 'Оценка каждого процесса по семи критериям',
    checklistItems: [
      'Экономический потенциал и размер экономии',
      'Трудоёмкость и сроки реализации',
      'Качество и доступность данных',
      'Сложность интеграции с ИТ-системами',
      'Готовность персонала и организационные риски',
      'Критичность и допустимый уровень ошибок',
      'Соответствие стратегическим приоритетам компании'
    ]
  },
  {
    id: 9,
    title: '9. Проектирование пилота',
    shortDesc: 'Функции, пользователи, источники данных, интеграции, права доступа, контроль человека, критерии успеха, бюджет и срок',
    checklistItems: [
      'Функции',
      'Пользователи',
      'Источники данных',
      'Интеграции',
      'Права доступа',
      'Контроль человека',
      'Критерии успеха',
      'Бюджет и срок',
      'Ограничения'
    ]
  }
];

interface AuditStagesModalProps {
  audit: Audit;
  isOpen: boolean;
  onClose: () => void;
  onAuditUpdated?: (updatedAudit: Audit) => void;
}

export const AuditStagesModal: React.FC<AuditStagesModalProps> = ({
  audit,
  isOpen,
  onClose,
  onAuditUpdated
}) => {
  // Extract processes for this audit
  const auditProcesses: ProcessAudit[] = React.useMemo(() => {
    const list: ProcessAudit[] = [];
    if (audit.companyData?.departments) {
      audit.companyData.departments.forEach(dept => {
        (dept.processes || []).forEach(proc => {
          list.push(proc);
        });
      });
    }
    if (list.length === 0) {
      return [
        { id: 'proc_1', name: 'Проверка смет и спецификаций' },
        { id: 'proc_2', name: 'Сверка актов КС-2/КС-3 и закрывающих документов' },
        { id: 'proc_3', name: 'Обработка входящих заявок и согласование договоров' }
      ];
    }
    return list;
  }, [audit]);

  // Initial state setup from audit or defaults
  const [stagesData, setStagesData] = useState<AuditStagesData>(() => {
    if (audit.stagesData && audit.stagesData.stages) {
      return audit.stagesData;
    }
    const initialStages: Record<number, any> = {};
    AUDIT_STAGES_DEFINITIONS.forEach(def => {
      const initialChecklist: Record<string, boolean> = {};
      def.checklistItems.forEach(item => {
        initialChecklist[item] = false;
      });
      initialStages[def.id] = {
        id: def.id,
        status: 'не начат' as StageStatus,
        checklist: initialChecklist
      };
    });
    return {
      stages: initialStages,
      optimizationPlans: {}
    };
  });

  const [currentScreen, setCurrentScreen] = useState<'main' | 'optimization_screen'>('main');
  const [optimizationDraft, setOptimizationDraft] = useState<Record<string, {
    exclude: string;
    standardize: string;
    automateTraditional: string;
    needAi: string;
  }>>({});
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    if (stagesData.optimizationPlans) {
      setOptimizationDraft(stagesData.optimizationPlans);
    }
  }, [stagesData]);

  if (!isOpen) return null;

  // Calculate overall progress: how many stages are completed out of 9
  const completedStagesCount = AUDIT_STAGES_DEFINITIONS.filter(
    def => stagesData.stages[def.id]?.status === 'завершён'
  ).length;
  const progressPercent = Math.round((completedStagesCount / AUDIT_STAGES_DEFINITIONS.length) * 100);

  const handleStatusChange = (stageId: number, newStatus: StageStatus) => {
    const updated: AuditStagesData = {
      ...stagesData,
      stages: {
        ...stagesData.stages,
        [stageId]: {
          ...stagesData.stages[stageId],
          id: stageId,
          status: newStatus,
          updatedAt: new Date().toISOString()
        }
      }
    };
    setStagesData(updated);
    saveToAudit(updated);
  };

  const handleChecklistToggle = (stageId: number, item: string) => {
    const currentStage = stagesData.stages[stageId] || {
      id: stageId,
      status: 'не начат',
      checklist: {}
    };
    const currentVal = !!currentStage.checklist?.[item];
    const updatedChecklist = {
      ...(currentStage.checklist || {}),
      [item]: !currentVal
    };

    const updated: AuditStagesData = {
      ...stagesData,
      stages: {
        ...stagesData.stages,
        [stageId]: {
          ...currentStage,
          checklist: updatedChecklist,
          updatedAt: new Date().toISOString()
        }
      }
    };
    setStagesData(updated);
    saveToAudit(updated);
  };

  const handleSaveOptimizationScreen = () => {
    const updated: AuditStagesData = {
      ...stagesData,
      optimizationPlans: optimizationDraft,
      stages: {
        ...stagesData.stages,
        4: {
          ...stagesData.stages[4],
          id: 4,
          status: stagesData.stages[4]?.status === 'не начат' ? 'в работе' : stagesData.stages[4]?.status || 'в работе',
          updatedAt: new Date().toISOString()
        }
      }
    };
    setStagesData(updated);
    saveToAudit(updated);
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      setCurrentScreen('main');
    }, 800);
  };

  const saveToAudit = (data: AuditStagesData) => {
    const updatedAudit: Audit = {
      ...audit,
      stagesData: data,
      updatedAt: new Date().toISOString()
    };
    storage.saveAudit(updatedAudit);
    if (onAuditUpdated) {
      onAuditUpdated(updatedAudit);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)] shrink-0">
          <div className="flex items-center gap-3">
            {currentScreen === 'optimization_screen' ? (
              <button
                onClick={() => setCurrentScreen('main')}
                className="p-2 hover:bg-[var(--surface)] rounded-xl border border-[var(--border)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 text-xs font-semibold"
              >
                <ArrowLeft size={16} />
                <span>Назад к этапам</span>
              </button>
            ) : (
              <div className="p-2 bg-accent/10 text-accent rounded-xl">
                <CheckSquare size={22} />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-[var(--text-primary)]">
                  {currentScreen === 'optimization_screen' 
                    ? 'Оптимизация процессов до автоматизации'
                    : 'Этапы работ: Комплексный AI-аудит'}
                </h3>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
                  {audit.number}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {currentScreen === 'optimization_screen'
                  ? `Заполнение матрицы оптимизации по процессам компании (${auditProcesses.length} ${auditProcesses.length === 1 ? 'процесс' : auditProcesses.length < 5 ? 'процесса' : 'процессов'})`
                  : `Проект: ${audit.projectName} • Кабинет аудитора`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveToast && (
              <span className="text-xs text-success font-semibold flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 size={14} /> Сохранено
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {currentScreen === 'main' ? (
            <>
              {/* Progress Bar Header Card */}
              <div className="p-5 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Общий прогресс выполнения аудита
                    </span>
                    <h4 className="text-xl font-bold text-[var(--text-primary)]">
                      Завершено {completedStagesCount} из {AUDIT_STAGES_DEFINITIONS.length} этапов ({progressPercent}%)
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <CheckCircle2 size={13} /> {completedStagesCount} завершено
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 border border-sky-500/20">
                      <Clock size={13} /> {AUDIT_STAGES_DEFINITIONS.filter(d => stagesData.stages[d.id]?.status === 'в работе').length} в работе
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-500/10 text-slate-500 border border-slate-500/20">
                      <Circle size={13} /> {AUDIT_STAGES_DEFINITIONS.filter(d => !stagesData.stages[d.id] || stagesData.stages[d.id]?.status === 'не начат').length} не начато
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[var(--surface)] h-3.5 rounded-full overflow-hidden border border-[var(--border)] p-0.5">
                  <div 
                    className="bg-accent h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-1"
                    style={{ width: `${Math.max(progressPercent, 4)}%` }}
                  >
                    {progressPercent >= 15 && (
                      <span className="text-[9px] font-bold text-white leading-none">
                        {progressPercent}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 9 Stages List */}
              <div className="space-y-4">
                {AUDIT_STAGES_DEFINITIONS.map(stage => {
                  const stageState = stagesData.stages[stage.id] || {
                    id: stage.id,
                    status: 'не начат' as StageStatus,
                    checklist: {}
                  };
                  const currentStatus = stageState.status || 'не начат';
                  const checklist = stageState.checklist || {};
                  const checkedCount = stage.checklistItems.filter(item => checklist[item]).length;

                  return (
                    <div 
                      key={stage.id}
                      className={cn(
                        "rounded-2xl border transition-all p-5 space-y-4",
                        currentStatus === 'завершён'
                          ? "bg-emerald-500/[0.03] border-emerald-500/30"
                          : currentStatus === 'в работе'
                          ? "bg-sky-500/[0.03] border-sky-500/30"
                          : "bg-[var(--surface)] border-[var(--border)]"
                      )}
                    >
                      {/* Stage Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-[var(--text-primary)]">
                              {stage.title}
                            </h4>
                            <span className="text-xs text-[var(--text-secondary)] font-medium">
                              ({checkedCount} из {stage.checklistItems.length} проверено)
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            {stage.shortDesc}
                          </p>
                        </div>

                        {/* Status Switcher Buttons */}
                        <div className="flex items-center gap-1.5 bg-[var(--background)] p-1 rounded-xl border border-[var(--border)] shrink-0 self-start sm:self-center">
                          {(['не начат', 'в работе', 'завершён'] as StageStatus[]).map(st => (
                            <button
                              key={st}
                              onClick={() => handleStatusChange(stage.id, st)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                                currentStatus === st
                                  ? st === 'завершён'
                                    ? "bg-emerald-500 text-white shadow-sm"
                                    : st === 'в работе'
                                    ? "bg-sky-500 text-white shadow-sm"
                                    : "bg-[var(--surface)] text-[var(--text-primary)] font-bold shadow-sm"
                                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                              )}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Checklist Grid */}
                      <div className="pt-2 border-t border-[var(--border)]/60">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-2.5">
                          Чек-лист этапа ({stage.checklistItems.length} {stage.checklistItems.length === 1 ? 'пункт' : stage.checklistItems.length < 5 ? 'пункта' : 'пунктов'}):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {stage.checklistItems.map((item, idx) => {
                            const isChecked = !!checklist[item];
                            return (
                              <label
                                key={idx}
                                className={cn(
                                  "flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors select-none",
                                  isChecked
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-[var(--text-primary)] font-medium"
                                    : "bg-[var(--background)] border-[var(--border)] text-[var(--text-secondary)] hover:border-accent/40"
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleChecklistToggle(stage.id, item)}
                                  className="rounded border-[var(--border)] text-accent focus:ring-accent w-4 h-4 shrink-0"
                                />
                                <span>{item}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Special Action for Stage 4 */}
                      {stage.hasCustomScreen && (
                        <div className="pt-3 border-t border-[var(--border)]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-accent/5 p-3.5 rounded-xl border border-accent/20">
                          <div>
                            <h5 className="text-xs font-bold text-[var(--text-primary)]">
                              Матрица оптимизации процессов до автоматизации
                            </h5>
                            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                              Заполнение 4 обязательных полей по каждому из {auditProcesses.length} процессов
                            </p>
                          </div>
                          <button
                            onClick={() => setCurrentScreen('optimization_screen')}
                            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shrink-0"
                          >
                            <Sliders size={14} />
                            <span>Открыть экран оптимизации</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Screen for Stage 4: Optimization Before Automation */
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                <b>Методический принцип:</b> Перед автоматизацией и внедрением ИИ необходимо вычистить неэффективность в каждом процессе. Заполните текстовые поля анализа по 4 направлениям для всех процессов аудита.
              </div>

              <div className="space-y-6">
                {auditProcesses.map((proc, index) => {
                  const draft = optimizationDraft[proc.id] || {
                    exclude: '',
                    standardize: '',
                    automateTraditional: '',
                    needAi: ''
                  };

                  const updateField = (field: 'exclude' | 'standardize' | 'automateTraditional' | 'needAi', value: string) => {
                    setOptimizationDraft(prev => ({
                      ...prev,
                      [proc.id]: {
                        ...(prev[proc.id] || { exclude: '', standardize: '', automateTraditional: '', needAi: '' }),
                        [field]: value
                      }
                    }));
                  };

                  return (
                    <div key={proc.id} className="p-5 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-4">
                      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <h4 className="font-bold text-sm text-[var(--text-primary)]">
                            {proc.name}
                          </h4>
                        </div>
                        <span className="text-[11px] text-[var(--text-secondary)] font-mono">
                          ID: {proc.id}
                        </span>
                      </div>

                      {/* 4 Fields per Process */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 1. Что исключить */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            1. Что исключить (устранить)
                          </label>
                          <textarea
                            value={draft.exclude}
                            onChange={(e) => updateField('exclude', e.target.value)}
                            placeholder="Избыточные шаги, дублирующие согласования, ненужные отчеты, ручные перепроверки..."
                            rows={3}
                            className="w-full text-xs p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-accent resize-y"
                          />
                        </div>

                        {/* 2. Что стандартизировать */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            2. Что стандартизировать
                          </label>
                          <textarea
                            value={draft.standardize}
                            onChange={(e) => updateField('standardize', e.target.value)}
                            placeholder="Единые формы документов, регламенты заполнения, правила именования, справочники..."
                            rows={3}
                            className="w-full text-xs p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-accent resize-y"
                          />
                        </div>

                        {/* 3. Что автоматизировать обычными средствами */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-sky-500 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-sky-500" />
                            3. Что автоматизировать обычными средствами
                          </label>
                          <textarea
                            value={draft.automateTraditional}
                            onChange={(e) => updateField('automateTraditional', e.target.value)}
                            placeholder="Скрипты, макросы, автоматические правила в CRM/ERP, интеграции по API, уведомления..."
                            rows={3}
                            className="w-full text-xs p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-accent resize-y"
                          />
                        </div>

                        {/* 4. Где нужен ИИ */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-purple-500 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                            4. Где нужен ИИ
                          </label>
                          <textarea
                            value={draft.needAi}
                            onChange={(e) => updateField('needAi', e.target.value)}
                            placeholder="Распознавание сканов/чертежей, семантический поиск, предиктивная аналитика, генерация текстов..."
                            rows={3}
                            className="w-full text-xs p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-accent resize-y"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Save bar */}
              <div className="pt-4 border-t border-[var(--border)] flex items-center justify-end gap-3 sticky bottom-0 bg-[var(--surface)] p-3 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCurrentScreen('main')}
                  className="btn-secondary text-xs py-2.5 px-4"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleSaveOptimizationScreen}
                  className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2"
                >
                  <Save size={16} />
                  <span>Сохранить матрицу оптимизации</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--background)] flex items-center justify-between text-xs shrink-0">
          <div className="text-[var(--text-secondary)]">
            Формат: <b className="text-[var(--text-primary)]">Комплексный AI-аудит компании</b> (доступно только аудитору)
          </div>
          <button
            onClick={onClose}
            className="btn-secondary py-2 px-5 text-xs font-semibold"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
