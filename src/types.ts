export type Role = 'ADMIN' | 'ANALYST' | 'OBSERVER';

export type Theme = 'light' | 'dark';

export interface UserProfile {
  name: string;
  role: Role;
  avatar?: string;
}

export type View = 
  | 'dashboard'
  | 'new_audit'
  | 'audits'
  | 'clients'
  | 'documents'
  | 'reports'
  | 'finances'
  | 'methodology'
  | 'solutions_catalog'
  | 'matching_rules'
  | 'price_guide'
  | 'maturity_levels'
  | 'field_registry'
  | 'directories'
  | 'settings'
  | 'users'
  | 'activity_log';

export interface AppState {
  currentView: View;
  role: Role;
  theme: Theme;
}

export type Industry = 'Производство' | 'Строительство' | 'Логистика' | 'Ритейл' | 'HoReCa' | 'Эксплуатация' | 'Страхование' | 'HR' | 'IT' | 'Энергетика';
export type ClientStatus = 'новый' | 'диагностика' | 'предложение' | 'переговоры' | 'клиент' | 'отказ' | 'заморожен';
export type AuditFormat = 'express' | 'comprehensive';
export type AuditType = 
  | 'Бесплатная экспресс-оценка AI-готовности' 
  | 'Комплексный AI-аудит компании'
  | 'Аудит бизнес-идеи' 
  | 'AI-аудит компании' 
  | 'Экспресс-диагностика';
export type AuditStatus = 'черновик' | 'в работе' | 'завершён' | 'согласован' | 'оплачен';

export interface Client {
  id: string;
  name: string;
  inn: string;
  industry: Industry;
  size: string;
  revenue: number;
  region: string;
  website: string;
  contactName: string;
  contactRole: string;
  contactPhone: string;
  contactEmail: string;
  decisionMaker: string;
  leadSource: string;
  status: ClientStatus;
  manager: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface AuditCriterion {
  id: string;
  name: string;
  category: string;
  weight: number;
  score: number;
  rationale: string;
}

export interface CriterionScore {
  criterion: string;
  category: string;
  weight: number;
  score: number;
  rationale: string;
}

export interface EconomicsScenario {
  name: string;
  revenue: number;
  profit: number;
}

export interface Economics {
  avgCheck: number;
  clientsYearOne: number;
  unitCost: number;
  fixedCostsMonth: number;
  startupBudget: number;
  revenue: number;
  grossProfit: number;
  annualProfit: number;
  margin: number;
  breakEvenClients: number;
  paybackMonths: number;
  scenarios: EconomicsScenario[];
}

export interface ProcessAudit {
  id: string;
  name: string;
  isCustom?: boolean;
  executor?: { role: string; count: number };
  frequency?: string;
  timePerOperation?: number;
  operationsPerMonth?: number;
  manualWorkShare?: number;
  systems?: string[];
  inputDataFormat?: string[];
  isStandardized?: string;
  humanDecisionRequired?: string;
  errorFrequency?: string;
  errorCost?: number;
  typicalLosses?: string[];
  currentAiUsage?: string;
  isQuickFill?: boolean;
  dataPrivacyLevel?: 'высокий' | 'средний' | 'низкий';
  peakLoadMultiplier?: number;
  clientImpact?: number;
  complianceRisk?: 'да' | 'нет';
  automationPriority?: number;
  externalPartnersInvolved?: boolean;
  feedbackLoopExists?: boolean;
  documentationQuality?: number;
  // Dynamic fields from Registry
  [key: string]: any;
}

export interface InitiativeCriteriaScores {
  economicEffect: number;      // Экономический эффект (1-5, авто)
  speed: number;               // Скорость внедрения (1-5, авто)
  cost: number;                // Стоимость (1-5, авто)
  dataQuality: number;         // Качество данных (1-5, авто)
  scalability: number;         // Масштабируемость (1-5, авто)
  risks?: number;              // Риски (1-5, аудитор)
  staffImpact?: number;        // Влияние на сотрудников (1-5, аудитор)
  overallPriority?: number;    // Итоговый приоритет (среднее по заполненным)
}

export interface Initiative {
  id: string;
  solutionCode: string;
  name: string;
  type: string;
  departmentId: string;
  departmentName: string;
  processName: string;
  processes?: string[];
  whatItDoes: string;
  potentialHoursSaved: number;
  monthlySavings: number;
  effortWeeks: number;
  budgetRange: string;
  investment: number;
  roi: number;
  paybackMonths: number;
  quadrant: 'Quick Wins' | 'Strategic Bets' | 'Foundation' | 'Do Not Automate';
  rationale: string;
  risks: string[];
  kpi: string[];
  criteriaScores?: InitiativeCriteriaScores;
  trace: {
    matchedRules: string[];
    calculationFormula: string;
    dataSources: { label: string; value: string | number }[];
  };
}

export type AnalysisMode = 'Preliminary' | 'Estimated' | 'Full';

export interface AIUsage {
  level: number;
  tools: { name: string; type: 'personal' | 'corporate' | 'unknown' }[];
  tasks: string[];
  userBase: string;
  paymentModel: string;
  dataSecurityCase: string;
  rules: string;
  barriers: string[];
  staffSatisfaction: number;
  successCase: string;
  infrastructure?: {
    cloudVsOnPrem: string;
    hasGpus: boolean;
    dataStorage: string;
  };
  dataAssets?: {
    isStructured: string;
    volume: string;
    updateFrequency: string;
  };
  culture?: {
    aiChampionsCount: number;
    trainingLevel: string;
    resistanceLevel: number;
  };
}

export interface DepartmentAudit {
  id: string;
  name: string;
  isEnabled: boolean;
  isDelegated: boolean;
  completion: number;
  staffCount?: number;
  roles?: { role: string; count: number }[];
  hourlyRateOverride?: number;
  workMode?: string;
  seasonality?: string;
  peakMonths?: string[];
  turnoverRate?: number;
  openVacancies?: number;
  processes: ProcessAudit[];
  aiUsage?: AIUsage;
  systems?: string[];
  otherSystems?: string;
  hasApi?: 'yes' | 'no' | 'unknown';
  docStorage?: string[];
  hasKnowledgeBase?: boolean;
  dataQuality?: number;
  timeTracking?: 'detailed' | 'partial' | 'none';
  managerSupport?: number;
  staffReadiness?: number;
  changeOwner?: { exists: boolean; role?: string };
  automationAttitude?: string;
  staffFreeTime?: string;
  pains?: { id: string; intensity: number }[];
  mainIrritant?: string;
  ethics?: {
    biasRisk: string;
    transparencyRequired: string;
  };
  roiTargets?: {
    primaryGoal: string;
    maxPaybackMonths: number;
  };
  // Dynamic fields from Registry
  [key: string]: any;
}

export interface CompanyAuditData {
  format?: AuditFormat;
  auditType?: AuditType;
  certificateCode?: string;
  profile: {
    clientId: string;
    industry?: string;
    totalStaff?: number;
    auditStaff?: number;
    annualRevenue?: number;
    legalEntitiesCount?: number;
    branchesCount?: number;
    geography?: string;
    avgHourlyRate?: number;
    initiator?: string;
    triggers?: string[];
    automationExperience?: string;
    constraints?: string[];
    aiBudgetRange?: string;
    // Dynamic fields from Registry
    [key: string]: any;
  };
  departments: DepartmentAudit[];
}

export type StageStatus = 'не начат' | 'в работе' | 'завершён';

export interface ProcessOptimizationPlan {
  processId: string;
  processName: string;
  exclude: string;            // что исключить
  standardize: string;        // что стандартизировать
  automateTraditional: string;// что автоматизировать обычными средствами
  needAi: string;             // где нужен ИИ
}

export interface StageProgress {
  id: number;
  status: StageStatus;
  checklist: Record<string, boolean>;
  updatedAt?: string;
}

export interface AuditStagesData {
  stages: Record<number, StageProgress>;
  optimizationPlans?: Record<string, {
    exclude: string;
    standardize: string;
    automateTraditional: string;
    needAi: string;
  }>;
}

export interface Audit {
  id: string;
  number: string;
  clientId: string;
  projectName: string;
  type: AuditType;
  auditFormat?: AuditFormat;
  status: AuditStatus;
  totalScore: number;
  verdict: string;
  scores: CriterionScore[];
  economics: Economics;
  summary: string;
  strengths: string[];
  gaps: { gap: string; impact: string; fix: string; priority: string }[];
  risks: { risk: string; probability: string; impact: string; mitigation: string }[];
  amount: number;
  analyst: string;
  createdAt: string;
  updatedAt: string;
  methodologyVersion: string;
  isDemo?: boolean;
  companyData?: CompanyAuditData;
  analysisMode?: AnalysisMode;
  completeness?: number;
  confidenceInterval?: number;
  interviewDate?: string;
  wizardStep?: number;
  solutions?: string[];
  stagesData?: AuditStagesData;
}

export interface DocRecord {
  id: string;
  fileName: string;
  docType: string;
  size: number;
  clientId: string | null;
  auditId: string | null;
  uploadedAt: string;
  status: 'загружен' | 'обрабатывается' | 'проанализирован' | 'ошибка';
  summary: string;
  keyNumbers: { label: string; value: string }[];
  gaps: string[];
  redFlags: string[];
  isDemo?: boolean;
}

export interface FinanceRecord {
  id: string;
  date: string;
  clientId: string;
  auditId: string | null;
  service: string;
  amount: number;
  type: 'разово' | 'ежемесячно' | 'процент';
  payStatus: 'выставлен' | 'оплачен' | 'просрочен' | 'отменён';
  paidAt: string | null;
  isDemo?: boolean;
}
