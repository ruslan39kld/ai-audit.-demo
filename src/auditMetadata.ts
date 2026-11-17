import { LucideIcon, 
  Settings, 
  Users, 
  Megaphone, 
  Headphones, 
  ShoppingCart, 
  Box, 
  Truck, 
  Factory, 
  HardHat, 
  ShieldCheck, 
  Wrench, 
  UserPlus, 
  UserCheck, 
  CreditCard, 
  Scale, 
  Laptop, 
  FileText, 
  Store, 
  Utensils, 
  Briefcase 
} from 'lucide-react';

export interface DepartmentMetadata {
  id: string;
  name: string;
  icon: any;
  description: string;
  typicalProcesses: string[];
  estimatedMinutes: number;
}

export const DEPARTMENTS: DepartmentMetadata[] = [
  {
    id: 'management',
    name: 'Руководство и управление',
    icon: Settings,
    description: 'Стратегическое планирование и общий контроль',
    typicalProcesses: ['сбор отчётности с подразделений', 'подготовка совещаний и материалов', 'ведение протоколов', 'контроль поручений', 'анализ показателей', 'подготовка презентаций и справок', 'работа с входящей корреспонденцией', 'согласование документов', 'подготовка стратегических документов', 'коммуникация с собственником'],
    estimatedMinutes: 20
  },
  {
    id: 'sales',
    name: 'Продажи и работа с клиентами',
    icon: Users,
    description: 'Ведение воронки и работа с заказчиками',
    typicalProcesses: ['обработка входящих заявок', 'квалификация лида', 'первичная консультация', 'подготовка коммерческого предложения', 'расчёт стоимости и спецификаций', 'согласование скидок и условий', 'ведение CRM и заполнение карточек', 'напоминания и повторные касания', 'подготовка договора', 'передача заказа в производство', 'работа с дебиторкой', 'отчётность по воронке'],
    estimatedMinutes: 30
  },
  {
    id: 'marketing',
    name: 'Маркетинг',
    icon: Megaphone,
    description: 'Привлечение трафика и управление брендом',
    typicalProcesses: ['подготовка контента и текстов', 'ведение соцсетей', 'email-рассылки', 'настройка рекламных кампаний', 'аналитика кампаний и отчёты', 'конкурентный мониторинг', 'подготовка презентаций', 'работа с отзывами'],
    estimatedMinutes: 25
  },
  {
    id: 'support',
    name: 'Клиентская поддержка и колл-центр',
    icon: Headphones,
    description: 'Обработка входящих запросов и жалоб',
    typicalProcesses: ['приём обращений', 'классификация и маршрутизация', 'ответы на типовые вопросы', 'поиск информации для ответа', 'эскалация сложных случаев', 'исходящий обзвон', 'ведение базы знаний', 'контроль сроков и SLA'],
    estimatedMinutes: 35
  },
  {
    id: 'procurement',
    name: 'Закупки и снабжение',
    icon: ShoppingCart,
    description: 'Обеспечение компании ресурсами',
    typicalProcesses: ['сбор потребности от подразделений', 'поиск и проверка поставщиков', 'запрос коммерческих предложений', 'сравнение и выбор предложения', 'согласование закупки', 'оформление заказа', 'контроль исполнения и сроков'],
    estimatedMinutes: 20
  },
  {
    id: 'warehouse',
    name: 'Склад',
    icon: Box,
    description: 'Хранение и учет товарно-материальных ценностей',
    typicalProcesses: ['приёмка товара', 'размещение и учёт', 'комплектация заказов', 'отгрузка и оформление документов', 'инвентаризация', 'контроль остатков', 'обработка возвратов'],
    estimatedMinutes: 15
  },
  {
    id: 'logistics',
    name: 'Логистика и транспорт',
    icon: Truck,
    description: 'Доставка и управление флотом',
    typicalProcesses: ['планирование маршрутов', 'распределение заказов по машинам', 'диспетчеризация', 'обработка отклонений', 'оформление путевых листов', 'контроль расхода топлива', 'работа с перевозчиками'],
    estimatedMinutes: 20
  },
  {
    id: 'production',
    name: 'Производство',
    icon: Factory,
    description: 'Создание готовой продукции',
    typicalProcesses: ['сменное планирование', 'выдача сменных заданий', 'учёт выработки', 'контроль простоев', 'заявки на материалы', 'приём и передача смены', 'сменные отчёты', 'работа с технологическими картами'],
    estimatedMinutes: 40
  },
  {
    id: 'construction',
    name: 'Строительство и ПТО',
    icon: HardHat,
    description: 'Проектно-технический отдел и стройплощадка',
    typicalProcesses: ['расчёт объёмов работ', 'ведение исполнительной документации', 'подготовка актов КС-2 и КС-3', 'ведомости и списание материалов', 'согласование с заказчиком', 'ведение журналов работ', 'проверка проектной документации'],
    estimatedMinutes: 45
  },
  {
    id: 'quality',
    name: 'Качество и ОТК',
    icon: ShieldCheck,
    description: 'Контроль стандартов и разбор брака',
    typicalProcesses: ['входной контроль', 'операционный контроль', 'оформление несоответствий', 'разбор рекламаций', 'анализ причин брака', 'разработка корректирующих мероприятий', 'ведение отчётности по качеству'],
    estimatedMinutes: 25
  },
  {
    id: 'maintenance',
    name: 'Эксплуатация и техобслуживание',
    icon: Wrench,
    description: 'Поддержка работоспособности объектов',
    typicalProcesses: ['приём и регистрация заявок', 'диспетчеризация исполнителей', 'планово-предупредительные работы', 'учёт оборудования', 'заказ запчастей', 'работа с подрядчиками', 'приёмка работ и акты'],
    estimatedMinutes: 20
  },
  {
    id: 'hr_recruitment',
    name: 'HR: подбор персонала',
    icon: UserPlus,
    description: 'Поиск и найм новых сотрудников',
    typicalProcesses: ['приём заявки на подбор', 'составление вакансий', 'скрининг резюме', 'первичный обзвон', 'назначение собеседований', 'проведение интервью', 'сбор обратной связи', 'проверка кандидата', 'оформление оффера'],
    estimatedMinutes: 30
  },
  {
    id: 'hr_admin',
    name: 'HR: кадровое администрирование',
    icon: UserCheck,
    description: 'Документальное сопровождение сотрудников',
    typicalProcesses: ['оформление приёма на работу', 'кадровые приказы', 'ведение табеля', 'графики отпусков', 'обработка больничных', 'адаптация новых сотрудников', 'организация обучения'],
    estimatedMinutes: 20
  },
  {
    id: 'finance',
    name: 'Финансы и бухгалтерия',
    icon: CreditCard,
    description: 'Учет денег, налоги и отчетность',
    typicalProcesses: ['обработка первичных документов', 'сверка с контрагентами', 'проведение платежей', 'ведение бюджета', 'подготовка управленческой отчётности', 'обработка авансовых отчётов', 'расчёт себестоимости'],
    estimatedMinutes: 25
  },
  {
    id: 'legal',
    name: 'Юридический отдел',
    icon: Scale,
    description: 'Договорная работа и правовая защита',
    typicalProcesses: ['подготовка договоров', 'правовая экспертиза', 'согласование договоров', 'претензионная работа', 'ведение судебных дел', 'проверка контрагентов'],
    estimatedMinutes: 20
  },
  {
    id: 'it',
    name: 'ИТ',
    icon: Laptop,
    description: 'Инфраструктура, поддержка и разработка',
    typicalProcesses: ['обработка заявок пользователей', 'управление доступами', 'закупка лицензий', 'поддержка систем', 'разработка интеграций', 'информационная безопасность'],
    estimatedMinutes: 20
  },
  {
    id: 'office',
    name: 'Документооборот и канцелярия',
    icon: FileText,
    description: 'Входящая/исходящая почта и архивы',
    typicalProcesses: ['регистрация входящих и исходящих', 'сканирование и распознавание', 'маршрутизация документов', 'контроль сроков исполнения', 'архивирование', 'работа с ЭДО'],
    estimatedMinutes: 15
  },
  {
    id: 'retail',
    name: 'Розничная точка',
    icon: Store,
    description: 'Управление магазином или пунктом выдачи',
    typicalProcesses: ['составление графиков смен', 'приёмка товара', 'списания и уценка', 'инвентаризация', 'кассовая дисциплина', 'работа с жалобами покупателей'],
    estimatedMinutes: 25
  },
  {
    id: 'kitchen',
    name: 'Ресторан или кухня',
    icon: Utensils,
    description: 'Общепит и производство блюд',
    typicalProcesses: ['составление графиков смен', 'приёмка продуктов', 'списания и учёт остатков', 'расчёт себестоимости блюд', 'инвентаризация', 'заказ продуктов', 'контроль санитарных требований'],
    estimatedMinutes: 30
  },
  {
    id: 'pmo',
    name: 'Проектный офис',
    icon: Briefcase,
    description: 'Методология и контроль проектов',
    typicalProcesses: ['планирование проектов', 'ведение графиков', 'сбор статусов', 'подготовка отчётности по проектам', 'управление рисками', 'координация совещаний'],
    estimatedMinutes: 20
  }
];

export interface MaturityLevel {
  level: number;
  name: string;
  description: string;
  characteristics: string[];
}

export const MATURITY_LEVELS: MaturityLevel[] = [
  {
    level: 0,
    name: 'Нулевой',
    description: 'ИИ не используется в работе подразделения, даже в личных целях сотрудников.',
    characteristics: ['Полное игнорирование ИИ-инструментов', 'Страх перед технологией или отсутствие интереса', 'Все процессы выполняются традиционными методами']
  },
  {
    level: 1,
    name: 'Теневой',
    description: 'Сотрудники используют ИИ через личные аккаунты, часто скрывая это от руководства.',
    characteristics: ['Риски утечки коммерческих данных', 'Неравномерный рост производительности', 'Отсутствие единых стандартов качества']
  },
  {
    level: 2,
    name: 'Стихийный',
    description: 'Руководство поддерживает точечные пилоты, но единой стратегии внедрения нет.',
    characteristics: ['Наличие отдельных лицензий у энтузиастов', 'Первые попытки описать кейсы использования', 'Отсутствие интеграции с корпоративными системами']
  },
  {
    level: 3,
    name: 'Управляемый доступ',
    description: 'Внедрен корпоративный контур, приняты регламенты, проведено базовое обучение.',
    characteristics: ['Безопасный доступ через единое окно', 'Наличие библиотеки готовых запросов', 'Контроль расходов на использование']
  },
  {
    level: 4,
    name: 'Регламентированный',
    description: 'ИИ глубоко встроен в существующие бизнес-процессы и программное обеспечение.',
    characteristics: ['Автоматизированные цепочки (роботизация рутинных действий)', 'Использование поиска по документам компании', 'Наличие показателей работы ИИ в отчётности подразделения']
  },
  {
    level: 5,
    name: 'Встроенный',
    description: 'Процессы компании изначально проектируются с учетом возможностей ИИ.',
    characteristics: ['Минимальное участие человека в рутине', 'Самообучающиеся системы принятия решений', 'Высокая скорость адаптации к изменениям']
  }
];

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  { 
    term: 'Теневой ИИ', 
    definition: 'Неконтролируемое использование сотрудниками публичных нейросетей через личные аккаунты без согласования со службой безопасности, создающее риски утечки конфиденциальных данных компании.' 
  },
  { 
    term: 'Помощник сотрудника', 
    definition: 'Роль ИИ (пилот от 450 000 ₽), ускоряющая работу специалиста: подготовка черновиков документов, поиск по регламентам, протоколирование встреч. Окончательное решение всегда принимает человек.' 
  },
  { 
    term: 'Контролёр', 
    definition: 'Роль ИИ (пилот от 700 000 ₽), проводящая автоматическую проверку документов, смет, договоров и транзакций на ошибки, расхождения и соответствие стандартам перед согласованием человеком.' 
  },
  { 
    term: 'Исполнитель', 
    definition: 'Роль ИИ (пилот от 900 000 ₽), автономно выполняющая законченные рутинные операции в информационных системах (маршрутизация заявок, заполнение карточек, ввод данных) без участия оператора.' 
  },
  { 
    term: 'Корпоративный контур', 
    definition: 'Защищённая корпоративная среда доступа к алгоритмам ИИ, гарантирующая сохранность коммерческой тайны, обезличивание персональных данных и централизованный контроль расходов компании.' 
  },
  { 
    term: 'Уровень зрелости', 
    definition: 'Ступень готовности подразделения к внедрению ИИ (по шкале от 0 до 5: Нулевой, Теневой, Стихийный, Управляемый доступ, Регламентированный, Встроенный).' 
  },
  { 
    term: 'Индекс готовности', 
    definition: 'Комплексный 100-балльный показатель готовности компании к внедрению ИИ, рассчитываемый по четырём направлениям: данные (30 баллов), процессы (30 баллов), технологии (20 баллов) и организация (20 баллов).' 
  },
  { 
    term: 'Роль ИИ', 
    definition: 'Уровень делегирования ответственности алгоритму в бизнес-процессе (помощник сотрудника, контролёр или автономный исполнитель).' 
  }
];

export type AIRole = 'помощник сотрудника' | 'контролёр' | 'исполнитель';

export interface PricingCatalogItem {
  id: string;
  name: string;
  basePrice: number;
  priceRange: string;
  minPrice?: number;
  maxPrice?: number;
  period?: 'разово' | 'в месяц';
  role?: AIRole;
}

export const PRICING_CATALOG = {
  expressAudit: {
    id: 'express_audit',
    name: 'Экспресс-оценка',
    basePrice: 0,
    priceRange: '0 ₽',
  },
  comprehensiveAudit: {
    id: 'comprehensive_audit',
    name: 'Комплексный аудит',
    basePrice: 650000,
    minPrice: 500000,
    maxPrice: 900000,
    priceRange: '500 000–900 000 ₽',
  },
  pilotAssistant: {
    id: 'pilot_assistant',
    name: 'Пилот: роль «помощник сотрудника»',
    role: 'помощник сотрудника' as AIRole,
    basePrice: 450000,
    priceRange: 'от 450 000 ₽',
  },
  pilotController: {
    id: 'pilot_controller',
    name: 'Пилот: роль «контролёр»',
    role: 'контролёр' as AIRole,
    basePrice: 700000,
    priceRange: 'от 700 000 ₽',
  },
  pilotExecutor: {
    id: 'pilot_executor',
    name: 'Пилот: роль «исполнитель»',
    role: 'исполнитель' as AIRole,
    basePrice: 900000,
    priceRange: 'от 900 000 ₽',
  },
  corporateLoop: {
    id: 'corporate_loop',
    name: 'Корпоративный контур',
    basePrice: 300000,
    minPrice: 100000,
    maxPrice: 500000,
    priceRange: '100 000–500 000 ₽',
  },
  support: {
    id: 'support',
    name: 'Сопровождение',
    basePrice: 250000,
    minPrice: 250000,
    maxPrice: 600000,
    priceRange: '250 000–600 000 ₽ в месяц',
    period: 'в месяц' as const,
  },
};

export const ROLE_BASE_PRICES: Record<AIRole, number> = {
  'помощник сотрудника': PRICING_CATALOG.pilotAssistant.basePrice,
  'контролёр': PRICING_CATALOG.pilotController.basePrice,
  'исполнитель': PRICING_CATALOG.pilotExecutor.basePrice,
};

export function parseBudgetNumber(budget: string | number | undefined): number | null {
  if (typeof budget === 'number') return budget;
  if (!budget) return null;
  const clean = budget.replace(/\s+/g, '').replace(/[^0-9]/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? null : parsed;
}

export function getSolutionBasePrice(solution: { code: string; aiRole?: AIRole; budgetRange?: string; basePrice?: number }): number {
  if (solution.basePrice && solution.basePrice > 0) {
    return solution.basePrice;
  }
  if (solution.code === 'S01') {
    if (solution.budgetRange && solution.budgetRange !== '100 000–500 000 ₽') {
      const parsed = parseBudgetNumber(solution.budgetRange);
      if (parsed && parsed > 0) return parsed;
    }
    return PRICING_CATALOG.corporateLoop.basePrice; // 300 000 ₽
  }
  if (solution.budgetRange) {
    const parsed = parseBudgetNumber(solution.budgetRange);
    if (parsed && parsed > 0) {
      return parsed;
    }
  }
  if (solution.aiRole && ROLE_BASE_PRICES[solution.aiRole]) {
    return ROLE_BASE_PRICES[solution.aiRole];
  }
  return PRICING_CATALOG.pilotAssistant.basePrice;
}

export interface AISolution {
  code: string;
  name: string;
  type: string;
  aiRole: AIRole;
  description: string;
  complexity: number;
  durationWeeks: number;
  budgetRange: string;
  basePrice?: number;
  efficiencyCoeff: number;
  whatIsIt: string;
  howItWorks: string[];
  processes: string[];
  symptoms: string[];
  triggerQuestions: { question: string; condition: string }[];
  requirements: string[];
  implementationStages: { stage: string; duration: string; result: string; participants: string }[];
  effectCalculation: string;
  kpis: string[];
  risks: string[];
  limitations: string;
  maintenanceCost: string;
  dependencies?: string[]; // Prompt 17: Added dependencies
}

export const AI_SOLUTIONS: AISolution[] = [
  { 
    code: 'S01', 
    name: 'Корпоративный AI-контур', 
    type: 'Инфраструктура', 
    aiRole: 'помощник сотрудника',
    description: 'Безопасная среда для использования LLM сотрудниками', 
    complexity: 1, 
    durationWeeks: 2, 
    budgetRange: '100 000–500 000 ₽', 
    efficiencyCoeff: 0.1,
    whatIsIt: 'Единая точка доступа к топовым нейросетям через API. Все запросы проходят через внутренний шлюз, который удаляет чувствительные данные и логирует активность для контроля ИБ.',
    howItWorks: [
      'Создание защищенного канала (VPN/VPC) к провайдерам моделей',
      'Настройка системы аутентификации (SSO/LDAP)',
      'Внедрение фильтров контента и маскирования данных',
      'Запуск веб-интерфейса чата для сотрудников'
    ],
    processes: ['Любая аналитическая работа', 'Написание текстов', 'Поиск по документам', 'Переводы'],
    symptoms: [
      'Сотрудники пользуются ChatGPT через личные аккаунты',
      'Высокий риск утечки коммерческой тайны',
      'Неконтролируемые расходы на разные AI-сервисы',
      'Необходимость оплачивать зарубежные подписки'
    ],
    triggerQuestions: [
      { question: 'Используются личные аккаунты', condition: 'да' },
      { question: 'Уровень AI-зрелости', condition: '<= 2' }
    ],
    requirements: ['Облачный сервер или собственный ЦОД', 'API-ключи провайдеров', 'Политика ИБ'],
    implementationStages: [
      { stage: 'Обследование и ИБ', duration: '1 нед', result: 'Архитектурная схема', participants: 'ИТ-директор, ИБ' },
      { stage: 'Настройка шлюза', duration: '1 нед', result: 'Работающий API-прокси', participants: 'DevOps' },
      { stage: 'Запуск интерфейса', duration: '1 нед', result: 'Доступ для первых 50 чел', participants: 'Продакт' }
    ],
    effectCalculation: 'Снижение стоимости подписок на 40%, снижение риска утечки данных (репутационный эффект)',
    kpis: ['Доля активных пользователей', 'Объем маскированных данных', 'Стоимость запроса'],
    risks: ['Сопротивление ИБ из-за облачных API', 'Низкая грамотность сотрудников'],
    limitations: 'Не автоматизирует бизнес-процессы напрямую, только ускоряет человека.',
    maintenanceCost: 'API провайдеров + поддержка сервера + подписка на платформу шлюза'
  },
  { 
    code: 'S02', 
    name: 'RAG-ассистент по базе знаний', 
    type: 'Ассистент', 
    aiRole: 'помощник сотрудника',
    description: 'Умный поиск и ответы по внутренним документам', 
    complexity: 3, 
    durationWeeks: 6, 
    budgetRange: 'от 450 000 ₽', 
    efficiencyCoeff: 0.4,
    dependencies: ['S01'],
    whatIsIt: 'Система, которая индексирует ваши регламенты, инструкции и договоры, позволяя задавать вопросы на естественном языке и получать ответы со ссылками на первоисточники.',
    howItWorks: [
      'Подключение к хранилищам (Disk, SharePoint, Confluence)',
      'Разбивка документов на фрагменты и создание векторных эмбеддингов',
      'Поиск наиболее релевантных фрагментов по смыслу вопроса',
      'Генерация ответа моделью на основе найденных фактов'
    ],
    processes: ['Онбординг сотрудников', 'Техническая поддержка', 'Юридическая экспертиза', 'Работа с закупками'],
    symptoms: [
      'Сотрудники тратят более 30 мин в день на поиск инструкций',
      'Разные специалисты дают разные ответы на один вопрос',
      'Зависимость от "звездных" экспертов, которые всё помнят',
      'Долгая адаптация новых сотрудников'
    ],
    triggerQuestions: [
      { question: 'Долгий поиск информации', condition: 'интенсивность >= 4' },
      { question: 'Наличие базы знаний', condition: 'да' }
    ],
    requirements: ['Векторная БД (Pinecone/Chroma)', 'Массив оцифрованных документов', 'LLM с широким контекстным окном'],
    implementationStages: [
      { stage: 'Подготовка данных', duration: '2 нед', result: 'Очищенный массив PDF/Markdown', participants: 'Владельцы знаний' },
      { stage: 'Индексация', duration: '2 нед', result: 'Векторная база данных', participants: 'AI Engineer' },
      { stage: 'Тюнинг точности', duration: '2 нед', result: 'Точность ответов > 90%', participants: 'QA' }
    ],
    effectCalculation: 'Экономия времени экспертов на консультации коллег * стоимость часа',
    kpis: ['Точность (Precision)', 'Время на поиск ответа', 'Снижение нагрузки на саппорт'],
    risks: ['Галлюцинации модели при нехватке данных', 'Устаревшие регламенты в базе'],
    limitations: 'Бесполезен, если знания не оцифрованы или постоянно меняются.',
    maintenanceCost: 'Хостинг векторной БД + API LLM'
  },
  { 
    code: 'S03', 
    name: 'Внутренний чат-бот для сотрудников', 
    type: 'Бот', 
    aiRole: 'помощник сотрудника',
    description: 'Автоматизация ответов на частые вопросы к HR/IT', 
    complexity: 2, 
    durationWeeks: 4, 
    budgetRange: 'от 450 000 ₽', 
    efficiencyCoeff: 0.5,
    dependencies: ['S01'],
    whatIsIt: 'Сценарный бот в Telegram или корпоративном мессенджере, который закрывает 80% входящих тикетов по типовым запросам: справки, отпуска, пароли.',
    howItWorks: [
      'Анализ логов обращений и выделение топа тем',
      'Написание графа диалогов',
      'Интеграция с 1С/Jira для автоматизации действий',
      'Запуск и обучение на реальных диалогах'
    ],
    processes: ['HR-администрирование', 'ИТ-саппорт', 'АХО', 'Бухгалтерия'],
    symptoms: [
      'Однотипные вопросы "где взять справку"',
      'Высокая доля рутинных заявок у HR/IT',
      'Сотрудники долго ждут ответа на простые просьбы'
    ],
    triggerQuestions: [
      { question: 'Доля рутинных заявок', condition: '> 50%' },
      { question: 'Частота типовых вопросов', condition: 'высокая' }
    ],
    requirements: ['Мессенджер', 'Интеграционный слой (API)', 'Сценарии ответов'],
    implementationStages: [
      { stage: 'Проектирование', duration: '1 нед', result: 'Граф диалогов', participants: 'HR/IT Lead' },
      { stage: 'Разработка', duration: '2 нед', result: 'Готовый бот', participants: 'Dev' },
      { stage: 'Пилот', duration: '1 нед', result: '30% автоматизации', participants: 'Фокус-группа' }
    ],
    effectCalculation: 'Количество закрытых тикетов без участия человека * стоимость тикета',
    kpis: ['Deflection Rate', 'User Satisfaction (CSAT)', 'Время закрытия вопроса'],
    risks: ['Сложный интерфейс бота', 'Отсутствие API в учетных системах'],
    limitations: 'Плохо справляется с нестандартными и эмоциональными запросами.',
    maintenanceCost: 'Платформа чат-ботов + техподдержка'
  },
  { 
    code: 'S04', 
    name: 'Клиентский чат-бот на сайте', 
    type: 'Бот', 
    aiRole: 'исполнитель',
    description: 'Первая линия поддержки и квалификация лидов', 
    complexity: 3, 
    durationWeeks: 6, 
    budgetRange: 'от 900 000 ₽', 
    efficiencyCoeff: 0.5,
    dependencies: ['S01'],
    whatIsIt: 'AI-ассистент на фронте, который помогает клиенту выбрать товар, отвечает на вопросы по условиям и собирает контакты для отдела продаж.',
    howItWorks: [
      'Парсинг каталога и цен',
      'Обучение модели на скриптах лучших продавцов',
      'Интеграция с CRM',
      'Настройка логики передачи диалога человеку'
    ],
    processes: ['Продажи', 'Поддержка клиентов', 'Прием заказов'],
    symptoms: [
      'Низкая конверсия из посетителя в лид ночью',
      'Менеджеры тратят время на "холодных" клиентов',
      'Долгое время ожидания в чате'
    ],
    triggerQuestions: [
      { question: 'Время ответа клиенту', condition: '> 10 мин' },
      { question: 'Доля неквалифицированных лидов', condition: '> 40%' }
    ],
    requirements: ['Сайт', 'CRM', 'API мессенджеров'],
    implementationStages: [
      { stage: 'База знаний продукта', duration: '2 нед', result: 'Структура ответов', participants: 'Маркетинг, Продажи' },
      { stage: 'Интеграция CRM', duration: '2 нед', result: 'Автосоздание сделок', participants: 'Dev' },
      { stage: 'A/B тест', duration: '2 нед', result: 'Рост конверсии', participants: 'Аналитик' }
    ],
    effectCalculation: 'Дополнительные лиды в нерабочее время + экономия времени менеджеров',
    kpis: ['Conversion Rate', 'Lead Quality Score', 'Cost per Lead'],
    risks: ['Некорректные обещания клиенту (скидки/сроки)', 'Негатив от "робота"'],
    limitations: 'Требует постоянного контроля качества диалогов.',
    maintenanceCost: 'API моделей + CRM коннекторы'
  },
  { 
    code: 'S05', 
    name: 'AI-телефония и голосовые ассистенты', 
    type: 'Голос', 
    aiRole: 'исполнитель',
    description: 'Обработка входящих и исходящих звонков без оператора', 
    complexity: 4, 
    durationWeeks: 8, 
    budgetRange: 'от 900 000 ₽', 
    efficiencyCoeff: 0.6,
    dependencies: ['S01'],
    whatIsIt: 'Голосовой бот, который разговаривает как человек, понимает намерения и может совершать действия в CRM прямо во время звонка.',
    howItWorks: ['Интеграция с IP-телефонией', 'STT и TTS движки', 'NLU модуль для логики'],
    processes: ['Холодные звонки', 'Подтверждение записи', 'Опросы качества', 'Первая линия'],
    symptoms: ['Высокая стоимость минуты оператора', 'Пропущенные звонки в пики', 'Выгорание людей на обзвонах'],
    triggerQuestions: [{ question: 'Объем звонков', condition: '> 1000/мес' }],
    requirements: ['SIP-транк', 'Сценарии разговоров'],
    implementationStages: [{ stage: 'Синтез голоса', duration: '2 нед', result: 'Брендовый голос', participants: 'Бренд' }],
    effectCalculation: 'Стоимость звонка роботом vs человеком',
    kpis: ['FCR (First Call Resolution)', 'Cost per Minute'],
    risks: ['Раздражение клиентов от робота'],
    limitations: 'Сложно на плохой связи.',
    maintenanceCost: 'Минуты STT/TTS + поддержка'
  },
  { 
    code: 'S06', 
    name: 'Интеллектуальное OCR и документооборот', 
    type: 'Обработка', 
    aiRole: 'исполнитель',
    description: 'Распознавание и занесение данных из сканов/фото', 
    complexity: 4, 
    durationWeeks: 8, 
    budgetRange: 'от 900 000 ₽', 
    efficiencyCoeff: 0.7,
    dependencies: ['S01'],
    whatIsIt: 'Интеллектуальное OCR решение, которое не просто видит текст, а понимает структуру документа: находит ИНН, суммы, даты и разносит их в нужные поля 1С или ERP.',
    howItWorks: [
      'Классификация типа документа (счет, акт, накладная)',
      'Распознавание текста через Vision-модели',
      'Валидация данных по мастер-справочникам',
      'Экспорт в учетную систему через API'
    ],
    processes: ['Бухгалтерия', 'Закупки', 'Логистика', 'Канцелярия'],
    symptoms: [
      'Сотрудники вручную переносят данные из сканов в систему',
      'Ошибки в реквизитах и суммах при ручном вводе',
      'Завалы документов в конце отчетного периода'
    ],
    triggerQuestions: [
      { question: 'Доля ручного ввода', condition: '> 50%' },
      { question: 'Формат данных', condition: 'бумага/скан' }
    ],
    requirements: ['Потоковый сканер', 'GPU сервер или API облачного OCR', 'Интеграция with 1C/SAP'],
    implementationStages: [
      { stage: 'Разметка форм', duration: '2 нед', result: 'Шаблоны распознавания', participants: 'Бухгалтерия' },
      { stage: 'Настройка пайплайна', duration: '4 нед', result: 'Автозагрузка в ERP', participants: 'Dev' },
      { stage: 'Стабилизация', duration: '2 нед', result: 'Точность > 98%', participants: 'QA' }
    ],
    effectCalculation: 'Время на ручной ввод * объем документов * ставка',
    kpis: ['Field Accuracy', 'Automation Rate (Straight-through)', 'Cost per Page'],
    risks: ['Низкое качество исходных сканов', 'Нестандартные формы поставщиков'],
    limitations: 'Зависит от качества печати и рукописного текста.',
    maintenanceCost: 'Поддержка шаблонов + API'
  },
  { 
    code: 'S07', 
    name: 'AI-генерация отчетов и аналитики', 
    type: 'Аналитика', 
    aiRole: 'помощник сотрудника',
    description: 'Автоматическая сборка выводов из разных систем', 
    complexity: 3, 
    durationWeeks: 5, 
    budgetRange: 'от 450 000 ₽', 
    efficiencyCoeff: 0.4,
    dependencies: ['S01'],
    whatIsIt: 'Система, которая подключается к БД или Excel, анализирует тренды и пишет текстовый комментарий: почему упали продажи или где выросли расходы.',
    howItWorks: ['ETL процессы', 'Промпт-инжиниринг аналитических отчетов'],
    processes: ['Управленческий учет', 'Маркетинговый анализ'],
    symptoms: ['Ручная сборка Excel из 5 систем', 'Руководители не понимают причины цифр'],
    triggerQuestions: [{ question: 'Ручная сборка отчетов', condition: 'да' }],
    requirements: ['Доступ к БД', 'Очищенные данные'],
    implementationStages: [{ stage: 'Визуализация', duration: '2 нед', result: 'Дашборд', participants: 'BI' }],
    effectCalculation: 'Время аналитиков на подготовку слайдов',
    kpis: ['Time to Insight', 'Usage rate'],
    risks: ['Неверные выводы при грязных данных'],
    limitations: 'Требует структурированных данных.',
    maintenanceCost: 'Поддержка коннекторов'
  },
  { 
    code: 'S08', 
    name: 'AI-ассистент для написания контента', 
    type: 'Ассистент', 
    aiRole: 'помощник сотрудника',
    description: 'Ускорение подготовки текстов, писем и презентаций', 
    complexity: 2, 
    durationWeeks: 3, 
    budgetRange: 'от 450 000 ₽', 
    efficiencyCoeff: 0.5,
    dependencies: ['S01'],
    whatIsIt: 'Плагин или веб-сервис с набором промптов под стилистику компании для генерации текстов любого формата.',
    howItWorks: ['Библиотека промптов', 'Fine-tuning на стиле компании'],
    processes: ['Маркетинг', 'PR', 'Продажи (письма)', 'Клиентский сервис'],
    symptoms: ['Долгое согласование текстов', 'Однообразный контент', 'Трудности с переводом'],
    triggerQuestions: [{ question: 'Задачи на тексты', condition: 'высокий объем' }],
    requirements: ['Tone of Voice компании'],
    implementationStages: [{ stage: 'Обучение', duration: '1 нед', result: 'Гайдбук', participants: 'Маркетинг' }],
    effectCalculation: 'Объем контента / Время подготовки',
    kpis: ['Content Velocity', 'Engagement rate'],
    risks: ['Потеря уникального стиля'],
    limitations: 'Нужен человек для финальной проверки.',
    maintenanceCost: 'API LLM'
  },
  { 
    code: 'S09', 
    name: 'No-code интеграции и AI-агенты', 
    type: 'Агент', 
    aiRole: 'исполнитель',
    description: 'Автоматизация связей между системами без программирования', 
    complexity: 2, 
    durationWeeks: 4, 
    budgetRange: 'от 900 000 ₽', 
    efficiencyCoeff: 0.6,
    dependencies: ['S01'],
    whatIsIt: 'Использование инструментов типа Make/n8n в связке с AI для автоматической передачи данных и принятия решений между CRM, почтой и трекером.',
    howItWorks: ['Настройка вебхуков', 'AI-фильтры для маршрутизации'],
    processes: ['Обработка заказов', 'Маршрутизация заявок'],
    symptoms: ['Двойной ввод данных', 'Ручная передача задач между отделами'],
    triggerQuestions: [{ question: 'Наличие API', condition: 'да' }],
    requirements: ['Доступы к API систем'],
    implementationStages: [{ stage: 'Маппинг', duration: '1 нед', result: 'Логическая схема', participants: 'Архитектор' }],
    effectCalculation: 'Снижение ошибок ручной передачи',
    kpis: ['Lead speed', 'Error rate'],
    risks: ['Хрупкость связей при обновлении ПО'],
    limitations: 'Только для систем с открытым API.',
    maintenanceCost: 'Подписка на iPaaS'
  },
  { 
    code: 'S10', 
    name: 'RPA + AI Автоматизация', 
    type: 'Робот', 
    aiRole: 'исполнитель',
    description: 'Роботизация действий в интерфейсах старых систем', 
    complexity: 4, 
    durationWeeks: 10, 
    budgetRange: 'от 900 000 ₽', 
    efficiencyCoeff: 0.8,
    dependencies: ['S01'],
    whatIsIt: 'Программные роботы, которые имитируют клики человека в SAP/1C и используют AI для принятия решений там, где простая логика не справляется.',
    howItWorks: ['Запись действий пользователя', 'AI-модели для распознавания элементов'],
    processes: ['Бухгалтерские сверки', 'Ввод данных из Excel в ERP'],
    symptoms: ['Системы без API', 'Огромный объем механической работы'],
    triggerQuestions: [{ question: 'Системы без API', condition: 'да' }],
    requirements: ['Выделенный ПК/сервер'],
    implementationStages: [{ stage: 'Тренажер', duration: '2 нед', result: 'Лог действий', participants: 'Сотрудник' }],
    effectCalculation: 'FTE (количество высвобожденных ставок)',
    kpis: ['FTE saved', 'Straight-through rate'],
    risks: ['Изменение UI системы ломает робота'],
    limitations: 'Дорого в поддержке.',
    maintenanceCost: 'Лицензии RPA + поддержка'
  },
  { 
    code: 'S11', 
    name: 'AI-поиск по файловым серверам', 
    type: 'Поиск', 
    aiRole: 'помощник сотрудника',
    description: 'Нахождение документов по смыслу на сетевых дисках', 
    complexity: 3, 
    durationWeeks: 6, 
    budgetRange: 'от 450 000 ₽', 
    efficiencyCoeff: 0.3,
    dependencies: ['S01', 'S02'],
    whatIsIt: 'Инструмент, который индексирует "мусорки" на дисках и позволяет найти нужный договор или чертеж, даже если он назван некорректно.',
    howItWorks: ['Эмбеддинги для всех файлов', 'Semantic search'],
    processes: ['Архив', 'Конструкторское бюро', 'Продажи'],
    symptoms: ['Хаос в папках', 'Сотрудники плодят дубли файлов'],
    triggerQuestions: [{ question: 'Потеря документов', condition: 'часто' }],
    requirements: ['Доступ к файловой системе'],
    implementationStages: [{ stage: 'Сканирование', duration: '2 нед', result: 'Индекс', participants: 'ИТ' }],
    effectCalculation: 'Время сотрудников на поиск',
    kpis: ['Search Success Rate', 'Time to document'],
    risks: ['Доступы к секретным файлам'],
    limitations: 'Нужны современные форматы (не сканы без OCR).',
    maintenanceCost: 'Хостинг индекса'
  },
  { 
    code: 'S12', 
    name: 'AI-скрининг и подбор резюме', 
    type: 'HR', 
    aiRole: 'контролёр',
    description: 'Автоматический отбор кандидатов по профилю должности', 
    complexity: 3, 
    durationWeeks: 5, 
    budgetRange: 'от 700 000 ₽', 
    efficiencyCoeff: 0.6,
    dependencies: ['S01'],
    whatIsIt: 'Модель, которая анализирует поток резюме, сравнивает их с требованиями и выставляет оценку соответствия, экономя время рекрутера на просмотре сотен нецелевых откликов.',
    howItWorks: ['Matching резюме и вакансии'],
    processes: ['Массовый найм', 'IT-рекрутинг'],
    symptoms: ['100+ откликов на вакансию', 'Рекрутер не успевает всех просмотреть'],
    triggerQuestions: [{ question: 'Объем найма', condition: 'высокий' }],
    requirements: ['Интеграция с HH/Avito'],
    implementationStages: [{ stage: 'Калибровка', duration: '2 нед', result: 'Обученная модель', participants: 'HR' }],
    effectCalculation: 'Время на первичный скрининг резюме',
    kpis: ['Conversion to Interview', 'Cost per Hire'],
    risks: ['Упущение талантов из-за формального подхода'],
    limitations: 'Плохо для уникальных топ-позиций.',
    maintenanceCost: 'API'
  },
  { 
    code: 'S13', 
    name: 'Компьютерное зрение для контроля', 
    type: 'Зрение', 
    aiRole: 'контролёр',
    description: 'Контроль СИЗ, брака или присутствия через камеры', 
    complexity: 5, 
    durationWeeks: 12, 
    budgetRange: 'от 700 000 ₽', 
    efficiencyCoeff: 0.9,
    dependencies: ['S01'],
    whatIsIt: 'Анализ видеопотока с камер в реальном времени для фиксации нарушений техники безопасности или дефектов на линии.',
    howItWorks: ['Object Detection', 'Anomaly Detection'],
    processes: ['Безопасность', 'Производственный контроль'],
    symptoms: ['Нарушения ТБ', 'Брак уходит клиенту'],
    triggerQuestions: [{ question: 'Риск травматизма', condition: 'да' }],
    requirements: ['Камеры 4K', 'GPU сервера'],
    implementationStages: [{ stage: 'Обучение нейросети', duration: '6 нед', result: 'Модель', participants: 'Data Scientist' }],
    effectCalculation: 'Снижение штрафов и брака',
    kpis: ['Recall/Precision', 'Alert count'],
    risks: ['Засветы, пыль на камерах'],
    limitations: 'Требует очень мощного железа.',
    maintenanceCost: 'Поддержка камер + сервера'
  },
  { 
    code: 'S14', 
    name: 'AI-прогнозирование спроса и остатков', 
    type: 'Аналитика', 
    aiRole: 'контролёр',
    description: 'Точные прогнозы закупок на основе исторических данных', 
    complexity: 4, 
    durationWeeks: 10, 
    budgetRange: 'от 700 000 ₽', 
    efficiencyCoeff: 0.5,
    dependencies: ['S01'],
    whatIsIt: 'Математическая модель, учитывающая сезонность, акции и внешние факторы для выдачи рекомендаций по закупкам.',
    howItWorks: ['Time Series Analysis', 'XGBoost/LightGBM'],
    processes: ['Снабжение', 'Планирование продаж'],
    symptoms: ['Затоваривание склада', 'Out-of-stock (нет товара)'],
    triggerQuestions: [{ question: 'Оборачиваемость', condition: 'низкая' }],
    requirements: ['3 года истории продаж'],
    implementationStages: [{ stage: 'Тест на истории', duration: '4 нед', result: 'Метрики точности', participants: 'Аналитик' }],
    effectCalculation: 'Высвобождение оборотного капитала',
    kpis: ['MAPE (процент ошибки)', 'Inventory turn'],
    risks: ['Черные лебеди (резкие скачки рынка)'],
    limitations: 'Нужны чистые данные за долгий срок.',
    maintenanceCost: 'Переобучение модели'
  },
  { 
    code: 'S15', 
    name: 'Транскрибация и разбор встреч', 
    type: 'Обработка', 
    aiRole: 'помощник сотрудника',
    description: 'Minutes of meeting и саммари из аудио/видео', 
    complexity: 2, 
    durationWeeks: 3, 
    budgetRange: 'от 450 000 ₽', 
    efficiencyCoeff: 0.6,
    dependencies: ['S01'],
    whatIsIt: 'Сервис, который записывает совещания, превращает речь в текст и выделяет ключевые договоренности, поручения и сроки в виде готового протокола.',
    howItWorks: [
      'Запись звука (через бот-участник или микрофон)',
      'Speech-to-Text (STT) обработка',
      'Diarization (разделение спикеров)',
      'LLM-саммари по структуре: Тема, Тезисы, Решения, Задачи'
    ],
    processes: ['Управление', 'Проектный офис', 'Продажи (созвоны)'],
    symptoms: [
      'Поручения со встреч теряются или забываются',
      'Протоколы пишутся долго или не пишутся вовсе',
      'Нужно переслушивать записи встреч для поиска деталей'
    ],
    triggerQuestions: [
      { question: 'Ведение протоколов', condition: 'редко/никогда' },
      { question: 'Время на совещания', condition: '> 10ч в неделю' }
    ],
    requirements: ['Корпоративный Zoom/Teams/Meet', 'STT модель (Whisper)', 'LLM для суммаризации'],
    implementationStages: [
      { stage: 'Выбор STT стека', duration: '1 нед', result: 'Тестовая расшифровка', participants: 'ИТ' },
      { stage: 'Шаблоны протоколов', duration: '1 нед', result: 'Промпты для LLM', participants: 'PMO' },
      { stage: 'Интеграция с таск-трекером', duration: '1 нед', result: 'Автосоздание задач', participants: 'Dev' }
    ],
    effectCalculation: 'Экономия времени на написание протоколов + снижение потерь от забытых задач',
    kpis: ['Время выпуска протокола', 'Процент выполненных вовремя задач', 'Word Error Rate (WER)'],
    risks: ['Плохое качество звука в переговорках', 'Конфиденциальность обсуждений'],
    limitations: 'Не заменяет живого модератора встречи.',
    maintenanceCost: 'API STT/LLM + подписка на сервис'
  },
  { 
    code: 'S16', 
    name: 'AI-кодинг и автоматизация ИТ', 
    type: 'ИТ', 
    aiRole: 'помощник сотрудника',
    description: 'Ускорение разработки через AI-ассистентов (Copilot)', 
    complexity: 1, 
    durationWeeks: 2, 
    budgetRange: 'от 450 000 ₽', 
    efficiencyCoeff: 0.3,
    dependencies: ['S01'],
    whatIsIt: 'Внедрение инструментов автодополнения кода и написания тестов для штатных разработчиков.',
    howItWorks: ['Установка расширений IDE', 'Настройка доступов'],
    processes: ['Разработка ПО', 'Тестирование'],
    symptoms: ['Долгий Time-to-Market', 'Дефицит разработчиков'],
    triggerQuestions: [{ question: 'Штатная разработка', condition: 'есть' }],
    requirements: ['GitHub Copilot/Cursor/GigaCode'],
    implementationStages: [{ stage: 'Внедрение', duration: '1 нед', result: 'Лицензии', participants: 'ИТ' }],
    effectCalculation: 'Увеличение скорости закрытия тикетов',
    kpis: ['Velocity', 'Bug count'],
    risks: ['Безопасность кода'],
    limitations: 'Только для профессиональных разработчиков.',
    maintenanceCost: 'Подписки'
  }
];

// Синхронизация с хранилищем (localStorage)
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('aiaudit:solutions');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        parsed.forEach((s: AISolution) => {
          const idx = AI_SOLUTIONS.findIndex(item => item.code === s.code);
          if (idx !== -1) {
            Object.assign(AI_SOLUTIONS[idx], s);
          }
        });
      }
    }
  }
} catch (e) {
  console.error('Error loading AI_SOLUTIONS from storage', e);
}

/**
 * Сохраняет изменения решения в единый каталог решений AI_SOLUTIONS и в localStorage.
 * Изменения сразу применяются везде в приложении без дубликатов.
 */
export function saveSolution(solution: AISolution): void {
  const idx = AI_SOLUTIONS.findIndex(s => s.code === solution.code);
  if (idx !== -1) {
    Object.assign(AI_SOLUTIONS[idx], solution);
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('aiaudit:solutions', JSON.stringify(AI_SOLUTIONS));
      try {
        const evt = typeof CustomEvent === 'function' 
          ? new CustomEvent('aiaudit:solutions_updated', { detail: solution })
          : new Event('aiaudit:solutions_updated');
        window.dispatchEvent(evt);
      } catch (evtErr) {
        // Fallback for environments where CustomEvent constructor is restricted
      }
    }
  } catch (e) {
    console.error('Error saving solution', e);
  }
}
