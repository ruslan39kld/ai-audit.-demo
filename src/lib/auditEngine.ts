import { CompanyAuditData, DepartmentAudit, ProcessAudit, Audit, Initiative, AnalysisMode } from '../types';
import { AI_SOLUTIONS, AISolution, getSolutionBasePrice, PRICING_CATALOG } from '../auditMetadata';
import { FIELD_REGISTRY, FieldDefinition } from './fieldRegistry';
import { RULES_REGISTRY, Rule, RuleCondition } from './rulesRegistry';

export interface AnalysisResult {
  mode: AnalysisMode;
  completeness: number;
  initiatives: Initiative[];
  confidenceInterval: number;
  todoItems: { deptId: string; deptName: string; type: 'dept' | 'process'; name: string; missingFields: string[] }[];
}

function evaluateCondition(condition: RuleCondition, data: any): boolean {
  const value = data[condition.key];
  
  switch (condition.op) {
    case '==': return value === condition.value;
    case '!=': return value !== condition.value;
    case 'contains': {
      if (Array.isArray(value)) {
        if (Array.isArray(condition.value)) {
          return condition.value.some(v => value.includes(v));
        }
        return value.includes(condition.value);
      }
      if (typeof value === 'string') {
        if (Array.isArray(condition.value)) {
          return condition.value.some(v => value.toLowerCase().includes(v.toLowerCase()));
        }
        return value.toLowerCase().includes(condition.value.toLowerCase());
      }
      return false;
    }
    case 'not_contains': {
      if (Array.isArray(value)) return !value.includes(condition.value);
      if (typeof value === 'string') return !value.toLowerCase().includes(condition.value.toLowerCase());
      return false;
    }
    case 'in': {
      if (Array.isArray(condition.value)) {
        return condition.value.includes(value);
      }
      return false;
    }
    case '>': return Number(value) > Number(condition.value);
    case '<': return Number(value) < Number(condition.value);
    case 'len_gt': return Array.isArray(value) && value.length > Number(condition.value);
    default: return false;
  }
}

function evaluateRule(rule: Rule, context: any): boolean {
  if (rule.enabled === false) return false;
  if (rule.logic === 'AND') {
    return rule.conditions.every(c => evaluateCondition(c, context));
  } else {
    return rule.conditions.some(c => evaluateCondition(c, context));
  }
}

function checkFieldVisibility(field: FieldDefinition, context: any): boolean {
  if (!field.showIf) return true;
  return evaluateCondition(field.showIf, context);
}

export function runAuditAnalysis(data: CompanyAuditData): AnalysisResult {
  const initiatives: Initiative[] = [];
  const todoItems: AnalysisResult['todoItems'] = [];
  const { avgHourlyRate } = data.profile;

  // Pre-calculate some values for rules
  const companyContext = { 
    ...data.profile,
    co_hourly_rate: data.profile.co_hourly_rate || avgHourlyRate
  };

  // 1. Calculate overall completeness based on VISIBLE registry fields
  const companyFields = FIELD_REGISTRY.filter(f => f.level === 'company' && f.block !== 'Системное');
  const visibleCompanyFields = companyFields.filter(f => checkFieldVisibility(f, data.profile));
  const filledCompanyFields = visibleCompanyFields.filter(f => data.profile[f.key] !== undefined && data.profile[f.key] !== '').length;
  const companyCompleteness = visibleCompanyFields.length > 0 ? (filledCompanyFields / visibleCompanyFields.length) * 100 : 100;

  if (companyCompleteness < 100) {
    const missing = visibleCompanyFields.filter(f => data.profile[f.key] === undefined || data.profile[f.key] === '').map(f => f.label);
    if (missing.length > 0) {
      todoItems.push({ deptId: 'company', deptName: 'Компания', type: 'dept', name: 'Профиль компании', missingFields: missing });
    }
  }

  let totalDeptCompleteness = 0;
  data.departments.forEach(dept => {
    const deptFields = FIELD_REGISTRY.filter(f => f.level === 'department' && f.block !== 'Системное');
    const visibleDeptFields = deptFields.filter(f => checkFieldVisibility(f, dept));
    const filledDeptFields = visibleDeptFields.filter(f => dept[f.key] !== undefined && dept[f.key] !== '').length;
    const deptComp = visibleDeptFields.length > 0 ? (filledDeptFields / visibleDeptFields.length) * 100 : 100;
    
    if (deptComp < 80) {
       const missing = visibleDeptFields.filter(f => dept[f.key] === undefined || dept[f.key] === '').slice(0, 5).map(f => f.label);
       todoItems.push({ deptId: dept.id, deptName: dept.name, type: 'dept', name: dept.name, missingFields: missing });
    }

    let totalPrComp = 0;
    dept.processes.forEach(pr => {
      const prFields = FIELD_REGISTRY.filter(f => f.level === 'process' && f.block !== 'Системное');
      const visiblePrFields = prFields.filter(f => checkFieldVisibility(f, pr));
      const filledPrFields = visiblePrFields.filter(f => pr[f.key] !== undefined && pr[f.key] !== '').length;
      const prComp = visiblePrFields.length > 0 ? (filledPrFields / visiblePrFields.length) * 100 : 100;
      totalPrComp += prComp;

      if (prComp < 80) {
        const missing = visiblePrFields.filter(f => pr[f.key] === undefined || pr[f.key] === '').slice(0, 3).map(f => f.label);
        todoItems.push({ deptId: dept.id, deptName: dept.name, type: 'process', name: pr.name, missingFields: missing });
      }
    });

    const avgPrComp = dept.processes.length > 0 ? totalPrComp / dept.processes.length : 100;
    totalDeptCompleteness += (deptComp * 0.4 + avgPrComp * 0.6);
  });
  
  const avgDeptCompletion = data.departments.length > 0 ? totalDeptCompleteness / data.departments.length : 0;
  const completeness = (avgDeptCompletion * 0.7) + (companyCompleteness * 0.3);

  let mode: AnalysisMode = 'Preliminary';
  let confidenceInterval = 0.4;

  if (completeness > 70) {
    mode = 'Full';
    confidenceInterval = 0.15;
  } else if (completeness > 30) {
    mode = 'Estimated';
    confidenceInterval = 0.3;
  }

  // Risk and modification context
  const modifiers = {
    budgetMultiplier: 1,
    organisationalRisk: false,
    securityRisk: false,
    dataQualityLow: false,
    additionalTags: [] as string[]
  };

  if (data.profile.co_constraints?.includes('запрет на зарубежные сервисы')) {
    modifiers.budgetMultiplier = 1.4;
    modifiers.additionalTags.push('требуется российская модель или локальное развёртывание');
  }

  // Apply Company-level rules (like S01)
  RULES_REGISTRY.filter(r => r.solution === 'S01').forEach(rule => {
    const matchesShadow = data.departments.some(d => evaluateRule(rule, d));
    if (matchesShadow) {
      const solution = AI_SOLUTIONS.find(s => s.code === 'S01')!;
      initiatives.push(createInitiative(solution, 'company', 'Вся компания', 'Теневое ИИ / Инфраструктура', 0, avgHourlyRate, modifiers, ['R16']));
    }
  });

  // Apply Process-specific rules and group by solution within each department
  data.departments.forEach(dept => {
    const deptModifiers = { ...modifiers };
    if (dept.ready_manager <= 2) deptModifiers.organisationalRisk = true;
    if (dept.sys_data_quality <= 2) deptModifiers.dataQualityLow = true;

    if (['да регулярно', 'да единично'].includes(dept.ai_data_leak) && dept.ai_level?.includes('личные аккаунты')) {
       deptModifiers.securityRisk = true;
    }

    const currentHourlyRate = dept.dp_hourly_rate || avgHourlyRate;

    const deptSolutions = new Map<string, {
      solution: AISolution;
      deptModifiers: typeof modifiers;
      processes: Map<string, ProcessItem>;
    }>();

    dept.processes.forEach(process => {
      const context = {
        ...companyContext,
        ...dept,
        ...process,
        dept_name: dept.name,
        pr_name: process.name,
        pr_systems_len: process.pr_systems?.length || 0
      };

      const matchedSolutions = new Set<string>();

      RULES_REGISTRY.forEach(rule => {
        if (evaluateRule(rule, context)) {
          matchedSolutions.add(rule.solution);
          if (rule.id === 'R20') {
            matchedSolutions.add(dept.sys_has_api === 'да' ? 'S09' : 'S10');
          }
        }
      });

      // Benchmark fallback if low completeness
      if (completeness < 30 && matchedSolutions.size === 0) {
        // Find typical for industry
        if (data.profile.co_industry === 'Ритейл' || data.profile.co_industry === 'ИТ') {
          matchedSolutions.add('S02'); // Support
          matchedSolutions.add('S11'); // Search
        }
      }

      matchedSolutions.forEach(solutionCode => {
        const solution = AI_SOLUTIONS.find(s => s.code === solutionCode);
        if (!solution) return;

        // Estimate if data missing
        let hoursMonth = (process.pr_ops_month * process.pr_minutes) / 60;
        if (isNaN(hoursMonth) || hoursMonth === 0) {
           const people = process.pr_people || 1;
           hoursMonth = people * 160 * 0.4; // 40% of time on typical process
        }

        const manualShare = process.pr_manual_share !== undefined ? process.pr_manual_share : 70;
        const autoHours = hoursMonth * (manualShare / 100) * solution.efficiencyCoeff;
        const savings = autoHours * currentHourlyRate;

        if (!deptSolutions.has(solutionCode)) {
          deptSolutions.set(solutionCode, {
            solution,
            deptModifiers,
            processes: new Map()
          });
        }

        const group = deptSolutions.get(solutionCode)!;
        const existing = group.processes.get(process.name);
        if (!existing || existing.savings < savings) {
          group.processes.set(process.name, {
            processName: process.name,
            hoursMonth,
            manualShare,
            autoHours,
            savings,
            rules: [solutionCode]
          });
        }
      });
    });

    // Create grouped initiatives for this department
    deptSolutions.forEach(group => {
      const processList = Array.from(group.processes.values());
      if (processList.length > 0) {
        initiatives.push(createGroupedInitiative(
          group.solution,
          dept.id,
          dept.name,
          processList,
          group.deptModifiers
        ));
      }
    });
  });

  return {
    mode,
    completeness: Math.round(completeness),
    confidenceInterval,
    initiatives: initiatives.sort((a, b) => b.monthlySavings - a.monthlySavings),
    todoItems
  };
}

interface ProcessItem {
  processName: string;
  hoursMonth: number;
  manualShare: number;
  autoHours: number;
  savings: number;
  rules: string[];
}

function createGroupedInitiative(
  solution: AISolution,
  deptId: string,
  deptName: string,
  processes: ProcessItem[],
  modifiers: any
): Initiative {
  const processCount = processes.length;
  const additionalProcesses = Math.max(0, processCount - 1);

  // 1. Экономия суммируется по всем процессам, которые закрывает решение
  const totalAutoHours = Math.round(processes.reduce((sum, p) => sum + p.autoHours, 0));
  const totalMonthlySavings = Math.round(processes.reduce((sum, p) => sum + p.savings, 0));

  // 2. Бюджет берётся один раз по роли ИИ, не умножается на число процессов
  // 3. К бюджету добавляется 15% за каждый дополнительный процесс сверх первого, но не более 50% сверх базового
  const baseBudget = getSolutionBasePrice(solution) * (modifiers.budgetMultiplier || 1);
  const surchargeCoeff = Math.min(0.50, additionalProcesses * 0.15);
  const totalInvestment = Math.round(baseBudget * (1 + surchargeCoeff));

  // 4. Срок внедрения берётся максимальный из процессов, плюс одна неделя за каждый дополнительный процесс
  const totalEffortWeeks = solution.durationWeeks + additionalProcesses * 1;

  // Payback & ROI
  const annualSavings = totalMonthlySavings * 12;
  const roi = totalInvestment > 0 
    ? Math.round(((annualSavings - totalInvestment) / totalInvestment) * 100)
    : (annualSavings > 0 ? 1000 : 0);
  const paybackMonths = totalMonthlySavings > 0 
    ? Math.round((totalInvestment / totalMonthlySavings) * 10) / 10 
    : 99;

  const risks = [...(solution.complexity > 3 ? ['Высокая техническая сложность'] : [])];
  if (modifiers.organisationalRisk) risks.push('Организационный риск: низкая готовность руководства');
  if (modifiers.securityRisk) risks.push('КРИТИЧЕСКИЙ РИСК: Зафиксирована утечка данных через теневое ИИ');
  
  const tags = [...modifiers.additionalTags];
  if (modifiers.dataQualityLow) tags.push('Требуется этап Foundation: очистка данных');

  let quadrant: Initiative['quadrant'] = 'Foundation';
  if (modifiers.dataQualityLow && (solution.type.includes('Агент') || solution.type.includes('Аналитика'))) {
    quadrant = 'Foundation';
  } else if (totalMonthlySavings > 100000 && solution.complexity <= 2) {
    quadrant = 'Quick Wins';
  } else if (totalMonthlySavings > 100000 && solution.complexity > 2) {
    quadrant = 'Strategic Bets';
  } else if (totalMonthlySavings <= 100000 && solution.complexity > 3) {
    quadrant = 'Do Not Automate';
  }

  const allRules = Array.from(new Set(processes.flatMap(p => p.rules)));
  const processNames = processes.map(p => p.processName);

  return {
    id: `init-${solution.code}-${deptId}-${Math.random().toString(36).substr(2, 5)}`,
    solutionCode: solution.code,
    name: solution.name,
    type: solution.type,
    departmentId: deptId,
    departmentName: deptName,
    processName: processNames.join(', '),
    processes: processNames,
    whatItDoes: solution.description,
    potentialHoursSaved: totalAutoHours,
    monthlySavings: totalMonthlySavings,
    effortWeeks: totalEffortWeeks,
    budgetRange: solution.budgetRange,
    investment: totalInvestment,
    roi,
    paybackMonths,
    quadrant,
    rationale: tags.length > 0 ? `${tags.join('. ')}. ${solution.description}` : solution.description,
    risks,
    kpi: ['Время обработки', 'Доля ошибок', 'Снижение рутинной нагрузки'],
    trace: {
      matchedRules: allRules,
      calculationFormula: processCount > 1 
        ? `Суммарная экономия по ${processCount} процессам: ${totalMonthlySavings.toLocaleString('ru-RU')} ₽/мес (${totalAutoHours} ч/мес). Бюджет: базовый ${Math.round(baseBudget).toLocaleString('ru-RU')} ₽ (роль «${solution.aiRole}») + надбавка ${Math.round(surchargeCoeff * 100)}% за ${additionalProcesses} доп. проц. = ${totalInvestment.toLocaleString('ru-RU')} ₽`
        : `Экономия: ${totalMonthlySavings.toLocaleString('ru-RU')} ₽/мес (${totalAutoHours} ч/мес). Инвестиции: ${totalInvestment.toLocaleString('ru-RU')} ₽ (роль «${solution.aiRole}»)`,
      dataSources: [
        { label: 'Закрываемые процессы', value: processNames.join('; ') },
        { label: 'Количество процессов', value: processCount },
        { label: 'Роль ИИ', value: solution.aiRole },
        { label: 'Базовый бюджет решения', value: `${Math.round(baseBudget).toLocaleString('ru-RU')} ₽` },
        { label: 'Надбавка за масштаб процессов', value: `+${Math.round(surchargeCoeff * 100)}%` },
        { label: 'Срок внедрения', value: `${totalEffortWeeks} нед. (базовый ${solution.durationWeeks} + ${additionalProcesses} нед.)` }
      ]
    }
  };
}

function createInitiative(
  solution: AISolution, 
  deptId: string, 
  deptName: string, 
  processName: string, 
  hoursMonth: number, 
  hourlyRate: number,
  modifiers: any,
  rules: string[],
  manualShare: number = 100
): Initiative {
  const autoHours = hoursMonth * (manualShare / 100) * solution.efficiencyCoeff;
  const savings = autoHours * hourlyRate;
  const investment = getSolutionBasePrice(solution) * (modifiers.budgetMultiplier || 1);
  
  const annualSavings = savings * 12;
  const roi = investment > 0 ? ((annualSavings - investment) / investment) * 100 : (annualSavings > 0 ? 1000 : 0);
  const payback = savings > 0 ? investment / savings : (investment > 0 ? 99 : 0);

  const risks = [...(solution.complexity > 3 ? ['Высокая техническая сложность'] : [])];
  if (modifiers.organisationalRisk) risks.push('Организационный риск: низкая готовность руководства');
  if (modifiers.securityRisk) risks.push('КРИТИЧЕСКИЙ РИСК: Зафиксирована утечка данных через теневое ИИ');
  
  const tags = [...modifiers.additionalTags];
  if (modifiers.dataQualityLow) tags.push('Требуется этап Foundation: очистка данных');

  let quadrant: Initiative['quadrant'] = 'Foundation';
  if (modifiers.dataQualityLow && (solution.type.includes('Агент') || solution.type.includes('Аналитика'))) {
    quadrant = 'Foundation';
  } else if (savings > 100000 && solution.complexity <= 2) {
    quadrant = 'Quick Wins';
  } else if (savings > 100000 && solution.complexity > 2) {
    quadrant = 'Strategic Bets';
  } else if (savings <= 100000 && solution.complexity > 3) {
    quadrant = 'Do Not Automate';
  }

  return {
    id: `init-${solution.code}-${Math.random().toString(36).substr(2, 5)}`,
    solutionCode: solution.code,
    name: solution.name,
    type: solution.type,
    departmentId: deptId,
    departmentName: deptName,
    processName: processName,
    whatItDoes: solution.description,
    potentialHoursSaved: Math.round(autoHours),
    monthlySavings: Math.round(savings),
    effortWeeks: solution.durationWeeks,
    budgetRange: solution.budgetRange,
    investment: Math.round(investment),
    roi: Math.round(roi),
    paybackMonths: Math.round(payback * 10) / 10,
    quadrant,
    rationale: tags.length > 0 ? `${tags.join('. ')}. ${solution.description}` : solution.description,
    risks,
    kpi: ['Время обработки', 'Доля ошибок'],
    trace: {
      matchedRules: rules,
      calculationFormula: `Часы (${Math.round(hoursMonth)}) * Ручной труд (${manualShare}%) * Эффективность (${solution.efficiencyCoeff}) * Ставка (${hourlyRate}₽) * Множитель (${modifiers.budgetMultiplier})`,
      dataSources: [
        { label: 'Процесс', value: processName },
        { label: 'Тип решения', value: solution.type },
        { label: 'Роль ИИ', value: solution.aiRole },
        { label: 'Базовая цена внедрения', value: `${Math.round(investment).toLocaleString('ru-RU')} ₽` }
      ]
    }
  };
}

export function createAuditFromCompanyData(data: CompanyAuditData, analysis: AnalysisResult): Audit {
  const totalMonthlySavings = analysis.initiatives.reduce((acc, ini) => acc + ini.monthlySavings, 0);
  const totalInvestment = analysis.initiatives.reduce((acc, ini) => acc + ini.investment, 0);
  const avgPayback = analysis.initiatives.length > 0 ? totalInvestment / (totalMonthlySavings || 1) : 0;
  const isExpress = data.format === 'express';

  return {
    id: Math.random().toString(36).substr(2, 9),
    number: `A-${Math.floor(1000 + Math.random() * 9000)}`,
    clientId: data.profile.clientId,
    projectName: isExpress ? `Экспресс-оценка: ${data.profile.industry || 'Компания'}` : `Комплексный аудит: ${data.profile.industry || 'Компания'}`,
    type: isExpress ? 'Бесплатная экспресс-оценка AI-готовности' : 'Комплексный AI-аудит компании',
    auditFormat: isExpress ? 'express' : 'comprehensive',
    status: 'завершён',
    totalScore: Math.round(analysis.completeness * 0.8),
    verdict: analysis.mode === 'Preliminary' ? 'Требуется дозаполнение' : 'Высокий potential',
    scores: [],
    economics: {
      avgCheck: 0,
      clientsYearOne: 0,
      unitCost: 0,
      fixedCostsMonth: 0,
      startupBudget: totalInvestment,
      revenue: totalMonthlySavings * 12,
      grossProfit: totalMonthlySavings * 12,
      annualProfit: totalMonthlySavings * 12,
      margin: 85,
      breakEvenClients: 0,
      paybackMonths: Math.round(avgPayback),
      scenarios: []
    },
    summary: `Анализ выявил ${analysis.initiatives.length} инициатив с потенциалом экономии ${Math.round(totalMonthlySavings)} ₽ в месяц.`,
    strengths: ['Высокая готовность руководства', 'Наличие структурированных данных'],
    gaps: [],
    risks: [],
    amount: isExpress ? PRICING_CATALOG.expressAudit.basePrice : PRICING_CATALOG.comprehensiveAudit.basePrice,
    analyst: 'AI System',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    methodologyVersion: '2.0',
    companyData: data,
    analysisMode: analysis.mode,
    completeness: analysis.completeness,
    confidenceInterval: analysis.confidenceInterval
  };
}

function parseBudget(range: string): number {
  const match = range.match(/(\d+)\D+(\d+)/);
  if (match) {
    const min = parseInt(match[1]) * (range.includes('млн') ? 1000000 : 1000);
    const max = parseInt(match[2]) * (range.includes('млн') ? 1000000 : 1000);
    return (min + max) / 2;
  }
  return 500000;
}
