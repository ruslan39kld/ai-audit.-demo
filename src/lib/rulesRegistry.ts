export interface RuleCondition {
  key: string;
  op: '==' | '!=' | 'contains' | 'in' | '>' | '<' | 'len_gt' | 'not_contains';
  value: any;
}

export interface Rule {
  id: string;
  name?: string;
  description?: string;
  conditions: RuleCondition[];
  logic: 'AND' | 'OR';
  solution: string;
  priority?: number;
  enabled?: boolean;
}

export const RULES_REGISTRY: Rule[] = [
  {
    id: 'R01',
    name: 'Интеллектуальное распознавание документов',
    description: 'Для процессов с бумажными или сканированными входящими данными и высокой долей ручного ввода рекомендуется внедрение систем OCR (Optical Character Recognition) на базе нейросетей.',
    conditions: [
      { key: 'pr_input_format', op: 'in', value: ['скан или фото', 'бумага'] },
      { key: 'pr_manual_share', op: '>', value: 50 }
    ],
    logic: 'AND',
    solution: 'S06'
  },
  {
    id: 'R02',
    name: 'Умная база знаний (RAG)',
    description: 'Если сотрудники тратят время на поиск информации или повторяют одни и те же вопросы экспертам, рекомендуется внедрение RAG-системы (Retrieval-Augmented Generation) поверх корпоративных документов.',
    conditions: [
      { key: 'pr_losses', op: 'contains', value: 'loss_search' },
      { key: 'pr_losses', op: 'contains', value: 'loss_repeat_questions' },
      { key: 'sys_knowledge_base', op: '==', value: 'есть в электронном виде' }
    ],
    logic: 'OR',
    solution: 'S02'
  },
  {
    id: 'R03',
    name: 'Внутренний сервисный чат-бот',
    description: 'Для HR, ИТ и Финансовых департаментов с высокой частотой типовых вопросов целесообразно внедрение бота в мессенджере для разгрузки первой линии поддержки.',
    conditions: [
      { key: 'pr_losses', op: 'contains', value: 'loss_repeat_questions' },
      { key: 'dept_name', op: 'in', value: ['HR', 'ИТ', 'Финансы'] }
    ],
    logic: 'AND',
    solution: 'S03'
  },
  {
    id: 'R04',
    name: 'AI-квалификация лидов и заявок',
    description: 'При большом потоке входящих обращений нейросеть может автоматически классифицировать тип запроса, определять его важность и маршрутизировать на нужного специалиста.',
    conditions: [
      { key: 'name', op: 'contains', value: ['обращен', 'заявк', 'запрос'] },
      { key: 'pr_frequency', op: '==', value: 'несколько раз в день' }
    ],
    logic: 'AND',
    solution: 'S04'
  },
  {
    id: 'R05',
    name: 'Голосовой AI-ассистент в телефонии',
    description: 'При большом объеме звонков (более 500 в месяц) внедрение голосового бота позволяет автоматизировать типовые консультации и первичный сбор информации.',
    conditions: [
      { key: 'name', op: 'contains', value: ['звонок', 'обзвон', 'телефон'] },
      { key: 'pr_ops_month', op: '>', value: 500 }
    ],
    logic: 'AND',
    solution: 'S05'
  },
  {
    id: 'R06',
    name: 'Автоматизация управленческой отчетности',
    description: 'Если отчеты собираются вручную, ИИ может помочь с агрегацией данных из разных систем и написанием текстовых выводов по отклонениям.',
    conditions: [
      { key: 'pr_losses', op: 'contains', value: 'loss_manual_reports' }
    ],
    logic: 'AND',
    solution: 'S07'
  },
  {
    id: 'R07',
    name: 'Сквозная автоматизация через API',
    description: 'При наличии регламентов и API у систем рекомендуется использование AI-агентов для бесшовной передачи данных между подразделениями.',
    conditions: [
      { key: 'pr_standardization', op: '==', value: 'полностью с регламентом' },
      { key: 'pr_human_decision', op: '==', value: 'нет механическая' },
      { key: 'sys_has_api', op: '==', value: 'да' },
      { key: 'pr_systems', op: 'len_gt', value: 1 }
    ],
    logic: 'AND',
    solution: 'S09'
  },
  {
    id: 'R08',
    name: 'Роботизация интерфейсов (RPA + AI)',
    description: 'Если процесс регламентирован, но у систем нет API, рекомендуется использование программных роботов (RPA) с элементами компьютерного зрения.',
    conditions: [
      { key: 'pr_standardization', op: '==', value: 'полностью с регламентом' },
      { key: 'sys_has_api', op: '==', value: 'нет' }
    ],
    logic: 'AND',
    solution: 'S10',
    priority: 1
  },
  {
    id: 'R09',
    name: 'Оцифровка Excel-процессов',
    description: 'При высоком объеме операций в Excel рекомендуется перенос процесса в специализированную систему с AI-валидацией данных.',
    conditions: [
      { key: 'pr_systems', op: 'contains', value: ['Excel', 'системы нет'] },
      { key: 'pr_ops_month', op: '>', value: 200 }
    ],
    logic: 'AND',
    solution: 'S10'
  },
  {
    id: 'R10',
    name: 'AI-копирайтинг и контент-план',
    description: 'Для творческих процессов с высокой долей ручного труда ИИ может выступать как ассистент для генерации черновиков и идей.',
    conditions: [
      { key: 'pr_human_decision', op: '==', value: 'постоянно' },
      { key: 'pr_manual_share', op: '>', value: 40 }
    ],
    logic: 'AND',
    solution: 'S08'
  },
  {
    id: 'R11',
    name: 'Интеллектуальный поиск в архивах',
    description: 'При хранении документов на локальных серверах и частых потерях информации внедрение семантического поиска ускоряет работу в разы.',
    conditions: [
      { key: 'sys_docs_storage', op: 'contains', value: ['файловый сервер', 'локальные компьютеры'] },
      { key: 'pr_losses', op: 'contains', value: 'loss_search' }
    ],
    logic: 'AND',
    solution: 'S11'
  },
  {
    id: 'R12',
    name: 'Автоматизированный скрининг резюме',
    description: 'Для HR-подбора при большом потоке кандидатов нейросеть может проводить первичный отбор по ключевым навыкам и опыту.',
    conditions: [
      { key: 'dept_name', op: '==', value: 'HR подбор' },
      { key: 'pr_ops_month', op: '>', value: 200 }
    ],
    logic: 'AND',
    solution: 'S12'
  },
  {
    id: 'R13',
    name: 'Компьютерное зрение для контроля',
    description: 'В процессах визуального контроля и проверки качества рекомендуется использование видеоаналитики на базе нейросетей.',
    conditions: [
      { key: 'name', op: 'contains', value: ['контрол', 'осмотр', 'проверк', 'визуальн'] }
    ],
    logic: 'AND',
    solution: 'S13'
  },
  {
    id: 'R14',
    name: 'Прогнозное планирование спроса',
    description: 'Если ведется детальный учет объемов, ИИ может строить точные прогнозы на основе исторических данных для оптимизации закупок.',
    conditions: [
      { key: 'sys_volume_tracking', op: '==', value: 'детально' },
      { key: 'name', op: 'contains', value: ['планирован', 'прогноз', 'остатк'] }
    ],
    logic: 'AND',
    solution: 'S14'
  },
  {
    id: 'R15',
    name: 'Автоматическое протоколирование встреч',
    description: 'Для процессов с большим количеством совещаний использование AI-транскрибатора позволяет мгновенно получать протоколы и список задач.',
    conditions: [
      { key: 'name', op: 'contains', value: ['совещан', 'протокол'] }
    ],
    logic: 'AND',
    solution: 'S15'
  },
  {
    id: 'R16',
    name: 'Корпоративный шлюз доступа к LLM',
    description: 'При выявленном теневом использовании ИИ сотрудниками критически важно внедрить защищенный корпоративный контур для безопасности данных.',
    conditions: [
      { key: 'ai_level', op: 'in', value: ['личные аккаунты, компания не знает', 'личные аккаунты, руководитель в курсе'] }
    ],
    logic: 'AND',
    solution: 'S01'
  },
  {
    id: 'R17',
    name: 'Оптимизация коммуникаций',
    description: 'Высокая нагрузка совещаниями требует внедрения инструментов суммаризации для тех, кто не присутствовал лично.',
    conditions: [
      { key: 'comm_minutes', op: 'in', value: ['иногда', 'нет'] },
      { key: 'comm_meetings_week', op: '>', value: 3 }
    ],
    logic: 'AND',
    solution: 'S15'
  },
  {
    id: 'R18',
    name: 'AI-сбор данных из разрозненных систем',
    description: 'При необходимости ручного сбора данных из более чем двух систем ИИ может выступать как агрегатор для формирования единой картины.',
    conditions: [
      { key: 'rep_manual_collection', op: '==', value: 'полностью вручную' },
      { key: 'rep_systems_count', op: '>', value: 2 }
    ],
    logic: 'AND',
    solution: 'S07'
  },
  {
    id: 'R19',
    name: 'База знаний для ключевых экспертов',
    description: 'Если в отделе есть ключевой носитель знаний, чья загрузка мешает работе других, необходимо перенести его опыт в RAG-систему.',
    conditions: [
      { key: 'know_questions_day', op: '>', value: 5 },
      { key: 'know_key_person', op: '==', value: 'да' }
    ],
    logic: 'AND',
    solution: 'S02'
  },
  {
    id: 'R20',
    name: 'Устранение двойного ввода данных',
    description: 'При наличии процессов с двойным вводом данных рекомендуется внедрение автоматических интеграций с AI-проверкой целостности.',
    conditions: [
      { key: 'cross_double_entry', op: '==', value: 'да' }
    ],
    logic: 'AND',
    solution: 'S09'
  },
  // --- New Rules R21-R38 (Prompt 18) ---
  {
    id: 'R21',
    name: 'Риск утечки через теневой ИИ (B2)',
    description: 'Сотрудники используют личные аккаунты для работы. Требуется внедрение защищенного корпоративного контура.',
    solution: 'S01',
    logic: 'AND',
    conditions: [{ key: 'dept_shadow_ai', op: 'contains', value: 'личные аккаунты' }]
  },
  {
    id: 'R22',
    name: 'Непрозрачность объемов работ (B2)',
    description: 'Учет объемов ведется вручную или отсутствует. AI-аналитика поможет автоматизировать сбор метрик.',
    solution: 'S07',
    logic: 'AND',
    conditions: [{ key: 'dept_volume_tracking', op: '!=', value: 'детально в системе' }]
  },
  {
    id: 'R23',
    name: 'Критическая зависимость от эксперта (B2)',
    description: 'В отделе есть незаменимый носитель знаний. Необходима база знаний на основе RAG для сохранения экспертизы.',
    solution: 'S02',
    logic: 'AND',
    conditions: [{ key: 'dept_key_expert', op: '==', value: 'да' }]
  },
  {
    id: 'R24',
    name: 'Потеря договоренностей на встречах (B2)',
    description: 'Итоги совещаний фиксируются вручную или никак. Автоматическая транскрибация решит проблему.',
    solution: 'S03',
    logic: 'AND',
    conditions: [{ key: 'dept_meeting_culture', op: 'contains', value: ['никак', 'вручную'] }]
  },
  {
    id: 'R25',
    name: 'Низкий уровень цифровой зрелости (B2)',
    description: 'Команде сложно внедрять сложные инструменты. Рекомендуется программа базового обучения AI-навыкам.',
    solution: 'S10',
    logic: 'AND',
    conditions: [{ key: 'dept_digital_maturity', op: '==', value: 'низкий (бумага/Excel)' }]
  },
  {
    id: 'R26',
    name: 'Высокая нагрузка на онбординг (HR)',
    description: 'Высокая текучесть требует постоянного обучения новичков. ИИ-наставник ускорит процесс.',
    solution: 'S02',
    logic: 'AND',
    conditions: [{ key: 'dp_turnover', op: '>', value: 20 }]
  },
  {
    id: 'R27',
    name: 'Кадровый голод в отделе (Recruitment)',
    description: 'Вакансии открыты долго. ИИ-рекрутинг поможет ускорить воронку найма.',
    solution: 'S09',
    logic: 'AND',
    conditions: [{ key: 'dp_vacancy_months', op: '>', value: 2 }]
  },
  {
    id: 'R28',
    name: 'Бумажный хаос (OCR)',
    description: 'Большой объем бумажных документов. Требуется потоковое распознавание (OCR).',
    solution: 'S06',
    logic: 'AND',
    conditions: [{ key: 'sys_docs_storage', op: 'contains', value: 'бумажный архив' }]
  },
  {
    id: 'R29',
    name: 'Сложная кросс-системная отчетность (Analytics)',
    description: 'Отчеты собираются из множества систем вручную. AI SQL-агент автоматизирует сбор данных.',
    solution: 'S08',
    logic: 'AND',
    conditions: [{ key: 'rep_systems_count', op: '>', value: 2 }]
  },
  {
    id: 'R30',
    name: 'Потребность в круглосуточной поддержке',
    description: 'Сменный или круглосуточный график. ИИ-чатбот снимет нагрузку в нерабочее время.',
    solution: 'S04',
    logic: 'AND',
    conditions: [{ key: 'dp_schedule', op: 'contains', value: ['сменный', 'круглосуточный'] }]
  },
  {
    id: 'R31',
    name: 'Высокий риск человеческого фактора (Quality)',
    description: 'Регулярные ошибки в процессах. ИИ-валидатор данных на входе снизит брак.',
    solution: 'S14',
    logic: 'AND',
    conditions: [{ key: 'pr_error_rate', op: 'contains', value: ['регулярно', 'постоянно'] }]
  },
  {
    id: 'R32',
    name: 'Хаос в задачах (Comm)',
    description: 'Задачи ставятся в чатах и забываются. ИИ-ассистент в Telegram/Slack поможет с трекингом.',
    solution: 'S15',
    logic: 'AND',
    conditions: [{ key: 'comm_tasks_where', op: '==', value: 'мессенджер' }]
  },
  {
    id: 'R33',
    name: 'Проблема закрытых систем (RPA)',
    description: 'Нет API для интеграции. Требуется AI-driven RPA для эмуляции действий пользователя.',
    solution: 'S16',
    logic: 'AND',
    conditions: [{ key: 'sys_has_api', op: '==', value: 'нет' }]
  },
  {
    id: 'R34',
    name: 'Непредсказуемая пиковая нагрузка (Forecasting)',
    description: 'Выраженная сезонность. Модели прогнозирования спроса помогут с планированием ресурсов.',
    solution: 'S13',
    logic: 'AND',
    conditions: [{ key: 'dp_seasonality', op: '==', value: 'выраженная' }]
  },
  {
    id: 'R35',
    name: 'Информационная перегрузка экспертов (KM)',
    description: 'Много однотипных вопросов коллегам. База знаний с ИИ-поиском снимет нагрузку.',
    solution: 'S02',
    logic: 'AND',
    conditions: [{ key: 'know_questions_day', op: '>', value: 5 }]
  },
  {
    id: 'R36',
    name: 'Риск нарушения комтайны (Local LLM)',
    description: 'Работа с чувствительными данными. Требуется локальная LLM без выхода в интернет.',
    solution: 'S11',
    logic: 'AND',
    conditions: [{ key: 'lim_trade_secret', op: '==', value: 'да' }]
  },
  {
    id: 'R37',
    name: 'Высокая цена ошибки (Quality)',
    description: 'Ошибки стоят дорого. Необходима система ИИ-контроля качества 100% транзакций.',
    solution: 'S14',
    logic: 'AND',
    conditions: [{ key: 'pr_error_cost', op: '>', value: 10000 }]
  },
  {
    id: 'R38',
    name: 'Огромный поток документов (DocAI)',
    description: 'Более 500 документов в месяц. Требуется интеллектуальная классификация и извлечение данных.',
    solution: 'S06',
    logic: 'AND',
    conditions: [{ key: 'pr_docs_month', op: '>', value: 500 }]
  }
];

// Загрузка сохраненных настроек правил из хранилища браузера при инициализации
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('aiaudit:rules');
    if (saved) {
      const parsed: Rule[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        parsed.forEach(savedRule => {
          const idx = RULES_REGISTRY.findIndex(r => r.id === savedRule.id);
          if (idx !== -1) {
            RULES_REGISTRY[idx] = { ...RULES_REGISTRY[idx], ...savedRule };
          }
        });
      }
    }
  }
} catch (e) {
  console.error('Error loading RULES_REGISTRY from storage', e);
}

/**
 * Сохраняет изменения правила в единый реестр RULES_REGISTRY и в localStorage.
 * Изменения сразу вступают в силу во всей системе и движке сопоставления.
 */
export function saveRule(rule: Rule): void {
  const idx = RULES_REGISTRY.findIndex(r => r.id === rule.id);
  if (idx !== -1) {
    RULES_REGISTRY[idx] = { ...RULES_REGISTRY[idx], ...rule };
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('aiaudit:rules', JSON.stringify(RULES_REGISTRY));
      try {
        const evt = typeof CustomEvent === 'function' 
          ? new CustomEvent('aiaudit:rules_updated', { detail: rule })
          : new Event('aiaudit:rules_updated');
        window.dispatchEvent(evt);
      } catch (evtErr) {
        // Fallback for environments where CustomEvent constructor is restricted
      }
    }
  } catch (e) {
    console.error('Error saving RULES_REGISTRY to storage', e);
  }
}

