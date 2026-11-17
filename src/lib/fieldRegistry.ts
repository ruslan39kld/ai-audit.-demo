export type FieldType = 'text' | 'number' | 'select' | 'multi' | 'scale' | 'textarea' | 'slider' | 'table';

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDefinition {
  key: string;
  label: string;
  hint?: string;
  type: FieldType;
  options?: string[] | FieldOption[];
  level: 'company' | 'department' | 'process';
  block?: string;
  required?: boolean;
  usedInRules?: boolean;
  usedInCalc?: boolean;
  showIf?: {
    key: string;
    op: '==' | '!=' | 'contains' | '>' | '<';
    value: any;
  };
  tableColumns?: { key: string; label: string; type: FieldType }[];
  group?: 'always' | 'clarify' | 'details';
  labelOverrides?: Record<string, string>; // Prompt 18
}

export const FIELD_REGISTRY: FieldDefinition[] = [
  // --- COMPANY LEVEL (co_) ---
  { key: 'co_name', label: 'Компания', type: 'text', level: 'company', required: true },
  { key: 'co_inn', label: 'ИНН', type: 'text', level: 'company' },
  { 
    key: 'co_industry', 
    label: 'Отрасль', 
    type: 'select', 
    level: 'company', 
    options: ['Производство', 'Строительство', 'Логистика', 'Ритейл', 'HoReCa', 'Эксплуатация', 'Страхование', 'HR', 'ИТ', 'Энергетика', 'Медицина', 'Образование', 'Сельское хозяйство', 'Недвижимость'] 
  },
  { key: 'co_headcount_total', label: 'Численность всего', type: 'number', level: 'company' },
  { key: 'co_headcount_scope', label: 'Численность в периметре', type: 'number', level: 'company' },
  { key: 'co_revenue', label: 'Годовая выручка, ₽', type: 'number', level: 'company' },
  { key: 'co_legal_entities', label: 'Число юрлиц', type: 'number', level: 'company' },
  { key: 'co_branches', label: 'Число филиалов', type: 'number', level: 'company' },
  { 
    key: 'co_geography', 
    label: 'География', 
    type: 'select', 
    level: 'company', 
    options: ['Один город', 'Регион', 'Несколько регионов', 'Вся страна'] 
  },
  { key: 'co_hourly_rate', label: 'Стоимость часа сотрудника, ₽', type: 'number', level: 'company', required: true, usedInCalc: true },
  { 
    key: 'co_initiator', 
    label: 'Инициатор аудита', 
    type: 'select', 
    level: 'company', 
    options: ['Собственник', 'CEO', 'COO', 'CFO', 'CIO', 'HRD', 'Руководитель направления'] 
  },
  { 
    key: 'co_triggers', 
    label: 'Триггеры', 
    type: 'multi', 
    level: 'company', 
    options: ['Рост ФОТ', 'Дефицит персонала', 'Ошибки и переделки', 'Срыв сроков', 'Рост объёма без роста штата', 'Разрозненные подписки', 'Требование головной компании', 'Конкурентное давление'] 
  },
  { 
    key: 'co_automation_history', 
    label: 'Опыт автоматизации', 
    type: 'select', 
    level: 'company', 
    options: ['Не было', 'Внедряли и получилось', 'Внедряли и не прижилось', 'Внедряем сейчас'] 
  },
  { 
    key: 'co_constraints', 
    label: 'Ограничения', 
    type: 'multi', 
    level: 'company', 
    options: ['Персональные данные', 'Коммерческая тайна', 'Гостайна', 'Отраслевое регулирование', 'Запрет на облака', 'Запрет на зарубежные сервисы', 'Требования ИБ', 'Требования головной компании'],
    usedInRules: true
  },
  { 
    key: 'co_ai_budget', 
    label: 'Годовой бюджет на AI', 
    type: 'select', 
    level: 'company', 
    options: ['Не определён', 'До 500 тыс', '500 тыс – 2 млн', '2–5 млн', 'Свыше 5 млн'] 
  },

  // Block B2: Контекст отдела (Prompt 18)
  {
    key: 'dept_volume_tracking',
    label: 'Как ведется учет объемов работ?',
    type: 'select',
    options: ['нет учета', 'в Excel вручную', 'детально в системе'],
    level: 'department',
    block: 'B2',
    group: 'always',
    labelOverrides: {
      'HR': 'Как ведется учет вакансий и кандидатов?',
      'ИТ': 'Как ведется учет тикетов и задач?',
      'Производство': 'Как фиксируется выработка продукции?'
    }
  },
  {
    key: 'dept_shadow_ai',
    label: 'Используют ли сотрудники ИИ (теневой ИИ)?',
    type: 'select',
    options: ['нет', 'личные аккаунты скрыто', 'личные аккаунты открыто', 'корпоративный доступ'],
    level: 'department',
    block: 'B2',
    group: 'always'
  },
  {
    key: 'dept_key_expert',
    label: 'Есть ли уникальный носитель знаний (незаменимый)?',
    type: 'select',
    options: ['да', 'нет'],
    level: 'department',
    block: 'B2',
    group: 'clarify'
  },
  {
    key: 'dept_meeting_culture',
    label: 'Как фиксируются итоги совещаний?',
    type: 'select',
    options: ['никак', 'вручную в протокол', 'в таск-трекере', 'аудиозапись'],
    level: 'department',
    block: 'B2',
    group: 'clarify'
  },
  {
    key: 'dept_digital_maturity',
    label: 'Уровень цифровой грамотности команды',
    type: 'select',
    options: ['низкий (бумага/Excel)', 'средний (уверенные пользователи ПО)', 'высокий (автоматизаторы/ИТ)'],
    level: 'department',
    block: 'B2',
    group: 'details'
  },

  // --- DEPARTMENT LEVEL (dp_) ---
  // Блок А. Состав и нагрузка
  { key: 'dp_headcount', label: 'Численность подразделения', type: 'number', level: 'department', block: 'Состав и нагрузка' },
  { 
    key: 'dp_roles', 
    label: 'Роли', 
    type: 'table', 
    level: 'department', 
    block: 'Состав и нагрузка',
    tableColumns: [
      { key: 'role', label: 'Роль', type: 'text' },
      { key: 'count', label: 'Количество', type: 'number' }
    ]
  },
  { key: 'dp_hourly_rate', label: 'Стоимость часа (переопределение), ₽', type: 'number', level: 'department', block: 'Состав и нагрузка', hint: 'Оставьте пустым, чтобы использовать общекорпоративную ставку' },
  { 
    key: 'dp_schedule', 
    label: 'График работы', 
    type: 'select', 
    level: 'department', 
    block: 'Состав и нагрузка', 
    options: ['5/2', 'сменный', 'вахтовый', 'круглосуточный'] 
  },
  { 
    key: 'dp_seasonality', 
    label: 'Сезонность', 
    type: 'select', 
    level: 'department', 
    block: 'Состав и нагрузка', 
    options: ['нет', 'выраженная'] 
  },
  { 
    key: 'dp_peak_months', 
    label: 'Пиковые месяцы', 
    type: 'multi', 
    level: 'department', 
    block: 'Состав и нагрузка', 
    options: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    showIf: { key: 'dp_seasonality', op: '==', value: 'выраженная' }
  },
  { key: 'dp_turnover', label: 'Текучесть персонала, %', type: 'number', level: 'department', block: 'Состав и нагрузка' },
  { key: 'dp_open_vacancies', label: 'Открытые вакансии', type: 'number', level: 'department', block: 'Состав и нагрузка' },
  { 
    key: 'dp_vacancy_months', 
    label: 'Как долго открыты вакансии (мес)', 
    type: 'number', 
    level: 'department', 
    block: 'Состав и нагрузка',
    showIf: { key: 'dp_open_vacancies', op: '>', value: 0 }
  },
  { 
    key: 'dp_vacancy_impact', 
    label: 'Влияние вакансий на процессы', 
    type: 'text', 
    level: 'department', 
    block: 'Состав и нагрузка',
    showIf: { key: 'dp_open_vacancies', op: '>', value: 0 }
  },

  // Блок В. Использование ИИ (блок «Как ИИ уже используется»)
  {
    key: 'ai_used_now',
    label: 'Используются ли ИИ-сервисы в подразделении сегодня',
    type: 'select',
    level: 'department',
    block: 'Как ИИ уже используется',
    options: [
      'не используются',
      'отдельные сотрудники сами',
      'есть доступ, оплаченный компанией',
      'встроено в рабочие процессы'
    ]
  },
  {
    key: 'ai_personal_accounts',
    label: 'Работают ли сотрудники через личные аккаунты',
    type: 'select',
    level: 'department',
    block: 'Как ИИ уже используется',
    options: ['да', 'нет', 'не знаю']
  },
  {
    key: 'ai_tools_list',
    label: 'Какие сервисы используются',
    type: 'multi',
    level: 'department',
    block: 'Как ИИ уже используется',
    options: [
      'чат-боты общего назначения',
      'переводчики',
      'генерация текстов',
      'распознавание документов',
      'аналитика',
      'свои разработки',
      'не используются'
    ]
  },
  { 
    key: 'ai_tasks', 
    label: 'Для каких задач применяют', 
    type: 'multi', 
    level: 'department', 
    block: 'Как ИИ уже используется',
    options: [
      'письма и переписка',
      'документы и тексты',
      'поиск информации',
      'расчёты и таблицы',
      'программный код',
      'встречи и протоколы',
      'не применяют'
    ] 
  },
  { 
    key: 'ai_policy', 
    label: 'Есть ли правила использования', 
    type: 'select', 
    level: 'department', 
    block: 'Как ИИ уже используется',
    options: [
      'правил нет',
      'устные договорённости',
      'письменный регламент',
      'регламент и контроль исполнения'
    ] 
  },
  {
    key: 'ai_corporate_access',
    label: 'Есть ли доступ, оплаченный компанией',
    type: 'select',
    level: 'department',
    block: 'Как ИИ уже используется',
    options: [
      'нет',
      'у отдельных сотрудников',
      'у подразделения',
      'у всей компании'
    ]
  },
  {
    key: 'ai_integration',
    label: 'Встроен ли ИИ в рабочие системы',
    type: 'select',
    level: 'department',
    block: 'Как ИИ уже используется',
    options: [
      'нет',
      'пробный запуск',
      'в одном процессе',
      'в нескольких процессах'
    ]
  },
  {
    key: 'ai_data_leak_risk',
    label: 'Выносятся ли во внешние сервисы данные, которые выносить нельзя',
    type: 'select',
    level: 'department',
    block: 'Как ИИ уже используется',
    options: ['да', 'нет', 'не знаю']
  },
  { 
    key: 'ai_level', 
    label: 'Уровень использования ИИ', 
    type: 'select', 
    level: 'department', 
    block: 'Использование ИИ',
    usedInRules: true,
    options: [
      'не используется', 
      'личные аккаунты, компания не знает', 
      'личные аккаунты, руководитель в курсе', 
      'корпоративный доступ без регламентов', 
      'корпоративный доступ с регламентами', 
      'встроен в процессы'
    ] 
  },
  { 
    key: 'ai_tools', 
    label: 'Инструменты', 
    type: 'multi', 
    level: 'department', 
    block: 'Использование ИИ',
    options: ['ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'YandexGPT', 'GigaChat', 'DeepSeek', 'Copilot', 'ИИ в 1С или CRM', 'переводчики', 'генераторы изображений', 'транскрибация', 'отраслевое ПО', 'своя разработка'] 
  },
  { 
    key: 'ai_who', 
    label: 'Кто использует', 
    type: 'select', 
    level: 'department', 
    block: 'Использование ИИ',
    options: ['большинство', 'половина', 'энтузиасты', 'только руководитель', 'никто'] 
  },
  { 
    key: 'ai_payment', 
    label: 'Оплата', 
    type: 'select', 
    level: 'department', 
    block: 'Использование ИИ',
    options: ['компания централизованно', 'сотрудники сами', 'только бесплатные версии', 'не знаю'] 
  },
  { 
    key: 'ai_data_leak', 
    label: 'Загружались ли рабочие данные', 
    type: 'select', 
    level: 'department', 
    block: 'Использование ИИ',
    usedInRules: true,
    options: ['да регулярно', 'да единично', 'нет', 'не знаю'] 
  },
  { 
    key: 'ai_barriers', 
    label: 'Что мешает', 
    type: 'multi', 
    level: 'department', 
    block: 'Использование ИИ',
    options: ['не знают как', 'нет времени', 'нет доступа', 'запрет ИБ', 'не доверяют результату', 'пробовали и не понравилось', 'нет задач', 'дорого'] 
  },
  { key: 'ai_usefulness', label: 'Оценка пользы (1-5)', type: 'scale', level: 'department', block: 'Использование ИИ' },
  { key: 'ai_case', label: 'Работающий кейс', type: 'textarea', level: 'department', block: 'Использование ИИ' },
  { 
    key: 'ai_shadow_since', 
    label: 'Как давно используют личные аккаунты', 
    type: 'select', 
    level: 'department', 
    block: 'Использование ИИ',
    options: ['меньше 3 мес', '3-6 мес', '6-12 мес', 'больше года'],
    showIf: { key: 'ai_level', op: 'contains', value: 'личные аккаунты' }
  },
  { 
    key: 'ai_shadow_count', 
    label: 'Сколько человек', 
    type: 'number', 
    level: 'department', 
    block: 'Использование ИИ',
    showIf: { key: 'ai_level', op: 'contains', value: 'личные аккаунты' }
  },
  { 
    key: 'ai_shadow_security_knows', 
    label: 'Знает ли ИБ', 
    type: 'select', 
    level: 'department', 
    block: 'Использование ИИ',
    options: ['да', 'нет', 'не знаю'],
    showIf: { key: 'ai_level', op: 'contains', value: 'личные аккаунты' }
  },

  // Блок Г. Потери (loss_)
  { key: 'loss_manual_entry', label: 'Ручной ввод данных', type: 'scale', level: 'department', block: 'Потери', usedInRules: true },
  { key: 'loss_search', label: 'Долгий поиск информации', type: 'scale', level: 'department', block: 'Потери', usedInRules: true },
  { key: 'loss_approvals', label: 'Длинные цепочки согласований', type: 'scale', level: 'department', block: 'Потери', usedInRules: true },
  { key: 'loss_errors', label: 'Ошибки и переделки', type: 'scale', level: 'department', block: 'Потери', usedInRules: true },
  { key: 'loss_manual_reports', label: 'Ручная сборка отчетов', type: 'scale', level: 'department', block: 'Потери', usedInRules: true },
  { key: 'loss_lost_in_chat', label: 'Потеря задач в мессенджерах', type: 'scale', level: 'department', block: 'Потери', usedInRules: true },
  { key: 'loss_bus_factor', label: 'Зависимость от ключевых людей', type: 'scale', level: 'department', block: 'Потери', usedInRules: true },
  { key: 'loss_slow_onboarding', label: 'Долгий выход новичков на результат', type: 'scale', level: 'department', block: 'Потери', usedInRules: true },
  { key: 'loss_understaffed', label: 'Перегрузка и нехватка людей', type: 'scale', level: 'department', block: 'Потери', usedInRules: true },
  { key: 'loss_complaints', label: 'Жалобы клиентов/смежников', type: 'scale', level: 'department', block: 'Потери', usedInRules: true },
  { key: 'loss_no_visibility', label: 'Нет прозрачности статуса задач', type: 'scale', level: 'department', block: 'Потери', usedInRules: true },
  { key: 'loss_repeat_questions', label: 'Повторяющиеся вопросы', type: 'scale', level: 'department', block: 'Потери', usedInRules: true },
  { key: 'loss_unused_regulations', label: 'Регламенты есть, но не читают', type: 'scale', level: 'department', block: 'Потери', usedInRules: true },
  { key: 'loss_data_mismatch', label: 'Расхождения в данных разных систем', type: 'scale', level: 'department', block: 'Потери', usedInRules: true },
  { key: 'loss_paper', label: 'Бумажный документооборот', type: 'scale', level: 'department', block: 'Потери', usedInRules: true },
  { key: 'loss_comment', label: 'Комментарий по потерям', type: 'textarea', level: 'department', block: 'Потери' },

  // Блок Д. Данные и системы
  { 
    key: 'sys_list', 
    label: 'Основные системы', 
    type: 'multi', 
    level: 'department', 
    block: 'Данные и системы',
    options: ['1С', 'SAP', 'Битрикс24', 'amoCRM', 'МойСклад', 'Excel и Google Таблицы', 'ЭДО', 'почта', 'мессенджеры', 'бумажный журнал', 'самописная система', 'отраслевое ПО', 'системы нет'] 
  },
  { key: 'sys_has_api', label: 'Наличие API', type: 'select', level: 'department', block: 'Данные и системы', options: ['да', 'нет', 'не знаю'], usedInRules: true },
  { 
    key: 'sys_api_which', 
    label: 'Какие системы имеют API', 
    type: 'multi', 
    level: 'department', 
    block: 'Данные и системы',
    showIf: { key: 'sys_has_api', op: '==', value: 'да' }
  },
  { 
    key: 'sys_api_docs', 
    label: 'Наличие документации API', 
    type: 'select', 
    level: 'department', 
    block: 'Данные и системы', 
    options: ['есть полная', 'частично', 'нет', 'не знаю'],
    showIf: { key: 'sys_has_api', op: '==', value: 'да' }
  },
  { 
    key: 'sys_docs_storage', 
    label: 'Хранение документов', 
    type: 'multi', 
    level: 'department', 
    block: 'Данные и системы',
    options: ['файловый сервер', 'облако', 'локальные компьютеры', 'бумажный архив', 'в системе'],
    usedInRules: true
  },
  { 
    key: 'sys_knowledge_base', 
    label: 'База знаний', 
    type: 'select', 
    level: 'department', 
    block: 'Данные и системы',
    usedInRules: true,
    options: ['есть в электронном виде', 'частично', 'нет'] 
  },
  { key: 'sys_data_quality', label: 'Качество данных (1-5)', type: 'scale', level: 'department', block: 'Данные и системы', usedInRules: true },
  { 
    key: 'sys_data_problems', 
    label: 'Проблемы данных', 
    type: 'multi', 
    level: 'department', 
    block: 'Данные и системы',
    options: ['дубли', 'пропуски', 'разные форматы', 'ручной ввод', 'нет владельца'],
    showIf: { key: 'sys_data_quality', op: '<', value: 3 }
  },
  { 
    key: 'sys_volume_tracking', 
    label: 'Учет объемов работ', 
    type: 'select', 
    level: 'department', 
    block: 'Данные и системы',
    usedInRules: true,
    options: ['детально', 'частично', 'не ведётся'] 
  },

  // Блок Е. Готовность
  { key: 'ready_manager', label: 'Готовность руководителя (1-5)', type: 'scale', level: 'department', block: 'Готовность', usedInRules: true },
  { key: 'ready_staff', label: 'Готовность сотрудников (1-5)', type: 'scale', level: 'department', block: 'Готовность' },
  { key: 'ready_owner', label: 'Наличие владельца изменений', type: 'select', level: 'department', block: 'Готовность', options: ['есть', 'нет'] },
  { 
    key: 'ready_owner_role', 
    label: 'Роль владельца изменений', 
    type: 'text', 
    level: 'department', 
    block: 'Готовность',
    showIf: { key: 'ready_owner', op: '==', value: 'есть' }
  },
  { 
    key: 'ready_attitude', 
    label: 'Отношение к AI', 
    type: 'select', 
    level: 'department', 
    block: 'Готовность', 
    options: ['ждут', 'нейтрально', 'опасаются сокращений', 'против'] 
  },
  { 
    key: 'ready_layoff_history', 
    label: 'Были ли сокращения при автоматизации', 
    type: 'select', 
    level: 'department', 
    block: 'Готовность', 
    options: ['да', 'нет'],
    showIf: { key: 'ready_attitude', op: '==', value: 'опасаются сокращений' }
  },
  { 
    key: 'ready_time', 
    label: 'Наличие времени на пилоты', 
    type: 'select', 
    level: 'department', 
    block: 'Готовность', 
    options: ['есть', 'минимум', 'нет'] 
  },

  // Блок Ж. Коммуникации
  { key: 'comm_meetings_week', label: 'Встреч в неделю', type: 'number', level: 'department', block: 'Коммуникации', usedInRules: true },
  { key: 'comm_meeting_duration', label: 'Средняя длительность (мин)', type: 'number', level: 'department', block: 'Коммуникации' },
  { key: 'comm_participants', label: 'Среднее число участников', type: 'number', level: 'department', block: 'Коммуникации' },
  { 
    key: 'comm_minutes', 
    label: 'Ведутся ли протоколы', 
    type: 'select', 
    level: 'department', 
    block: 'Коммуникации', 
    usedInRules: true,
    options: ['всегда', 'иногда', 'нет'] 
  },
  { key: 'comm_minutes_who', label: 'Кто пишет протоколы', type: 'text', level: 'department', block: 'Коммуникации' },
  { key: 'comm_prep_time', label: 'Время на подготовку (мин)', type: 'number', level: 'department', block: 'Коммуникации' },
  { 
    key: 'comm_tasks_where', 
    label: 'Где ставятся задачи', 
    type: 'select', 
    level: 'department', 
    block: 'Коммуникации', 
    options: ['таск-трекер', 'почта', 'мессенджер', 'устно', 'нигде'] 
  },
  { key: 'comm_tasks_lost', label: 'Забываются ли задачи', type: 'select', level: 'department', block: 'Коммуникации', options: ['часто', 'иногда', 'нет'] },
  { key: 'comm_main_channel', label: 'Основной канал связи', type: 'select', level: 'department', block: 'Коммуникации', options: ['мессенджеры', 'почта', 'телефон', 'встречи'] },
  { key: 'comm_messages_day', label: 'Сообщений в день на чел.', type: 'number', level: 'department', block: 'Коммуникации' },
  { key: 'comm_correspondence_time', label: 'Время на переписку (мин/день)', type: 'number', level: 'department', block: 'Коммуникации' },

  // Блок З. Отчётность
  { 
    key: 'rep_list', 
    label: 'Список отчетов', 
    type: 'table', 
    level: 'department', 
    block: 'Отчётность',
    tableColumns: [
      { key: 'name', label: 'Название', type: 'text' },
      { key: 'frequency', label: 'Периодичность', type: 'text' },
      { key: 'target', label: 'Для кого', type: 'text' },
      { key: 'hours', label: 'Часов на подг.', type: 'number' },
      { key: 'sources', label: 'Источники', type: 'text' }
    ]
  },
  { 
    key: 'rep_manual_collection', 
    label: 'Сбор данных для отчетов', 
    type: 'select', 
    level: 'department', 
    block: 'Отчётность', 
    usedInRules: true,
    options: ['полностью вручную', 'частично', 'автоматически'] 
  },
  { key: 'rep_systems_count', label: 'Число систем для одного отчета', type: 'number', level: 'department', block: 'Отчётность', usedInRules: true },
  { key: 'rep_discrepancies', label: 'Расхождения в данных', type: 'select', level: 'department', block: 'Отчётность', options: ['часто', 'иногда', 'нет'] },
  { key: 'rep_checker', label: 'Кто проверяет отчеты', type: 'text', level: 'department', block: 'Отчётность' },
  { key: 'rep_actually_used', label: 'Отчеты реально используются', type: 'select', level: 'department', block: 'Отчётность', options: ['да', 'частично', 'не уверены'] },

  // Блок И. Знания
  { 
    key: 'know_regulations', 
    label: 'Наличие регламентов', 
    type: 'select', 
    level: 'department', 
    block: 'Знания', 
    options: ['полные', 'частичные', 'нет'] 
  },
  { key: 'know_storage', label: 'Где хранятся знания', type: 'multi', level: 'department', block: 'Знания', options: ['Confluence/Wiki', 'файловый сервер', 'папки на дисках', 'в головах', 'бумажные папки'] },
  { key: 'know_updated', label: 'Актуальность знаний', type: 'select', level: 'department', block: 'Знания', options: ['в этом году', 'давно', 'не знаю'] },
  { key: 'know_onboarding_way', label: 'Способ онбординга', type: 'select', level: 'department', block: 'Знания', options: ['наставник', 'регламенты', 'методом проб'] },
  { key: 'know_onboarding_months', label: 'Месяцев до полной автономии', type: 'number', level: 'department', block: 'Знания' },
  { key: 'know_questions_day', label: 'Вопросов коллегам в день', type: 'number', level: 'department', block: 'Знания', usedInRules: true },
  { key: 'know_key_person', label: 'Есть ли незаменимый сотрудник', type: 'select', level: 'department', block: 'Знания', options: ['да', 'нет'], usedInRules: true },
  { 
    key: 'know_key_person_absent', 
    label: 'Что будет если он уйдет', 
    type: 'textarea', 
    level: 'department', 
    block: 'Знания',
    showIf: { key: 'know_key_person', op: '==', value: 'да' }
  },

  // Блок К. Стыки
  { key: 'cross_departments', label: 'С какими отделами работаете', type: 'multi', level: 'department', block: 'Стыки' },
  { key: 'cross_transfer_way', label: 'Способ передачи данных', type: 'select', level: 'department', block: 'Стыки', options: ['система', 'почта', 'мессенджер', 'устно', 'бумага'] },
  { key: 'cross_losses', label: 'Потери на стыках', type: 'select', level: 'department', block: 'Стыки', options: ['часто', 'иногда', 'нет'] },
  { key: 'cross_stuck_what', label: 'Что обычно застревает', type: 'textarea', level: 'department', block: 'Стыки' },
  { key: 'cross_double_entry', label: 'Двойной ввод данных', type: 'select', level: 'department', block: 'Стыки', options: ['да', 'нет', 'не знаю'], usedInRules: true },
  { key: 'cross_conflict_resolver', label: 'Кто решает конфликты стыков', type: 'text', level: 'department', block: 'Стыки' },

  // Блок Л. Ограничения подразделения
  { key: 'lim_personal_data', label: 'Работа с перс. данными', type: 'select', level: 'department', block: 'Ограничения', options: ['да', 'нет'], usedInRules: true },
  { 
    key: 'lim_pd_categories', 
    label: 'Категории ПД', 
    type: 'multi', 
    level: 'department', 
    block: 'Ограничения',
    options: ['ФИО и контакты', 'паспортные данные', 'биометрия', 'состояние здоровья', 'финансы'],
    showIf: { key: 'lim_personal_data', op: '==', value: 'да' }
  },
  { 
    key: 'lim_pd_consents', 
    label: 'Наличие согласий на ОПД', 
    type: 'select', 
    level: 'department', 
    block: 'Ограничения',
    options: ['есть все', 'частично', 'нет'],
    showIf: { key: 'lim_personal_data', op: '==', value: 'да' }
  },
  { key: 'lim_trade_secret', label: 'Коммерческая тайна', type: 'select', level: 'department', block: 'Ограничения', options: ['да', 'нет'] },
  { key: 'lim_industry_reg', label: 'Отраслевое регулирование', type: 'select', level: 'department', block: 'Ограничения', options: ['да', 'нет'] },
  { 
    key: 'lim_cloud_allowed', 
    label: 'Допустимость облаков', 
    type: 'select', 
    level: 'department', 
    block: 'Ограничения', 
    options: ['да', 'нет', 'с ограничениями'],
    usedInRules: true
  },
  { 
    key: 'lim_foreign_allowed', 
    label: 'Допустимость зарубежного ПО', 
    type: 'select', 
    level: 'department', 
    block: 'Ограничения', 
    options: ['да', 'нет', 'с ограничениями'],
    usedInRules: true
  },

  // --- PROCESS LEVEL (pr_) ---
  { key: 'pr_role', label: 'Кто выполняет', type: 'text', level: 'process', block: 'Основные параметры', group: 'always' },
  { key: 'pr_people', label: 'Сколько человек задействовано', type: 'number', level: 'process', block: 'Основные параметры', group: 'always' },
  { 
    key: 'pr_frequency', 
    label: 'Частота', 
    type: 'select', 
    level: 'process', 
    block: 'Основные параметры',
    usedInRules: true,
    group: 'always',
    options: ['несколько раз в день', 'ежедневно', 'несколько раз в неделю', 'еженедельно', 'ежемесячно', 'по событию'] 
  },
  { 
    key: 'pr_minutes', 
    label: 'Минут на одну операцию', 
    type: 'number', 
    level: 'process', 
    block: 'Основные параметры', 
    usedInCalc: true, 
    group: 'always',
    labelOverrides: {
      'HR': 'Минут на одного кандидата',
      'ИТ': 'Минут на один тикет',
      'Продажи': 'Минут на один лид'
    }
  },
  { key: 'pr_ops_month', label: 'Операций в месяц', type: 'number', level: 'process', block: 'Основные параметры', usedInCalc: true, usedInRules: true, group: 'always' },
  { key: 'pr_manual_share', label: 'Доля ручного труда, %', type: 'slider', level: 'process', block: 'Основные параметры', usedInCalc: true, usedInRules: true, group: 'always' },
  { 
    key: 'pr_systems', 
    label: 'Где выполняется', 
    type: 'multi', 
    level: 'process', 
    block: 'Технический стек',
    usedInRules: true,
    group: 'always',
    options: ['1С', 'SAP', 'Битрикс24', 'amoCRM', 'МойСклад', 'Excel и Google Таблицы', 'ЭДО', 'почта', 'мессенджеры', 'бумажный журнал', 'самописная система', 'отраслевое ПО', 'системы нет'] 
  },
  { 
    key: 'pr_input_format', 
    label: 'Формат входящих данных', 
    type: 'select', 
    level: 'process', 
    block: 'Технический стек',
    usedInRules: true,
    group: 'clarify',
    options: ['структурированные в системе', 'Excel', 'письмо или сообщение', 'скан или фото', 'бумага', 'устно'] 
  },
  { 
    key: 'pr_standardization', 
    label: 'Стандартизация', 
    type: 'select', 
    level: 'process', 
    block: 'Технический стек',
    usedInRules: true,
    group: 'clarify',
    options: ['полностью с регламентом', 'частично', 'каждый раз по-разному'] 
  },
  { 
    key: 'pr_human_decision', 
    label: 'Необходимость решения человека', 
    type: 'select', 
    level: 'process', 
    block: 'Технический стек',
    usedInRules: true,
    group: 'clarify',
    options: ['нет механическая', 'иногда', 'постоянно'] 
  },
  { 
    key: 'pr_error_rate', 
    label: 'Частота ошибок', 
    type: 'select', 
    level: 'process', 
    block: 'Качество',
    group: 'clarify',
    options: ['почти не бывает', 'редко', 'регулярно', 'постоянно'] 
  },
  { key: 'pr_error_cost', label: 'Стоимость ошибки, ₽', type: 'number', level: 'process', block: 'Качество', usedInCalc: true, group: 'clarify' },
  { 
    key: 'pr_losses', 
    label: 'Типовые потери процесса', 
    type: 'multi', 
    level: 'process', 
    block: 'Качество',
    usedInRules: true,
    group: 'clarify',
    options: [
      { value: 'loss_manual_entry', label: 'Ручной ввод данных' },
      { value: 'loss_search', label: 'Долгий поиск информации' },
      { value: 'loss_approvals', label: 'Ожидание согласований' },
      { value: 'loss_errors', label: 'Ошибки и переделки' },
      { value: 'loss_manual_reports', label: 'Ручная сборка отчетов' },
      { value: 'loss_lost_in_chat', label: 'Потеря информации в чатах' },
      { value: 'loss_bus_factor', label: 'Зависимость от одного сотрудника' },
      { value: 'loss_slow_onboarding', label: 'Долгое обучение новичков' },
      { value: 'loss_understaffed', label: 'Хроническая перегрузка' },
      { value: 'loss_complaints', label: 'Жалобы клиентов' },
      { value: 'loss_no_visibility', label: 'Отсутствие прозрачности' },
      { value: 'loss_repeat_questions', label: 'Повторяющиеся вопросы' },
      { value: 'loss_unused_regulations', label: 'Регламенты не используются' },
      { value: 'loss_data_mismatch', label: 'Расхождение данных' },
      { value: 'loss_paper', label: 'Бумажный документооборот' }
    ]
  },
  { 
    key: 'pr_ai_now', 
    label: 'Используется ли ИИ сейчас', 
    type: 'select', 
    level: 'process', 
    block: 'Качество',
    usedInRules: true,
    group: 'clarify',
    options: ['нет', 'личные аккаунты', 'корпоративный доступ', 'встроенная функция', 'своя разработка'] 
  },
  { key: 'pr_parallel_people', label: 'Человек в одной операции', type: 'number', level: 'process', block: 'Нагрузка', group: 'details' },
  { 
    key: 'pr_peak_period', 
    label: 'Пиковые периоды', 
    type: 'select', 
    level: 'process', 
    block: 'Нагрузка', 
    group: 'details',
    options: ['конец месяца', 'конец квартала', 'сезон', 'нет'] 
  },
  { key: 'pr_peak_multiplier', label: 'Рост нагрузки в пик, раз', type: 'number', level: 'process', block: 'Нагрузка', group: 'details' },
  { key: 'pr_delay_impact', label: 'Что если не вовремя', type: 'textarea', level: 'process', block: 'Нагрузка', group: 'details' },
  { key: 'pr_quality_control', label: 'Контроль качества', type: 'select', level: 'process', block: 'Нагрузка', options: ['да', 'нет'], group: 'details' },
  { key: 'pr_offline_possible', label: 'Можно без системы', type: 'select', level: 'process', block: 'Нагрузка', options: ['да', 'нет'], group: 'details' },
  { key: 'pr_training_days', label: 'Обучение новичка, дней', type: 'number', level: 'process', block: 'Нагрузка', group: 'details' },
  { key: 'pr_mechanical_score', label: 'Насколько механическая (1-5)', type: 'scale', level: 'process', block: 'Обратная связь', group: 'details' },
  { key: 'pr_improve_first', label: 'Что изменить первым', type: 'textarea', level: 'process', block: 'Обратная связь', group: 'details' },

  // Ветвления процесса
  { 
    key: 'pr_docs_month', 
    label: 'Документов в месяц', 
    type: 'number', 
    level: 'process', 
    block: 'Документы',
    showIf: { key: 'pr_input_format', op: 'contains', value: ['скан или фото', 'бумага'] }
  },
  { 
    key: 'pr_fields_manual', 
    label: 'Полей для ручного ввода', 
    type: 'number', 
    level: 'process', 
    block: 'Документы',
    showIf: { key: 'pr_input_format', op: 'contains', value: ['скан или фото', 'бумага'] }
  },
  { 
    key: 'pr_forms_uniform', 
    label: 'Однотипность форм', 
    type: 'select', 
    level: 'process', 
    block: 'Документы',
    options: ['строго одна форма', 'несколько видов', 'всегда разные'],
    showIf: { key: 'pr_input_format', op: 'contains', value: ['скан или фото', 'бумага'] }
  },
  { 
    key: 'pr_scanner_exists', 
    label: 'Наличие сканера/МФУ', 
    type: 'select', 
    level: 'process', 
    block: 'Документы',
    options: ['есть', 'нет'],
    showIf: { key: 'pr_input_format', op: 'contains', value: ['скан или фото', 'бумага'] }
  },
  { 
    key: 'pr_error_fixer', 
    label: 'Кто исправляет ошибки', 
    type: 'text', 
    level: 'process', 
    block: 'Качество',
    showIf: { key: 'pr_error_rate', op: 'contains', value: ['регулярно', 'постоянно'] }
  },
  { 
    key: 'pr_error_fix_minutes', 
    label: 'Минут на исправление одной ошибки', 
    type: 'number', 
    level: 'process', 
    block: 'Качество',
    showIf: { key: 'pr_error_rate', op: 'contains', value: ['регулярно', 'постоянно'] }
  },
  { 
    key: 'pr_error_tracking', 
    label: 'Ведется ли реестр ошибок', 
    type: 'select', 
    level: 'process', 
    block: 'Качество',
    options: ['да', 'нет'],
    showIf: { key: 'pr_error_rate', op: 'contains', value: ['регулярно', 'постоянно'] }
  },
  { 
    key: 'pr_variance_reason', 
    label: 'Причина вариативности', 
    type: 'textarea', 
    level: 'process', 
    block: 'Технический стек',
    showIf: { key: 'pr_standardization', op: '==', value: 'каждый раз по-разному' }
  },
  { 
    key: 'pr_typical_cases_count', 
    label: 'Количество типовых сценариев', 
    type: 'number', 
    level: 'process', 
    block: 'Технический стек',
    showIf: { key: 'pr_standardization', op: '==', value: 'каждый раз по-разному' }
  },
  { 
    key: 'pr_ai_who_exactly', 
    label: 'Кто именно использует ИИ', 
    type: 'text', 
    level: 'process', 
    block: 'Качество',
    showIf: { key: 'pr_ai_now', op: '==', value: 'личные аккаунты' }
  },
  { 
    key: 'pr_ai_data_sent', 
    label: 'Какие данные передаются в ИИ', 
    type: 'select', 
    level: 'process', 
    block: 'Качество',
    options: ['обезличенные', 'реальные рабочие', 'только вопросы'],
    showIf: { key: 'pr_ai_now', op: '==', value: 'личные аккаунты' }
  },

  // Виртуальные и системные поля для логики правил
  { key: 'dept_name', label: 'Название отдела', type: 'text', level: 'department', block: 'Системное' }
];
