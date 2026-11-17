/**
 * Расчёт уровня использования ИИ в подразделении (зрелость 0-5).
 * Детерминированная логика без обращения к внешним сервисам и модели.
 */

import { MATURITY_LEVELS } from '../auditMetadata';

export interface AiMaturityResult {
  level: number | null;
  isPreliminary: boolean;
  isUndetermined: boolean;
  aiLevelValue: string | undefined;
}

export interface AiMaturityLevelInfo {
  level: number | null;
  name: string;
  isPreliminary: boolean;
  isUndetermined: boolean;
  aiLevelValue?: string;
  warning?: string;
  hasWarning: boolean;
}

export const AI_LEVEL_REGISTRY_VALUES: Record<number, string> = {
  0: 'не используется',
  1: 'личные аккаунты, компания не знает',
  2: 'корпоративный доступ без регламентов',
  3: 'корпоративный доступ с регламентами',
  4: 'встроен в процессы',
  5: 'встроен в процессы'
};

export const AI_BLOCK_FREE_FIELDS = [
  'ai_used_now',
  'ai_personal_accounts',
  'ai_policy',
  'ai_corporate_access'
];

export const AI_BLOCK_PAID_FIELDS = [
  'ai_used_now',
  'ai_personal_accounts',
  'ai_tools_list',
  'ai_tasks',
  'ai_policy',
  'ai_corporate_access',
  'ai_integration',
  'ai_data_leak_risk'
];

/**
 * Расчёт уровня использования ИИ (0–5).
 * При совпадении нескольких условий берётся наибольший подходящий уровень,
 * кроме уровня 1: если ai_personal_accounts = «да» и ai_corporate_access = «нет», уровень всегда 1.
 * Если ни одно условие не сработало, level = null и isUndetermined = true.
 * Ноль остаётся только для явного случая: ai_used_now = «не используются» И ai_personal_accounts = «нет».
 * Признак isPreliminary = true устанавливается только когда формат бесплатный.
 * Вычисленный уровень записывается в data.ai_level в формате, ожидаемом правилом R16.
 */
export function calculateAiMaturityLevel(data: Record<string, any>, format?: string): AiMaturityResult {
  const isPreliminary = format === 'express';

  let level: number | null = null;
  let isUndetermined = false;

  // Уровень 1 (Теневой): если ai_personal_accounts = «да» и ai_corporate_access = «нет», уровень всегда 1
  if (data.ai_personal_accounts === 'да' && data.ai_corporate_access === 'нет') {
    level = 1;
  } else {
    const matches: number[] = [];

    // 0 Нулевой: ai_used_now = «не используются» И ai_personal_accounts = «нет»
    if (data.ai_used_now === 'не используются' && data.ai_personal_accounts === 'нет') {
      matches.push(0);
    }

    // 2 Стихийный: ai_corporate_access = «у отдельных сотрудников» И ai_policy = «правил нет» или «устные договорённости»
    if (
      data.ai_corporate_access === 'у отдельных сотрудников' &&
      (data.ai_policy === 'правил нет' || data.ai_policy === 'устные договорённости')
    ) {
      matches.push(2);
    }

    // Наличие письменного регламента
    const hasWrittenPolicy =
      data.ai_policy === 'письменный регламент' ||
      data.ai_policy === 'регламент и контроль исполнения';

    // 3 Управляемый доступ: ai_corporate_access = «у подразделения» или «у всей компании» И письменного регламента нет
    if (
      (data.ai_corporate_access === 'у подразделения' || data.ai_corporate_access === 'у всей компании') &&
      !hasWrittenPolicy
    ) {
      matches.push(3);
    }

    // 4 Регламентированный: ai_policy = «письменный регламент» или «регламент и контроль исполнения» И ai_integration = «нет» или «пробный запуск» И ai_corporate_access = «у подразделения» или «у всей компании»
    if (
      hasWrittenPolicy &&
      (data.ai_integration === 'нет' || data.ai_integration === 'пробный запуск') &&
      (data.ai_corporate_access === 'у подразделения' || data.ai_corporate_access === 'у всей компании')
    ) {
      matches.push(4);
    }

    // 5 Встроенный: ai_integration = «в одном процессе» или «в нескольких процессах» И ai_policy = «письменный регламент» или «регламент и контроль исполнения»
    if (
      (data.ai_integration === 'в одном процессе' || data.ai_integration === 'в нескольких процессах') &&
      hasWrittenPolicy
    ) {
      matches.push(5);
    }

    if (matches.length > 0) {
      level = Math.max(...matches);
      if (isPreliminary && level > 3) {
        level = 3;
      }
    } else if (data.ai_corporate_access === 'у отдельных сотрудников') {
      level = 2;
    } else {
      level = null;
      isUndetermined = true;
    }
  }

  const aiLevelValue = level !== null ? AI_LEVEL_REGISTRY_VALUES[level] : undefined;

  return { level, isPreliminary, isUndetermined, aiLevelValue };
}

/**
 * Получение развёрнутых сведений об уровне зрелости и предупреждениях о данных.
 */
export function getAiMaturityDetails(data: Record<string, any>, format?: string): AiMaturityLevelInfo {
  const { level, isPreliminary, isUndetermined, aiLevelValue } = calculateAiMaturityLevel(data, format);
  const matchedLevel = level !== null ? MATURITY_LEVELS.find(m => m.level === level) : undefined;
  const name = matchedLevel ? matchedLevel.name : (level !== null ? 'Нулевой' : 'Не определён');
  let warning: string | undefined;
  if (level === 1 || data.ai_personal_accounts === 'да') {
    warning = 'Сотрудники работают через личные аккаунты. Рабочие данные уходят во внешние сервисы без контроля компании';
  } else if (data.ai_data_leak_risk === 'да') {
    warning = 'Во внешние сервисы выносятся данные, которые выносить нельзя';
  }
  const hasWarning = !!warning;

  return {
    level,
    name,
    isPreliminary,
    isUndetermined,
    aiLevelValue,
    warning,
    hasWarning
  };
}
