import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Send, 
  Plus, 
  Trash2, 
  AlertCircle, 
  AlertTriangle,
  CheckCircle2, 
  Clock, 
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Info,
  Zap,
  Check,
  FileText,
  Sparkles,
  Shield,
  X
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { DEPARTMENTS, MATURITY_LEVELS } from '../auditMetadata';
import { storage } from '../storage';
import { CompanyAuditData, DepartmentAudit, ProcessAudit, View, Audit } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AuditResultsView } from './AuditResultsView';
import { runAuditAnalysis, createAuditFromCompanyData } from '../lib/auditEngine';

import { useAuth } from '../contexts/AuthContext';

import { FIELD_REGISTRY, FieldDefinition } from '../lib/fieldRegistry';
import { DynamicField } from '../components/ui/DynamicField';
import { 
  calculateAiMaturityLevel, 
  getAiMaturityDetails, 
  AI_BLOCK_FREE_FIELDS, 
  AI_BLOCK_PAID_FIELDS 
} from '../lib/aiMaturity';

interface AuditWizardProps {
  onComplete: (data: CompanyAuditData) => void;
  onCancel: () => void;
}

const STEPS = [
  { id: 1, title: 'Формат аудита', shortTitle: 'Формат' },
  { id: 2, title: 'Профиль компании', shortTitle: 'Профиль' },
  { id: 3, title: 'Периметр аудита', shortTitle: 'Периметр' },
  { id: 4, title: 'Сбор данных', shortTitle: 'Сбор данных' },
  { id: 5, title: 'Сводка и запуск', shortTitle: 'Сводка' }
];

const INITIAL_DATA: CompanyAuditData = {
  format: '' as any,
  profile: {
    clientId: '',
    co_name: '',
    co_inn: '',
    co_industry: 'Производство',
    co_headcount_total: 0,
    co_headcount_scope: 0,
    co_revenue: 0,
    co_legal_entities: 1,
    co_branches: 1,
    co_geography: 'Вся страна',
    co_hourly_rate: 1500,
    co_initiator: 'CEO',
    co_triggers: [],
    co_automation_history: 'Не было',
    co_constraints: [],
    co_ai_budget: '',
    // Legacy support for results view if needed
    industry: 'Производство',
    totalStaff: 0,
    avgHourlyRate: 1500
  },
  departments: []
};

export const AuditWizardView: React.FC<AuditWizardProps> = ({ onComplete, onCancel }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<CompanyAuditData>(() => {
    const draft = storage.get<CompanyAuditData>('draft_audit');
    if (draft && draft.format) return draft;
    return {
      ...INITIAL_DATA,
      format: '' as any,
      profile: {
        ...INITIAL_DATA.profile,
        clientId: user?.role === 'client' ? user.id : ''
      }
    };
  });
  const [activeDeptId, setActiveDeptId] = useState<string>('');
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({
    'block-a': true,
    'block-b2': true,
    'block-ai-usage': true,
    'block-b': true,
    'block-c': false,
    'block-d': false,
    'block-e': false,
    'block-g': false,
  });
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState(0);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [processLimitMessage, setProcessLimitMessage] = useState<string | null>(null);

  const ANALYSIS_STAGES = [
    'Проверка полноты данных',
    'Расчёт трудозатрат по процессам',
    'Расчёт уровня AI-зрелости',
    'Применение правил подбора',
    'Расчёт экономики и ROI',
    'Интерпретация данных',
    'Сборка отчёта'
  ];

  const clients = storage.getClients();

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisStage(0);
    setAnalysisProgress(0);
    
    let currentStage = 0;
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        const next = prev + 1;
        if (next % 15 === 0 && currentStage < ANALYSIS_STAGES.length - 1) {
          currentStage++;
          setAnalysisStage(currentStage);
        }
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsAnalyzing(false);
            setShowResults(true);
          }, 500);
          return 100;
        }
        return next;
      });
    }, 60);
  };

  // Autosave simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setIsSaving(true);
      setTimeout(() => {
        setLastSaved(new Date());
        setIsSaving(false);
      }, 500);
    }, 15000);
    return () => clearInterval(timer);
  }, [data]);

  // Auto-select first department in Step 4 if none selected
  useEffect(() => {
    if (step === 4 && !activeDeptId && data.departments.length > 0) {
      setActiveDeptId(data.departments[0].id);
    }
  }, [step, data.departments, activeDeptId]);

  // Синхронизация вычисленного ai_level при изменении ответов блока
  useEffect(() => {
    let hasChanges = false;
    const nextDepartments = data.departments.map(dept => {
      const { aiLevelValue } = calculateAiMaturityLevel(dept, data.format);
      if (dept.ai_level !== aiLevelValue) {
        hasChanges = true;
        return { ...dept, ai_level: aiLevelValue };
      }
      return dept;
    });

    if (hasChanges) {
      setData(prev => ({
        ...prev,
        departments: nextDepartments
      }));
    }
  }, [data.departments, data.format]);

  if (showResults) {
    return (
      <div className="flex-1 overflow-y-auto p-12 bg-[var(--background)]">
        <div className="max-w-6xl mx-auto">
          <AuditResultsView 
            data={data} 
            onClose={() => {
              const initiatives = runAuditAnalysis(data);
              const audit = createAuditFromCompanyData(data, initiatives);
              storage.saveAudit(audit);
              onComplete(data);
            }} 
          />
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--background)] p-12">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="relative w-32 h-32 mx-auto">
             <div className="absolute inset-0 border-4 border-accent/10 rounded-full" />
             <div 
               className="absolute inset-0 border-4 border-accent rounded-full border-t-transparent animate-spin" 
             />
             <div className="absolute inset-0 flex items-center justify-center">
                <Zap size={32} className="text-accent animate-pulse" />
             </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Запускаем AI-анализ...</h2>
            <p className="text-[var(--text-secondary)] text-sm">
              Обрабатываем {data.departments.length} подразделений и {data.departments.reduce((acc, d) => acc + d.processes.length, 0)} процессов
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
               <div 
                 className="h-full bg-accent transition-all duration-300"
                 style={{ width: `${analysisProgress}%` }}
               />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-[var(--text-secondary)] uppercase">
               <span>
                 {analysisProgress < 30 ? 'Сбор данных...' : 
                  analysisProgress < 60 ? 'Мэтчинг решений...' : 
                  analysisProgress < 90 ? 'Расчет ROI...' : 'Генерация отчета...'}
               </span>
               <span>{analysisProgress}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toggleDept = (deptId: string) => {
    const exists = data.departments.find(d => d.id === deptId);
    if (exists) {
      setData(prev => ({
        ...prev,
        departments: prev.departments.filter(d => d.id !== deptId)
      }));
      if (activeDeptId === deptId) {
        const remaining = data.departments.filter(d => d.id !== deptId);
        setActiveDeptId(remaining[0]?.id || '');
      }
      return;
    }

    // Restriction for express format: only 1 department!
    if (data.format === 'express' && data.departments.length >= 1) {
      setNoticeMessage('в бесплатном формате обследуется одно подразделение');
      return;
    }
    setNoticeMessage(null);

    const deptMeta = DEPARTMENTS.find(d => d.id === deptId);
    
    // Generate template processes (max 2 initial in express so user can pick up to 3)
    const templateProcesses: ProcessAudit[] = (deptMeta?.typicalProcesses || []).slice(0, data.format === 'express' ? 2 : 4).map(p => ({
      id: Math.random().toString(36).substr(2, 9),
      name: p,
      executor: { role: 'Специалист', count: 2 },
      frequency: 'ежедневно',
      timePerOperation: 30,
      operationsPerMonth: 100,
      manualWorkShare: 60,
      systems: [],
      inputDataFormat: ['цифровой (текст/таблицы)'],
      isStandardized: 'частично',
      humanDecisionRequired: 'иногда',
      errorFrequency: 'редко',
      typicalLosses: ['ручной ввод данных'],
      currentAiUsage: 'не используется',
      isQuickFill: true,
      dataPrivacyLevel: 'средний',
      peakLoadMultiplier: 1.2,
      clientImpact: 3,
      complianceRisk: 'нет',
      automationPriority: 3,
      externalPartnersInvolved: false,
      feedbackLoopExists: false,
      documentationQuality: 3,
      automationPotential: 0,
      complexity: 2,
      estimatedHoursSaved: 0,
      roi: 0
    }));

    const newDept: DepartmentAudit = {
      id: deptId,
      name: deptMeta?.name || deptId,
      isEnabled: true,
      isDelegated: false,
      completion: 15,
      staffCount: 10,
      roles: [{ role: 'Специалист', count: 8 }, { role: 'Руководитель', count: 2 }],
      workMode: '5/2',
      seasonality: 'нет',
      turnoverRate: 15,
      openVacancies: 0,
      processes: templateProcesses,
      aiUsage: {
        level: 1,
        tools: [],
        tasks: [],
        userBase: 'никто',
        paymentModel: 'не используется',
        dataSecurityCase: 'нет',
        rules: 'нет ничего',
        barriers: ['нет экспертизы'],
        staffSatisfaction: 3,
        successCase: ''
      },
      systems: [],
      hasApi: 'unknown',
      docStorage: ['Облачное хранилище'],
      hasKnowledgeBase: false,
      dataQuality: 3,
      timeTracking: 'none',
      managerSupport: 3,
      staffReadiness: 3,
      changeOwner: { exists: false },
      automationAttitude: 'нейтрально',
      staffFreeTime: 'минимум',
      pains: [],
      mainIrritant: ''
    };

    setData(prev => ({
      ...prev,
      departments: [...prev.departments, newDept]
    }));
    if (!activeDeptId) {
      setActiveDeptId(deptId);
    }
  };

  const updateProfile = (field: keyof typeof INITIAL_DATA.profile, value: any) => {
    setData(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }));
  };

  const updateDept = (deptId: string, updates: Partial<DepartmentAudit>) => {
    setData(prev => ({
      ...prev,
      departments: prev.departments.map(d => d.id === deptId ? { ...d, ...updates } : d)
    }));
  };

  const addProcess = (deptId: string, processName: string) => {
    const dept = data.departments.find(d => d.id === deptId);
    const currentCount = dept?.processes.length || 0;

    if (data.format === 'express' && currentCount >= 3) {
      setProcessLimitMessage('в бесплатном формате рассматривается до трёх процессов, для полного анализа доступен комплексный аудит');
      return;
    }
    if (data.format === 'comprehensive' && currentCount >= 10) {
      setProcessLimitMessage('В базовом пакете комплексного аудита доступно до 10 процессов');
      return;
    }
    setProcessLimitMessage(null);

    const newProcess: ProcessAudit = {
      id: Math.random().toString(36).substr(2, 9),
      name: processName,
      executor: { role: '', count: 1 },
      frequency: 'ежедневно',
      timePerOperation: 30,
      operationsPerMonth: 100,
      manualWorkShare: 50,
      systems: [],
      inputDataFormat: [],
      isStandardized: 'частично',
      humanDecisionRequired: 'иногда',
      errorFrequency: 'редко',
      typicalLosses: [],
      currentAiUsage: 'не используется',
      dataPrivacyLevel: 'средний',
      peakLoadMultiplier: 1.2,
      clientImpact: 3,
      complianceRisk: 'нет',
      automationPriority: 3,
      externalPartnersInvolved: false,
      feedbackLoopExists: false,
      documentationQuality: 3,
      automationPotential: 0,
      complexity: 2,
      estimatedHoursSaved: 0,
      roi: 0
    };

    setData(prev => ({
      ...prev,
      departments: prev.departments.map(d => 
        d.id === deptId ? { ...d, processes: [...d.processes, newProcess] } : d
      )
    }));
  };

  const removeProcess = (deptId: string, processId: string) => {
    setData(prev => ({
      ...prev,
      departments: prev.departments.map(d => 
        d.id === deptId ? { ...d, processes: d.processes.filter(p => p.id !== processId) } : d
      )
    }));
  };

  const updateProcess = (deptId: string, processId: string, updates: Partial<ProcessAudit>) => {
    setData(prev => ({
      ...prev,
      departments: prev.departments.map(d => 
        d.id === deptId ? { 
          ...d, 
          processes: d.processes.map(p => p.id === processId ? { ...p, ...updates } : p)
        } : d
      )
    }));
  };

  const activeDept = data.departments.find(d => d.id === activeDeptId);

  const BLOCKS = [
    { id: 'block-a', title: 'Состав и нагрузка', icon: 'А', level: 'department' as const, filter: (f: FieldDefinition) => f.key.startsWith('dp_') },
    { id: 'block-b2', title: 'Контекст отдела', icon: 'Б', level: 'department' as const, filter: (f: FieldDefinition) => f.block === 'B2' },
    { id: 'block-ai-usage', title: 'Как ИИ уже используется', icon: 'В', level: 'ai_usage' as const },
    { id: 'block-b', title: 'Бизнес-процессы', icon: 'Г', level: 'process' as const, filter: (f: FieldDefinition) => f.key.startsWith('pr_') },
    { id: 'block-g', title: 'Потери и боли', icon: 'Д', level: 'department' as const, filter: (f: FieldDefinition) => f.key.startsWith('loss_') },
    { id: 'block-d', title: 'Данные и системы', icon: 'Е', level: 'department' as const, filter: (f: FieldDefinition) => f.key.startsWith('sys_') },
  ].filter(b => {
    if (data.format === 'express') {
      return b.id === 'block-a' || b.id === 'block-b2' || b.id === 'block-ai-usage' || b.id === 'block-b';
    }
    return true;
  });

  const calculateCompletion = (dept: DepartmentAudit) => {
    const deptFields = FIELD_REGISTRY.filter(f => f.level === 'department');
    const filledDept = deptFields.filter(f => dept[f.key] !== undefined && dept[f.key] !== '').length;
    
    let processCompletion = 0;
    if (dept.processes.length > 0) {
      const prFields = FIELD_REGISTRY.filter(f => f.level === 'process');
      const totalPrFilled = dept.processes.reduce((acc, pr) => {
        return acc + prFields.filter(f => pr[f.key] !== undefined && pr[f.key] !== '').length;
      }, 0);
      processCompletion = (totalPrFilled / (prFields.length * dept.processes.length)) * 100;
    }

    const deptCompletion = (filledDept / deptFields.length) * 100;
    return Math.round((deptCompletion + processCompletion) / (dept.processes.length > 0 ? 2 : 1));
  };

  const checkVisibility = (field: FieldDefinition, context: any) => {
    if (!field.showIf) return true;
    const targetVal = context[field.showIf.key];
    if (field.showIf.op === '==' && targetVal !== field.showIf.value) return false;
    if (field.showIf.op === 'contains') {
       const values = Array.isArray(targetVal) ? targetVal : [targetVal];
       if (Array.isArray(field.showIf.value)) {
         return field.showIf.value.some(v => values.includes(v));
       }
       return values.includes(field.showIf.value);
    }
    return true;
  };

  const totalQuestions = data.departments.length * 20; // heuristic
  const answeredQuestions = data.departments.reduce((acc, d) => acc + (calculateCompletion(d) / 100) * 20, 0);

  const analysis = runAuditAnalysis(data);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--background)]">
      {/* Top Bar */}
      <div className="h-16 border-b border-[var(--border)] bg-[var(--surface)] px-4 lg:px-6 flex items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <button 
            type="button"
            onClick={() => step > 1 ? setStep(step - 1) : onCancel()} 
            className="p-2 hover:bg-[var(--background)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title={step > 1 ? "Назад на предыдущий шаг" : "Отменить и вернуться в список"}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="h-6 w-px bg-[var(--border)] hidden sm:block" />
          <div>
            <h1 className="font-bold text-xs sm:text-sm truncate">Новый AI-аудит компании</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-[var(--text-secondary)]">Шаг {step} из {STEPS.length}: {STEPS[step-1].title}</span>
              <div className="flex md:hidden items-center gap-1 ml-1">
                {STEPS.map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      "h-1 rounded-full transition-all",
                      step === s.id ? "w-3 bg-accent" : step > s.id ? "w-1.5 bg-emerald-500" : "w-1.5 bg-[var(--border)]"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5-Step Progress Stepper (Requirement 4) */}
        <nav aria-label="Этапы визарда" className="hidden md:flex items-center gap-1 lg:gap-2">
          {STEPS.map((s, idx) => {
            const isActive = step === s.id;
            const isPassed = step > s.id;
            return (
              <div key={s.id} className="flex items-center gap-1 lg:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (s.id < step) setStep(s.id);
                  }}
                  disabled={s.id > step}
                  className={cn(
                    "flex items-center gap-1.5 py-1 px-2 rounded-lg text-xs transition-all",
                    isActive
                      ? "bg-accent/10 text-accent font-bold ring-1 ring-accent/30 shadow-xs"
                      : isPassed
                        ? "text-[var(--text-primary)] hover:bg-[var(--surface-hover)] cursor-pointer font-medium"
                        : "text-[var(--text-secondary)] opacity-40 cursor-not-allowed"
                  )}
                  title={`Шаг ${s.id}: ${s.title}`}
                >
                  <span className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors",
                    isActive
                      ? "bg-accent text-white"
                      : isPassed
                        ? "bg-emerald-500 text-white"
                        : "bg-[var(--border)] text-[var(--text-secondary)]"
                  )}>
                    {isPassed ? <Check size={11} strokeWidth={3} /> : s.id}
                  </span>
                  <span className="hidden xl:inline">{s.title}</span>
                  <span className="inline xl:hidden">{s.shortTitle}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={cn(
                    "w-2 lg:w-4 h-0.5 rounded-full transition-colors",
                    step > idx + 1 ? "bg-emerald-500" : "bg-[var(--border)]"
                  )} />
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden 2xl:flex items-center gap-2 text-[var(--text-secondary)] text-[10px]">
            {isSaving ? <Clock size={12} className="animate-spin" /> : <CheckCircle2 size={12} className="text-success" />}
            <span className="font-medium">Автосохранение</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => step > 1 ? setStep(step - 1) : onCancel()}
              className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
            >
              <ChevronLeft size={14} />
              <span>{step > 1 ? 'Назад' : 'Отменить аудит'}</span>
            </button>
            <button 
              type="button"
              disabled={step === 1 && !data.format}
              onClick={() => {
                if (step < STEPS.length) {
                  setStep(step + 1);
                } else {
                  startAnalysis();
                }
              }}
              className={cn(
                "btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5 shadow-md shadow-accent/20 transition-all",
                step === 1 && !data.format && "opacity-40 cursor-not-allowed pointer-events-none"
              )}
            >
              <span>{step === STEPS.length ? 'Запустить анализ' : 'Далее'}</span>
              {step === STEPS.length ? <Send size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Step 1: Format Selection */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto p-8 lg:p-12">
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold tracking-tight">Выберите формат аудита</h2>
                <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
                  Выберите один из двух форматов. Система адаптирует структуру опросника, доступные блоки и методику расчёта.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Format 1: Express */}
                <div 
                  onClick={() => {
                    setData(prev => ({
                      ...prev,
                      format: 'express',
                      departments: prev.departments.slice(0, 1)
                    }));
                  }}
                  className={cn(
                    "relative cursor-pointer rounded-2xl p-7 border-2 transition-all flex flex-col justify-between space-y-6",
                    data.format === 'express'
                      ? "border-sky-500 bg-sky-500/5 shadow-xl ring-2 ring-sky-500/20"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-sky-500/40 hover:bg-[var(--surface)]/80"
                  )}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full">
                        ФОРМАТ 1
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Бесплатно, по сертификату
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold">Бесплатная экспресс-оценка AI-готовности</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        Диагностика потенциала автоматизации и экспресс-оценка эффекта для 1 подразделения
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-[var(--border)]">
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-[var(--text-secondary)]">Стоимость</p>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">0 ₽</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-[var(--text-secondary)]">Срок</p>
                        <p className="text-sm font-bold">3–5 дней</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-[var(--text-secondary)]">Формат</p>
                        <p className="text-xs font-semibold">Удалённо (до 60 мин)</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Что входит:</p>
                        <ul className="text-xs space-y-1 text-[var(--text-primary)]">
                          <li className="flex items-start gap-2">
                            <Check size={14} className="text-sky-500 shrink-0 mt-0.5" />
                            <span>1 подразделение компании</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check size={14} className="text-sky-500 shrink-0 mt-0.5" />
                            <span>До 3 ключевых процессов</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check size={14} className="text-sky-500 shrink-0 mt-0.5" />
                            <span>Онлайн-интервью с одним руководителем (до 60 мин)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check size={14} className="text-sky-500 shrink-0 mt-0.5" />
                            <span>Расчёт метрик по процессам (трудозатраты, ручной труд)</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Что получает компания:</p>
                        <ul className="text-xs space-y-1 text-[var(--text-primary)]">
                          <li className="flex items-start gap-2">
                            <FileText size={14} className="text-sky-500 shrink-0 mt-0.5" />
                            <span>Письменное заключение (1–3 страницы)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Sparkles size={14} className="text-sky-500 shrink-0 mt-0.5" />
                            <span>Экспресс-оценка экономического эффекта (диапазон)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Shield size={14} className="text-sky-500 shrink-0 mt-0.5" />
                            <span>Первичный AI-индекс готовности подразделения</span>
                          </li>
                        </ul>
                      </div>

                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                          <AlertCircle size={13} />
                          Ограничения формата:
                        </p>
                        <ul className="text-[11px] text-amber-800/80 dark:text-amber-200/80 space-y-0.5 list-disc list-inside">
                          <li>Строго 1 подразделение</li>
                          <li>Не более 3 процессов</li>
                          <li>Только базовые вопросы (6 параметров на процесс)</li>
                          <li>Блоки Г, Д, Е отключены</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className={cn(
                      "w-full py-2.5 rounded-xl font-medium text-xs text-center transition-colors flex items-center justify-center gap-2",
                      data.format === 'express'
                        ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                        : "bg-[var(--background)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}>
                      {data.format === 'express' ? <CheckCircle2 size={16} /> : null}
                      {data.format === 'express' ? 'Выбран бесплатный экспресс-формат' : 'Выбрать этот формат'}
                    </div>
                  </div>
                </div>

                {/* Format 2: Comprehensive */}
                <div 
                  onClick={() => {
                    setData(prev => ({
                      ...prev,
                      format: 'comprehensive'
                    }));
                  }}
                  className={cn(
                    "relative cursor-pointer rounded-2xl p-7 border-2 transition-all flex flex-col justify-between space-y-6",
                    data.format === 'comprehensive'
                      ? "border-purple-600 bg-purple-600/5 shadow-xl ring-2 ring-purple-600/20"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-purple-600/40 hover:bg-[var(--surface)]/80"
                  )}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full">
                        ФОРМАТ 2
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        Коммерческий аудит
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold">Комплексный AI-аудит компании</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        Глубокое комплексное исследование компании, ИТ-ландшафта, рисков и окупаемости
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-[var(--border)]">
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-[var(--text-secondary)]">Стоимость</p>
                        <p className="text-sm font-bold text-purple-600 dark:text-purple-400">650 000 ₽</p>
                        <p className="text-[9px] text-[var(--text-secondary)]">вилка 500–900 т.₽</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-[var(--text-secondary)]">Срок</p>
                        <p className="text-sm font-bold">4–8 недель</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-[var(--text-secondary)]">Формат</p>
                        <p className="text-xs font-semibold">Очно, удалённо, гибрид</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Что входит:</p>
                        <ul className="text-xs space-y-1 text-[var(--text-primary)]">
                          <li className="flex items-start gap-2">
                            <Check size={14} className="text-purple-600 shrink-0 mt-0.5" />
                            <span>Все подразделения компании</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check size={14} className="text-purple-600 shrink-0 mt-0.5" />
                            <span>До 10 процессов в базовом пакете</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check size={14} className="text-purple-600 shrink-0 mt-0.5" />
                            <span>10–15 интервью со специалистами и стейкхолдерами</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check size={14} className="text-purple-600 shrink-0 mt-0.5" />
                            <span>Все блоки А, Б, В, Г (боли), Д (системы), Е (AI-опыт)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check size={14} className="text-purple-600 shrink-0 mt-0.5" />
                            <span>Опросник из 26 вопросов на каждый процесс</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Что получает компания:</p>
                        <ul className="text-xs space-y-1 text-[var(--text-primary)]">
                          <li className="flex items-start gap-2">
                            <FileText size={14} className="text-purple-600 shrink-0 mt-0.5" />
                            <span>Отчёт из 12 структурированных документов</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Sparkles size={14} className="text-purple-600 shrink-0 mt-0.5" />
                            <span>Карты процессов «как есть» и «как будет»</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Shield size={14} className="text-purple-600 shrink-0 mt-0.5" />
                            <span>Детальный расчёт ROI, концепция пилота и дорожная карта (6–12 мес.)</span>
                          </li>
                        </ul>
                      </div>

                      <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                        <p className="text-[11px] font-bold text-purple-700 dark:text-purple-300 mb-1 flex items-center gap-1.5">
                          <Info size={13} />
                          Условия пакета:
                        </p>
                        <ul className="text-[11px] text-purple-800/80 dark:text-purple-200/80 space-y-0.5 list-disc list-inside">
                          <li>До 10 процессов в базовом пакете (расширяемо)</li>
                          <li>Доступны все блоки, глубокие параметры и интеграции</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className={cn(
                      "w-full py-2.5 rounded-xl font-medium text-xs text-center transition-colors flex items-center justify-center gap-2",
                      data.format === 'comprehensive'
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                        : "bg-[var(--background)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}>
                      {data.format === 'comprehensive' ? <CheckCircle2 size={16} /> : null}
                      {data.format === 'comprehensive' ? 'Выбран комплексный аудит' : 'Выбрать этот формат'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Banner for Step 1 */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full shrink-0 transition-colors",
                    data.format === 'express' ? "bg-sky-500" : data.format === 'comprehensive' ? "bg-purple-600" : "bg-[var(--border)]"
                  )} />
                  <span className="text-xs text-[var(--text-secondary)]">
                    {data.format === 'express' && 'Выбран бесплатный экспресс-формат: 1 подразделение, до 3 процессов.'}
                    {data.format === 'comprehensive' && 'Выбран коммерческий аудит: комплексное обследование до 10 процессов.'}
                    {!data.format && 'Нажмите на одну из карточек выше, чтобы выбрать формат аудита.'}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={!data.format}
                  onClick={() => setStep(2)}
                  className={cn(
                    "btn-primary py-2.5 px-6 text-xs flex items-center gap-2 whitespace-nowrap transition-all shadow-md shadow-accent/20",
                    !data.format && "opacity-40 cursor-not-allowed pointer-events-none"
                  )}
                >
                  <span>Продолжить к профилю компании</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Profile */}
        {step === 2 && (
          <div className="flex-1 overflow-y-auto p-12">
            <div className="max-w-[1600px] mx-auto space-y-10">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Профиль компании</h2>
                <p className="text-[var(--text-secondary)]">Базовые параметры для калибровки моделей и расчёта ROI</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-8">
                {FIELD_REGISTRY.filter(f => f.level === 'company' && f.block !== 'Системное').map(field => {
                  // Basic visibility check
                  if (field.showIf) {
                    const targetVal = data.profile[field.showIf.key];
                    if (field.showIf.op === '==' && targetVal !== field.showIf.value) return null;
                    if (field.showIf.op === 'contains') {
                       const values = Array.isArray(targetVal) ? targetVal : [targetVal];
                       if (Array.isArray(field.showIf.value)) {
                         if (!field.showIf.value.some(v => values.includes(v))) return null;
                       } else if (!values.includes(field.showIf.value)) return null;
                    }
                  }

                  return (
                    <DynamicField
                      key={field.key}
                      field={field}
                      value={data.profile[field.key]}
                      onChange={(val) => {
                        updateProfile(field.key as any, val);
                        // Compatibility sync
                        if (field.key === 'co_industry') updateProfile('industry' as any, val);
                        if (field.key === 'co_headcount_total') updateProfile('totalStaff' as any, val);
                        if (field.key === 'co_hourly_rate') updateProfile('avgHourlyRate' as any, val);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Department Selection */}
        {step === 3 && (
          <div className="flex-1 overflow-y-auto p-12">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Периметр аудита</h2>
                  <span className={cn(
                    "text-xs px-3 py-1 rounded-full font-medium border",
                    data.format === 'express' ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                  )}>
                    {data.format === 'express' ? `Выбрано ${data.departments.length} из 1 (экспресс-формат)` : `Выбрано ${data.departments.length} подразделений`}
                  </span>
                </div>
                <p className="text-[var(--text-secondary)]">
                  {data.format === 'express'
                    ? 'В бесплатном формате обследуется ровно одно подразделение компании. Выберите ключевой отдел для диагностики.'
                    : 'Выберите подразделения, которые реально участвуют в процессах компании.'}
                </p>
              </div>

              {noticeMessage && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>{noticeMessage}</span>
                  </div>
                  <button onClick={() => setNoticeMessage(null)} className="p-1 hover:opacity-80">
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {DEPARTMENTS.map(dept => {
                  const isSelected = data.departments.some(d => d.id === dept.id);
                  const isBlockedByExpress = data.format === 'express' && !isSelected && data.departments.length >= 1;
                  const Icon = dept.icon;
                  return (
                    <button
                      key={dept.id}
                      onClick={() => toggleDept(dept.id)}
                      className={cn(
                        "flex flex-col justify-between p-5 rounded-2xl border text-left transition-all",
                        isSelected 
                          ? "border-accent bg-accent/5 shadow-lg ring-1 ring-accent" 
                          : isBlockedByExpress
                            ? "border-[var(--border)] bg-[var(--surface)] opacity-40 grayscale cursor-not-allowed"
                            : "border-[var(--border)] bg-[var(--surface)] opacity-70 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-[1.02]"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "p-2 rounded-xl shrink-0",
                          isSelected ? "bg-accent text-white" : "bg-[var(--background)] text-[var(--text-secondary)]"
                        )}>
                          <Icon size={24} />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <p className={cn("font-bold text-sm", isSelected ? "text-accent" : "")}>{dept.name}</p>
                          <p className="text-[10px] text-[var(--text-secondary)] leading-tight line-clamp-2">{dept.description}</p>
                        </div>
                      </div>

                      {isBlockedByExpress && (
                        <div className="mt-3 pt-2 border-t border-[var(--border)]/60 text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                          <AlertCircle size={12} className="shrink-0" />
                          <span>в бесплатном формате обследуется одно подразделение</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Data Collection */}
        {step === 4 && (
          <>
            {/* Sidebar with indicators */}
            <div className="w-[300px] border-r border-[var(--border)] bg-[var(--surface)] flex flex-col shrink-0 overflow-hidden">
               <div className="p-4 border-b border-[var(--border)]">
                 <h3 className="font-bold text-sm">Подразделения ({data.departments.length})</h3>
               </div>
               <div className="flex-1 overflow-y-auto p-2 space-y-1">
                 {data.departments.map(dept => {
                   const completion = calculateCompletion(dept);
                   return (
                     <button
                       key={dept.id}
                       onClick={() => setActiveDeptId(dept.id)}
                       className={cn(
                         "w-full flex items-center justify-between p-3 rounded-xl text-left transition-all group",
                         activeDeptId === dept.id ? "bg-accent/10 text-accent" : "hover:bg-[var(--background)]"
                       )}
                     >
                       <div className="flex items-center gap-3">
                         <div className={cn(
                           "w-2 h-2 rounded-full",
                           completion === 0 ? "bg-gray-400" : completion < 100 ? "bg-warning" : "bg-success"
                         )} />
                         <span className="text-xs font-medium truncate max-w-[140px]">{dept.name}</span>
                       </div>
                       <span className="text-[10px] font-bold opacity-60">{completion}%</span>
                     </button>
                   );
                 })}
               </div>
            </div>

            {/* Main Questionnaire */}
            <div className="flex-1 overflow-y-auto p-12 bg-[var(--background)]">
              {activeDept ? (
                <div className="max-w-[1600px] mx-auto space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{activeDept.name}</h2>
                      <div className="flex items-center gap-4 mt-1">
                        <StatusBadge label={`${activeDept.processes.length} процессов`} type="info" />
                        <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)]">
                          <div className={cn("w-2 h-2 rounded-full", calculateCompletion(activeDept) < 70 ? "bg-warning" : "bg-success")} />
                          <span className="text-[10px] font-bold">Готовность: {calculateCompletion(activeDept)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-xs px-3 py-1.5 rounded-xl font-medium border",
                        data.format === 'express' ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                      )}>
                        {data.format === 'express' ? 'Экспресс-оценка (до 3 процессов)' : 'Комплексный аудит (до 10 процессов)'}
                      </span>
                      <button className="btn-secondary text-xs flex items-center gap-2">
                         <LinkIcon size={14} />
                         Передать заполнение
                      </button>
                    </div>
                  </div>

                  {BLOCKS.map(block => (
                    <div key={block.id} className="card overflow-hidden border-[var(--border)]">
                      <button 
                        onClick={() => setExpandedBlocks(prev => ({ ...prev, [block.id]: !prev[block.id] }))}
                        className="w-full p-4 bg-[var(--surface)] flex items-center justify-between hover:bg-[var(--background)] transition-colors"
                      >
                         <div className="flex items-center gap-3">
                           <span className="w-6 h-6 bg-accent/10 text-accent rounded-full flex items-center justify-center text-[10px] font-bold">{block.icon}</span>
                           <h3 className="font-bold text-sm">{block.title}</h3>
                         </div>
                         <div className="flex items-center gap-4">
                           {expandedBlocks[block.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                         </div>
                      </button>
                      
                      {expandedBlocks[block.id] && (
                        <div className="p-6 space-y-6">
                          {block.level === 'ai_usage' ? (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {(data.format === 'express' ? AI_BLOCK_FREE_FIELDS : AI_BLOCK_PAID_FIELDS)
                                  .map(key => FIELD_REGISTRY.find(f => f.key === key))
                                  .filter((f): f is FieldDefinition => !!f)
                                  .map(field => (
                                    <DynamicField
                                      key={field.key}
                                      field={field}
                                      value={activeDept[field.key]}
                                      contextValue={activeDept.name}
                                      onChange={(val) => updateDept(activeDept.id, { [field.key]: val })}
                                    />
                                  ))}
                              </div>

                              {/* Блок результата уровня зрелости */}
                              {(() => {
                                const maturity = getAiMaturityDetails(activeDept, data.format);
                                const resultTitle = data.format === 'express' 
                                  ? 'Предварительный уровень' 
                                  : 'Уровень использования ИИ';

                                return (
                                  <div className="pt-6 border-t border-[var(--border)] space-y-4">
                                    <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                          <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                                            {resultTitle}
                                          </span>
                                          {maturity.isUndetermined ? (
                                            <p className="text-sm font-medium text-[var(--text-secondary)] mt-1.5">
                                              Уровень не определён, ответьте на оставшиеся вопросы блока
                                            </p>
                                          ) : (
                                            <div className="flex items-center gap-3 mt-1.5">
                                              <span className="text-2xl font-bold text-accent">
                                                {maturity.level}
                                              </span>
                                              <span className="text-base font-semibold">
                                                {maturity.name}
                                              </span>
                                            </div>
                                          )}
                                          {!maturity.isUndetermined && maturity.isPreliminary && (
                                            <p className="text-xs text-[var(--text-secondary)] mt-1">
                                              Предварительная оценка. Точный уровень определяется в комплексном аудите
                                            </p>
                                          )}
                                        </div>

                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          {MATURITY_LEVELS.map((lvl) => {
                                            const isCurrent = maturity.level === lvl.level;
                                            return (
                                              <div
                                                key={lvl.level}
                                                className={cn(
                                                  "px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 border",
                                                  isCurrent
                                                    ? "bg-accent text-white border-accent shadow-xs"
                                                    : "bg-[var(--background)] text-[var(--text-secondary)] border-[var(--border)] opacity-60"
                                                )}
                                                title={lvl.name}
                                              >
                                                <span className="font-bold">{lvl.level}</span>
                                                <span className="hidden md:inline text-[11px]">{lvl.name}</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      {maturity.hasWarning && (
                                        <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3">
                                          <AlertTriangle size={18} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                                          <div className="text-xs leading-relaxed font-medium">
                                            {maturity.warning}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          ) : block.level === 'department' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                              {FIELD_REGISTRY.filter(block.filter).map(field => (
                                checkVisibility(field, activeDept) && (
                                  <DynamicField
                                    key={field.key}
                                    field={field}
                                    value={activeDept[field.key]}
                                    contextValue={activeDept.name}
                                    onChange={(val) => updateDept(activeDept.id, { [field.key]: val })}
                                  />
                                )
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-[var(--text-secondary)]">
                                  {data.format === 'express' 
                                    ? `Отметьте до 3 ключевых процессов этого подразделения (${activeDept.processes.length} из 3):` 
                                    : `Отметьте типовые процессы этого подразделения для глубокого анализа (${activeDept.processes.length} из 10):`}
                                </p>
                              </div>

                              {processLimitMessage && (
                                <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
                                  <div className="flex items-center gap-2">
                                    <AlertCircle size={15} className="shrink-0 text-amber-600 dark:text-amber-400" />
                                    <span>{processLimitMessage}</span>
                                  </div>
                                  <button onClick={() => setProcessLimitMessage(null)} className="p-1 hover:opacity-80">
                                    <X size={14} />
                                  </button>
                                </div>
                              )}

                              <div className="grid grid-cols-1 gap-4">
                                {DEPARTMENTS.find(d => d.id === activeDept.id)?.typicalProcesses.map(pName => {
                                  const process = activeDept.processes.find(p => p.name === pName);
                                  const isSelected = !!process;
                                  const canAdd = data.format === 'express' ? activeDept.processes.length < 3 : activeDept.processes.length < 10;
                                  const isProcessBlocked = !isSelected && !canAdd;

                                  return (
                                    <div key={pName} className="space-y-3">
                                      <button
                                        onClick={() => isSelected ? removeProcess(activeDept.id, process?.id || '') : addProcess(activeDept.id, pName)}
                                        className={cn(
                                          "w-full flex items-center justify-between p-4 rounded-xl border text-sm transition-all",
                                          isSelected 
                                            ? "border-accent bg-accent/5 font-bold" 
                                            : isProcessBlocked
                                              ? "border-[var(--border)] opacity-50 bg-[var(--surface)]"
                                              : "border-[var(--border)] hover:bg-[var(--background)]"
                                        )}
                                      >
                                        <div className="flex items-center gap-3">
                                           <div className={cn("w-2 h-2 rounded-full", isSelected ? "bg-accent animate-pulse" : "bg-[var(--border)]")} />
                                           <span>{pName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {isProcessBlocked && (
                                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                                              {data.format === 'express' ? 'Лимит 3 процесса' : 'Лимит 10 процессов'}
                                            </span>
                                          )}
                                          {isSelected ? <CheckCircle2 size={18} className="text-accent" /> : <Plus size={18} className="opacity-40" />}
                                        </div>
                                      </button>
                                      
                                      {isSelected && (
                                        <div className="ml-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                          {/* Always Visible Group: in express format only 6 core questions, in comprehensive all always questions */}
                                          <div className="p-6 bg-[var(--background)] rounded-2xl border border-[var(--border)] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {FIELD_REGISTRY.filter(f => {
                                              if (!block.filter(f)) return false;
                                              if (data.format === 'express') {
                                                return ['pr_role', 'pr_people', 'pr_frequency', 'pr_minutes', 'pr_ops_month', 'pr_manual_share'].includes(f.key);
                                              }
                                              return f.group === 'always';
                                            }).map(field => (
                                              checkVisibility(field, process) && (
                                                <DynamicField
                                                  key={field.key}
                                                  field={field}
                                                  value={process[field.key]}
                                                  contextValue={activeDept.name}
                                                  onChange={(val) => updateProcess(activeDept.id, process.id, { [field.key]: val })}
                                                />
                                              )
                                            ))}
                                          </div>

                                          {data.format === 'express' && (
                                            <div className="text-[11px] text-[var(--text-secondary)] italic px-2">
                                              В бесплатном экспресс-формате доступны 6 базовых вопросов по процессу. Для расширенного проектирования 26 параметров, архитектуры и систем доступен комплексный аудит.
                                            </div>
                                          )}

                                          {/* Clarify & Details Sections only available in Comprehensive format */}
                                          {data.format === 'comprehensive' && (
                                            <>
                                              {/* Clarify Section (Expandable) */}
                                              <div className="border border-[var(--border)] rounded-2xl overflow-hidden">
                                                <button 
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    const key = `clarify-${process.id}`;
                                                    setExpandedBlocks(prev => ({ ...prev, [key]: !prev[key] }));
                                                  }}
                                                  className="w-full p-4 flex items-center justify-between bg-[var(--surface)] hover:bg-[var(--background)] transition-colors"
                                                >
                                                  <div className="flex items-center gap-2 text-xs font-bold text-accent">
                                                    <Info size={14} />
                                                    Уточнить параметры
                                                  </div>
                                                  {expandedBlocks[`clarify-${process.id}`] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </button>
                                                {expandedBlocks[`clarify-${process.id}`] && (
                                                  <div className="p-6 bg-[var(--background)] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 border-t border-[var(--border)]">
                                                    {FIELD_REGISTRY.filter(f => block.filter(f) && f.group === 'clarify').map(field => (
                                                      checkVisibility(field, process) && (
                                                        <DynamicField
                                                          key={field.key}
                                                          field={field}
                                                          value={process[field.key]}
                                                          onChange={(val) => updateProcess(activeDept.id, process.id, { [field.key]: val })}
                                                        />
                                                      )
                                                    ))}
                                                  </div>
                                                )}
                                              </div>

                                              {/* Details Section (Expandable) */}
                                              <div className="border border-[var(--border)] rounded-2xl overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                                                <button 
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    const key = `details-${process.id}`;
                                                    setExpandedBlocks(prev => ({ ...prev, [key]: !prev[key] }));
                                                  }}
                                                  className="w-full p-4 flex items-center justify-between bg-[var(--surface)] hover:bg-[var(--background)] transition-colors"
                                                >
                                                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                                                    <Zap size={14} />
                                                    Глубокие детали (для точного ROI)
                                                  </div>
                                                  {expandedBlocks[`details-${process.id}`] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </button>
                                                {expandedBlocks[`details-${process.id}`] && (
                                                  <div className="p-6 bg-[var(--background)] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 border-t border-[var(--border)]">
                                                    {FIELD_REGISTRY.filter(f => block.filter(f) && f.group === 'details').map(field => (
                                                      checkVisibility(field, process) && (
                                                        <DynamicField
                                                          key={field.key}
                                                          field={field}
                                                          value={process[field.key]}
                                                          onChange={(val) => updateProcess(activeDept.id, process.id, { [field.key]: val })}
                                                        />
                                                      )
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-sm mx-auto">
                   <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center">
                     <AlertCircle size={32} />
                   </div>
                   <div>
                     <h3 className="text-xl font-bold">Подразделение не выбрано</h3>
                     <p className="text-[var(--text-secondary)] text-sm leading-relaxed mt-2">
                       {data.departments.length > 0 
                        ? 'Выберите одно из добавленных подразделений в меню слева, чтобы начать детальный аудит процессов.'
                        : 'Вы еще не выбрали подразделения для аудита. Вернитесь на шаг «Периметр аудита» и отметьте нужные отделы.'}
                     </p>
                   </div>
                   {data.departments.length === 0 && (
                     <button 
                       onClick={() => setStep(3)}
                       className="btn-primary"
                     >
                       Вернуться к выбору
                     </button>
                   )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Step 5: Summary */}
        {step === 5 && (
          <div className="flex-1 overflow-y-auto p-12 bg-[var(--background)]">
            <div className="max-w-[1600px] mx-auto space-y-10">
              {/* Format Banner */}
              <div className={cn(
                "p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6",
                data.format === 'express' 
                  ? "bg-sky-500/10 border-sky-500/30 text-sky-950 dark:text-sky-100" 
                  : "bg-purple-500/10 border-purple-500/30 text-purple-950 dark:text-purple-100"
              )}>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider",
                      data.format === 'express' ? "bg-sky-500 text-white" : "bg-purple-600 text-white"
                    )}>
                      {data.format === 'express' ? 'Формат 1' : 'Формат 2'}
                    </span>
                    <h3 className="text-xl font-bold">
                      {data.format === 'express' ? 'Бесплатная экспресс-оценка AI-готовности' : 'Комплексный AI-аудит компании'}
                    </h3>
                  </div>
                  <p className="text-xs opacity-80">
                    {data.format === 'express'
                      ? 'Экспресс-диагностика одного ключевого подразделения (до 3 процессов) с формированием вилки эффекта и отчёта за 3 дня.'
                      : 'Глубокое обследование до 10 процессов сквозь 7 блоков данных с выпуском 12 проектных документов и ТЗ.'}
                  </p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold opacity-70">Стоимость</p>
                    <p className="text-xl font-bold">
                      {data.format === 'express' ? '0 ₽ (по сертификату)' : 'от 650 000 ₽'}
                    </p>
                  </div>
                  <div className="text-right border-l border-current/20 pl-6">
                    <p className="text-[10px] uppercase font-bold opacity-70">Срок</p>
                    <p className="text-xl font-bold">
                      {data.format === 'express' ? '3 раб. дня' : '4–8 недель'}
                    </p>
                  </div>
                </div>
              </div>

              {/* To-Do List Block */}
              {analysis.todoItems.length > 0 && (
                <div className="card border-warning/50 bg-warning/5 p-6 space-y-4">
                  <div className="flex items-center gap-3 text-warning">
                    <Clock size={20} />
                    <h3 className="font-bold">Что дозаполнить для точности (±15%)?</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {analysis.todoItems.slice(0, 6).map((item, idx) => (
                      <div key={idx} className="p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-accent tracking-wider">{item.deptName}</span>
                          <span className="text-[10px] bg-warning/20 text-warning px-2 py-0.5 rounded-full">{item.type === 'dept' ? 'Отдел' : 'Процесс'}</span>
                        </div>
                        <p className="text-xs font-bold truncate">{item.name}</p>
                        <ul className="space-y-1">
                          {item.missingFields.map((f, fidx) => (
                            <li key={fidx} className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1.5">
                              <div className="w-1 h-1 rounded-full bg-warning" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center space-y-4">
                 <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
                   <CheckCircle2 size={40} />
                 </div>
                 <h2 className="text-3xl font-bold">Данные готовы к анализу</h2>
                 <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
                   Мы проверили анкету. Ниже представлена сводка перед запуском глубокого AI-анализа.
                 </p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                  <div className="card p-6 space-y-4">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--text-secondary)]">Статус заполнения по отделам</h3>
                    <div className="divide-y divide-[var(--border)]">
                      {data.departments.map(dept => (
                        <div key={dept.id} className="py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-2 h-2 rounded-full", dept.completion < 30 ? "bg-error" : dept.completion < 70 ? "bg-warning" : "bg-success")} />
                            <span className="text-sm font-medium">{dept.name}</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-xs text-[var(--text-secondary)]">{dept.processes.length} процессов</span>
                            <span className="text-sm font-bold w-12 text-right">{dept.completion}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card p-6 bg-accent/5 border-accent/20">
                    <h3 className="font-bold text-sm mb-4">Предварительно обнаружено</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] text-accent uppercase font-bold">Всего процессов</p>
                        <p className="text-2xl font-bold">{data.departments.reduce((acc, d) => acc + d.processes.length, 0)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-accent uppercase font-bold">Суммарные трудозатраты</p>
                        <p className="text-2xl font-bold">
                          {Math.round(data.departments.reduce((acc, d) => acc + d.processes.reduce((pa, p) => pa + ((p.pr_ops_month || 0) * (p.pr_minutes || 0) / 60), 0), 0))} ч/мес
                        </p>
                        {data.profile.co_headcount_scope > 0 && (
                          <div className={cn(
                            "flex items-center gap-1.5 text-[9px] font-bold uppercase",
                            (data.departments.reduce((acc, d) => acc + d.processes.reduce((pa, p) => pa + ((p.pr_ops_month || 0) * (p.pr_minutes || 0) / 60), 0), 0) / (data.profile.co_headcount_scope * 160)) > 1 
                            ? "text-error" : "text-success"
                          )}>
                            { (data.departments.reduce((acc, d) => acc + d.processes.reduce((pa, p) => pa + ((p.pr_ops_month || 0) * (p.pr_minutes || 0) / 60), 0), 0) / (data.profile.co_headcount_scope * 160)) > 1 
                              ? "⚠️ Ошибка: Нагрузка превышает ФОТ" : "✓ Нагрузка в рамках ФОТ" 
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="card p-6 space-y-4">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--text-secondary)]">Точность анализа</h3>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <span className="text-sm">Полнота данных</span>
                         <span className="text-sm font-bold">{analysis.completeness}%</span>
                       </div>
                       <div className="h-2 bg-[var(--background)] rounded-full overflow-hidden">
                         <div 
                           className={cn("h-full transition-all duration-500", analysis.completeness > 70 ? "bg-success" : "bg-warning")}
                           style={{ width: `${analysis.completeness}%` }}
                         />
                       </div>
                       <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                         {analysis.mode === 'Full' 
                          ? 'Достаточно данных для точного расчета (±15%).' 
                          : 'Данных недостаточно для точного расчета. Будут использованы бенчмарки отрасли.'}
                       </p>
                    </div>
                  </div>

                  <div className="card p-6 space-y-4">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--text-secondary)]">Глубина анализа</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 border border-accent rounded-xl bg-accent/5 cursor-pointer">
                        <input type="radio" name="depth" defaultChecked className="text-accent" />
                        <div>
                          <p className="text-xs font-bold">Полный (AI + Расчёт)</p>
                          <p className="text-[10px] text-[var(--text-secondary)]">С интерпретацией выводов</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-xl opacity-50 cursor-not-allowed">
                        <input type="radio" name="depth" disabled className="text-accent" />
                        <div>
                          <p className="text-xs font-bold">Быстрый (Только числа)</p>
                          <p className="text-[10px] text-[var(--text-secondary)]">Только математическая модель</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <button 
                  onClick={startAnalysis}
                  className="btn-primary py-4 px-12 text-lg shadow-xl shadow-accent/20"
                >
                  Запустить анализ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar - hidden on Step 1 to avoid duplicate Next button */}
      {step > 1 && (
        <div className="h-16 border-t border-[var(--border)] bg-[var(--surface)] px-6 lg:px-12 flex items-center justify-between shrink-0 z-10 shadow-xs">
          <button 
            type="button"
            onClick={() => step > 1 ? setStep(step - 1) : onCancel()} 
            className="btn-secondary py-2 px-4 text-xs flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            <span>{step > 1 ? 'Назад' : 'Отменить аудит'}</span>
          </button>

          <div className="flex items-center gap-4">
            <button 
              type="button"
              disabled={step === 1 && !data.format}
              onClick={() => {
                if (step < STEPS.length) {
                  setStep(step + 1);
                } else {
                  startAnalysis();
                }
              }}
              className={cn(
                "btn-primary py-2.5 px-6 text-xs flex items-center gap-2 shadow-lg shadow-accent/20 transition-all",
                step === 1 && !data.format && "opacity-40 cursor-not-allowed pointer-events-none"
              )}
            >
              <span>{step === STEPS.length ? 'Запустить анализ' : 'Далее'}</span>
              {step === STEPS.length ? <Send size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* Analysis Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-[var(--background)]/80 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="max-w-md w-full p-10 bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
             <div className="text-center space-y-2">
               <h2 className="text-2xl font-bold">Глубокий анализ данных</h2>
               <p className="text-sm text-[var(--text-secondary)]">Применяем методику AI-аудита и правила подбора</p>
             </div>
             
             <div className="space-y-4">
               <div className="h-3 bg-[var(--background)] rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${analysisProgress}%` }}
                  />
               </div>
               <div className="flex justify-between text-[10px] font-bold text-accent uppercase tracking-widest">
                 <span>{ANALYSIS_STAGES[analysisStage]}</span>
                 <span>{analysisProgress}%</span>
               </div>
             </div>

             <div className="space-y-3">
               {ANALYSIS_STAGES.map((stage, idx) => (
                 <div key={idx} className={cn(
                   "flex items-center gap-3 text-sm transition-all duration-300",
                   idx < analysisStage ? "text-success" : idx === analysisStage ? "text-[var(--text-primary)] font-bold" : "text-[var(--text-secondary)] opacity-30"
                 )}>
                   {idx < analysisStage ? <CheckCircle2 size={16} /> : idx === analysisStage ? <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" /> : <div className="w-4 h-4 rounded-full border border-[var(--border)]" />}
                   {stage}
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
