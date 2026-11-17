import { Initiative, CompanyAuditData } from '../types';

export interface SevenCriteriaItem {
  id: string;
  name: string;
  score: number | null; // 1 to 5, or null if not evaluated
  source: 'автоматически' | 'от аудитора';
  explanation: string;
  isAuditorManual: boolean;
}

export interface InitiativeEvaluation {
  criteria: SevenCriteriaItem[];
  overallPriority: number;
  isComplete: boolean; // true if both auditor manual scores are provided
  auditorScoresCount: number; // 0, 1, or 2
}

/**
 * Calculates 1-5 score for Economic Effect based on monthly savings.
 * Scaling:
 * <= 30k: 1
 * 30k - 75k: 2
 * 75k - 150k: 3
 * 150k - 300k: 4
 * > 300k: 5
 * If allInitiatives is passed, relative ranking is also considered.
 */
export function calculateEconomicEffectScore(savings: number, allInitiatives?: Initiative[]): number {
  if (allInitiatives && allInitiatives.length > 1) {
    const sorted = [...allInitiatives].map(i => i.monthlySavings).sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    if (max > min) {
      const ratio = (savings - min) / (max - min);
      return Math.min(5, Math.max(1, 1 + Math.round(ratio * 4)));
    }
  }

  if (savings <= 30000) return 1;
  if (savings <= 75000) return 2;
  if (savings <= 150000) return 3;
  if (savings <= 300000) return 4;
  return 5;
}

/**
 * Calculates 1-5 score for Speed of Implementation (pilot duration in weeks).
 * Shorter duration = higher score:
 * <= 4 weeks (1 mo): 5
 * 5-6 weeks (1.5 mo): 4
 * 7-8 weeks (2 mo): 3
 * 9-12 weeks (3 mo): 2
 * > 12 weeks: 1
 */
export function calculateSpeedScore(effortWeeks: number): number {
  if (effortWeeks <= 4) return 5;
  if (effortWeeks <= 6) return 4;
  if (effortWeeks <= 8) return 3;
  if (effortWeeks <= 12) return 2;
  return 1;
}

/**
 * Calculates 1-5 score for Cost (budget/investment).
 * Cheaper = higher score:
 * <= 250k: 5
 * 251k - 500k: 4
 * 501k - 900k: 3
 * 901k - 1.5M: 2
 * > 1.5M: 1
 */
export function calculateCostScore(investment: number): number {
  if (investment <= 250000) return 5;
  if (investment <= 500000) return 4;
  if (investment <= 900000) return 3;
  if (investment <= 1500000) return 2;
  return 1;
}

/**
 * Calculates 1-5 score for Data Quality based on questionnaire completeness (0..100%).
 * <= 25%: 1
 * 26% - 45%: 2
 * 46% - 65%: 3
 * 66% - 85%: 4
 * > 85%: 5
 */
export function calculateDataQualityScore(completeness: number): number {
  if (completeness <= 25) return 1;
  if (completeness <= 45) return 2;
  if (completeness <= 65) return 3;
  if (completeness <= 85) return 4;
  return 5;
}

/**
 * Calculates 1-5 score for Scalability based on number of processes covered.
 * 1 process: 1
 * 2 processes: 2
 * 3 processes: 3
 * 4 processes: 4
 * >= 5 processes: 5
 */
export function calculateScalabilityScore(processCount: number): number {
  if (processCount <= 1) return 1;
  if (processCount === 2) return 2;
  if (processCount === 3) return 3;
  if (processCount === 4) return 4;
  return 5;
}

/**
 * Evaluates all 7 criteria for an initiative.
 */
export function evaluateInitiativeSevenCriteria(
  initiative: Initiative,
  completeness: number,
  allInitiatives?: Initiative[],
  manualAuditorScores?: { risks?: number; staffImpact?: number }
): InitiativeEvaluation {
  const procCount = initiative.processes && initiative.processes.length > 0 
    ? initiative.processes.length 
    : 1;

  const economicScore = calculateEconomicEffectScore(initiative.monthlySavings, allInitiatives);
  const speedScore = calculateSpeedScore(initiative.effortWeeks || 4);
  const costScore = calculateCostScore(initiative.investment);
  const dataQualityScore = calculateDataQualityScore(completeness);
  const scalabilityScore = calculateScalabilityScore(procCount);

  const risksScore = manualAuditorScores?.risks ?? initiative.criteriaScores?.risks ?? null;
  const staffImpactScore = manualAuditorScores?.staffImpact ?? initiative.criteriaScores?.staffImpact ?? null;

  const criteria: SevenCriteriaItem[] = [
    {
      id: 'economicEffect',
      name: 'Экономический эффект',
      score: economicScore,
      source: 'автоматически',
      explanation: `По рассчитанной экономии: ${initiative.monthlySavings.toLocaleString('ru-RU')} ₽/мес`,
      isAuditorManual: false
    },
    {
      id: 'speed',
      name: 'Скорость внедрения',
      score: speedScore,
      source: 'автоматически',
      explanation: `По сроку пилота: ${initiative.effortWeeks} нед. (чем короче, тем выше балл)`,
      isAuditorManual: false
    },
    {
      id: 'cost',
      name: 'Стоимость',
      score: costScore,
      source: 'автоматически',
      explanation: `По бюджету внедрения: ${initiative.investment.toLocaleString('ru-RU')} ₽ (чем дешевле, тем выше балл)`,
      isAuditorManual: false
    },
    {
      id: 'dataQuality',
      name: 'Качество данных',
      score: dataQualityScore,
      source: 'автоматически',
      explanation: `По полноте заполнения анкеты подразделения: ${Math.round(completeness)}%`,
      isAuditorManual: false
    },
    {
      id: 'risks',
      name: 'Риски',
      score: risksScore,
      source: 'от аудитора',
      explanation: 'Технические, организационные, правовые риски внедрения (1 — высокие риски, 5 — минимальные риски)',
      isAuditorManual: true
    },
    {
      id: 'scalability',
      name: 'Масштабируемость',
      score: scalabilityScore,
      source: 'автоматически',
      explanation: `По числу процессов, которые закрывает решение: ${procCount}`,
      isAuditorManual: false
    },
    {
      id: 'staffImpact',
      name: 'Влияние на сотрудников',
      score: staffImpactScore,
      source: 'от аудитора',
      explanation: 'Усиление, изменение или замена операций специалистов (1 — сильное сопротивление / сложность, 5 — максимальное усиление)',
      isAuditorManual: true
    }
  ];

  // Calculate overall priority as average of all filled scores
  const filledScores = criteria
    .map(c => c.score)
    .filter((s): s is number => s !== null && s !== undefined && s > 0);

  const avg = filledScores.length > 0
    ? filledScores.reduce((acc, s) => acc + s, 0) / filledScores.length
    : 0;

  const isComplete = risksScore !== null && staffImpactScore !== null;
  const auditorScoresCount = (risksScore !== null ? 1 : 0) + (staffImpactScore !== null ? 1 : 0);

  return {
    criteria,
    overallPriority: Math.round(avg * 10) / 10,
    isComplete,
    auditorScoresCount
  };
}
