import { Client, Audit, DocRecord, FinanceRecord, CriterionScore, Economics } from './types';

const defaultScores: CriterionScore[] = [
  { criterion: 'Острота проблемы', category: 'Рынок', weight: 12, score: 8, rationale: 'Проблема подтверждена интервью.' },
  { criterion: 'Размер рынка', category: 'Рынок', weight: 12, score: 7, rationale: 'Рынок достаточен для роста.' },
  { criterion: 'Юнит-экономика', category: 'Экономика', weight: 15, score: 9, rationale: 'Высокая маржинальность.' },
];

const defaultEconomics: Economics = {
  avgCheck: 350000,
  clientsYearOne: 10,
  unitCost: 50000,
  fixedCostsMonth: 100000,
  startupBudget: 1000000,
  revenue: 3500000,
  grossProfit: 3000000,
  annualProfit: 1800000,
  margin: 85,
  breakEvenClients: 4,
  paybackMonths: 7,
  scenarios: [
    { name: 'Консервативный', revenue: 2975000, profit: 1475000 },
    { name: 'Базовый', revenue: 3500000, profit: 1800000 },
    { name: 'Оптимистичный', revenue: 5775000, profit: 3875000 },
  ]
};

export const DEMO_CLIENTS: Client[] = [
  {
    id: 'c1', name: 'ООО «Севзаппромстрой»', inn: '7801234567', industry: 'Строительство',
    size: '850 сотрудников', revenue: 2400000000, region: 'Санкт-Петербург', website: 'szps.ru',
    contactName: 'Иванов Иван Иванович', contactRole: 'Директор производства', contactPhone: '+7 (812) 555-01-23', contactEmail: 'i.ivanov@szps.ru',
    decisionMaker: 'Собственник', leadSource: 'рекомендация', status: 'клиент',
    manager: 'Александр Аналитик', notes: 'Крупный застройщик в СЗФО.', createdAt: '2026-03-15T10:00:00Z', updatedAt: '2026-09-01T14:30:00Z', isDemo: true
  },
  {
    id: 'c2', name: 'АО «Логитранс Групп»', inn: '7701987654', industry: 'Логистика',
    size: '1 200 сотрудников', revenue: 4100000000, region: 'Москва', website: 'logitrans.ru',
    contactName: 'Петров Петр Петрович', contactRole: 'COO', contactPhone: '+7 (495) 123-45-67', contactEmail: 'p.petrov@logitrans.ru',
    decisionMaker: 'CEO', leadSource: 'партнёр', status: 'клиент',
    manager: 'Александр Аналитик', notes: 'Федеральная логистическая компания.', createdAt: '2026-04-10T09:00:00Z', updatedAt: '2026-08-25T11:00:00Z', isDemo: true
  },
  {
    id: 'c3', name: 'ООО «Уралмашдеталь»', inn: '6601234567', industry: 'Производство',
    size: '480 сотрудников', revenue: 1300000000, region: 'Екатеринбург', website: 'uralmash.ru',
    contactName: 'Сидоров Сергей Сергеевич', contactRole: 'Собственник', contactPhone: '+7 (343) 987-65-43', contactEmail: 's.sidorov@uralmash.ru',
    decisionMaker: 'Собственник', leadSource: 'холодный контакт', status: 'переговоры',
    manager: 'Александр Аналитик', notes: 'Завод металлоконструкций.', createdAt: '2026-05-20T12:00:00Z', updatedAt: '2026-09-05T16:00:00Z', isDemo: true
  },
  {
    id: 'c4', name: 'Сеть «Продукт Плюс»', inn: '5401234567', industry: 'Ритейл',
    size: '2 100 сотрудников', revenue: 6800000000, region: 'Новосибирск', website: 'productplus.ru',
    contactName: 'Кузнецова Анна Павловна', contactRole: 'CFO', contactPhone: '+7 (383) 555-00-11', contactEmail: 'a.kuznetsova@pplus.ru',
    decisionMaker: 'CEO', leadSource: 'мероприятие', status: 'предложение',
    manager: 'Александр Аналитик', notes: 'Региональная продуктовая сеть.', createdAt: '2026-06-05T14:00:00Z', updatedAt: '2026-09-02T10:00:00Z', isDemo: true
  },
  {
    id: 'c5', name: 'ООО «Гранд Отель Менеджмент»', inn: '2301234567', industry: 'HoReCa',
    size: '340 сотрудников', revenue: 780000000, region: 'Сочи', website: 'grandhotel.ru',
    contactName: 'Васильев Олег Игоревич', contactRole: 'CEO', contactPhone: '+7 (862) 222-33-44', contactEmail: 'o.vasiliev@grandhotel.ru',
    decisionMaker: 'CEO', leadSource: 'входящая заявка', status: 'диагностика',
    manager: 'Александр Аналитик', notes: 'Управляющая компания отелей.', createdAt: '2026-07-12T11:00:00Z', updatedAt: '2026-09-04T09:00:00Z', isDemo: true
  },
  {
    id: 'c6', name: 'ООО «ТехСервис Эксплуатация»', inn: '1601234567', industry: 'Эксплуатация',
    size: '620 сотрудников', revenue: 950000000, region: 'Казань', website: 'techserv.ru',
    contactName: 'Федоров Игорь Петрович', contactRole: 'COO', contactPhone: '+7 (843) 444-55-66', contactEmail: 'i.fedorov@techserv.ru',
    decisionMaker: 'COO', leadSource: 'реклама', status: 'диагностика',
    manager: 'Александр Аналитик', notes: 'Facility management.', createdAt: '2026-08-01T10:00:00Z', updatedAt: '2026-09-01T15:00:00Z', isDemo: true
  },
  {
    id: 'c7', name: 'ООО «Кадровый Ресурс»', inn: '7705432109', industry: 'HR',
    size: '95 сотрудников', revenue: 420000000, region: 'Москва', website: 'hr-res.ru',
    contactName: 'Морозова Елена Викторовна', contactRole: 'HRD', contactPhone: '+7 (495) 777-88-99', contactEmail: 'e.morozova@hr-res.ru',
    decisionMaker: 'HRD', leadSource: 'рекомендация', status: 'новый',
    manager: 'Александр Аналитик', notes: 'Кадровое агентство.', createdAt: '2026-08-15T09:00:00Z', updatedAt: '2026-09-06T12:00:00Z', isDemo: true
  },
  {
    id: 'c8', name: 'АО «Энергосбыт Регион»', inn: '3601234567', industry: 'Энергетика',
    size: '1 800 сотрудников', revenue: 5200000000, region: 'Воронеж', website: 'energosbyt.ru',
    contactName: 'Павлов Виктор Михайлович', contactRole: 'CIO', contactPhone: '+7 (473) 333-22-11', contactEmail: 'v.pavlov@energosbyt.ru',
    decisionMaker: 'CIO', leadSource: 'холодный контакт', status: 'отказ',
    manager: 'Александр Аналитик', notes: 'Энергосбытовая компания.', createdAt: '2026-05-10T11:00:00Z', updatedAt: '2026-07-20T14:00:00Z', isDemo: true
  }
];

export const DEMO_AUDITS: Audit[] = [
  {
    id: 'a1', number: 'AU-001', clientId: 'c1', projectName: 'AI-ассистент инженера ПТО',
    type: 'AI-аудит компании', status: 'оплачен', totalScore: 84, verdict: 'Готов к запуску',
    scores: defaultScores, economics: defaultEconomics, summary: 'Проект по внедрению AI-ассистента для автоматизации проверки чертежей и смет.',
    strengths: ['Высокая зрелость процессов', 'Наличие качественных данных'],
    gaps: [{ gap: 'Отсутствие API в текущей ERP', impact: 'Сложность интеграции', fix: 'Разработка коннектора', priority: 'высокий' }],
    risks: [{ risk: 'Сопротивление персонала', probability: 'средняя', impact: 'высокий', mitigation: 'Программа обучения' }],
    amount: 350000, analyst: 'Александр Аналитик', createdAt: '2026-04-20T10:00:00Z', updatedAt: '2026-04-20T10:00:00Z', methodologyVersion: '1.0', isDemo: true,
    solutions: ['S01', 'S06', 'S07', 'S02'],
    companyData: {
      format: 'comprehensive',
      profile: {
        clientId: 'c1',
        name: 'ООО «Севзаппромстрой»',
        industry: 'Строительство',
        totalStaff: 850,
        avgHourlyRate: 950
      },
      departments: [
        {
          id: 'pto',
          name: 'Отдел ПТО',
          isEnabled: true,
          isDelegated: false,
          completion: 100,
          ai_used_now: 'используются неофициально',
          ai_personal_accounts: 'да',
          ai_corporate_access: 'нет',
          ai_policy: 'правил нет',
          ai_level: 'личные аккаунты, компания не знает',
          ai_data_leak: 'да регулярно',
          processes: [
            {
              id: 'p1',
              name: 'Проверка смет и спецификаций',
              executor: { role: 'Инженер ПТО', count: 5 },
              pr_role: 'Инженер ПТО',
              pr_people: 5,
              frequency: 'ежедневно',
              pr_frequency: 'ежедневно',
              timePerOperation: 45,
              pr_minutes: 45,
              operationsPerMonth: 320,
              pr_ops_month: 320,
              manualWorkShare: 80,
              pr_manual_share: 80,
              inputDataFormat: ['скан или фото'],
              pr_input_format: ['скан или фото'],
              pr_losses: ['loss_manual_reports']
            }
          ]
        }
      ]
    }
  },
  {
    id: 'a2', number: 'AU-002', clientId: 'c1', projectName: 'Автоматизация исполнительной документации',
    type: 'AI-аудит компании', status: 'завершён', totalScore: 78, verdict: 'Требует доработки перед стартом',
    scores: defaultScores, economics: defaultEconomics, summary: 'Автоматизация формирования актов КС-2 и КС-3.',
    strengths: ['Понятный экономический эффект'],
    gaps: [{ gap: 'Неполные данные за прошлые периоды', impact: 'Низкая точность модели', fix: 'Сбор данных вручную', priority: 'средний' }],
    risks: [{ risk: 'Изменение законодательства', probability: 'низкая', impact: 'высокий', mitigation: 'Мониторинг обновлений' }],
    amount: 250000, analyst: 'Александр Аналитик', createdAt: '2026-05-15T11:00:00Z', updatedAt: '2026-05-15T11:00:00Z', methodologyVersion: '1.0', isDemo: true,
    solutions: ['S06', 'S09', 'S07'],
    companyData: {
      format: 'comprehensive',
      profile: {
        clientId: 'c1',
        name: 'ООО «Севзаппромстрой»',
        industry: 'Строительство',
        totalStaff: 850,
        avgHourlyRate: 950
      },
      departments: [
        {
          id: 'acc',
          name: 'Бухгалтерия и документооборот',
          isEnabled: true,
          isDelegated: false,
          completion: 100,
          ai_used_now: 'не используются',
          ai_personal_accounts: 'нет',
          ai_corporate_access: 'нет',
          ai_policy: 'правил нет',
          ai_level: 'не используется',
          processes: [
            {
              id: 'p2',
              name: 'Сверка актов КС-2/КС-3',
              executor: { role: 'Бухгалтер по учёту', count: 4 },
              pr_role: 'Бухгалтер по учёту',
              pr_people: 4,
              frequency: 'несколько раз в день',
              pr_frequency: 'несколько раз в день',
              timePerOperation: 35,
              pr_minutes: 35,
              operationsPerMonth: 450,
              pr_ops_month: 450,
              manualWorkShare: 75,
              pr_manual_share: 75,
              inputDataFormat: ['бумага'],
              pr_input_format: ['бумага']
            }
          ]
        }
      ]
    }
  },
  {
    id: 'a3', number: 'AU-003', clientId: 'c2', projectName: 'AI-агент диспетчера-логиста',
    type: 'AI-аудит компании', status: 'оплачен', totalScore: 81, verdict: 'Готов к запуску',
    scores: defaultScores, economics: defaultEconomics, summary: 'Интеллектуальная маршрутизация и обработка отклонений в реальном времени.',
    strengths: ['Реальное время обработки', 'Интеграция с GPS'],
    gaps: [], risks: [], amount: 350000, analyst: 'Александр Аналитик', createdAt: '2026-06-01T10:00:00Z', updatedAt: '2026-06-01T10:00:00Z', methodologyVersion: '1.0', isDemo: true,
    solutions: ['S04', 'S09', 'S02'],
    companyData: {
      format: 'comprehensive',
      profile: {
        clientId: 'c2',
        name: 'АО «Логитранс Групп»',
        industry: 'Логистика',
        totalStaff: 1200,
        avgHourlyRate: 850
      },
      departments: [
        {
          id: 'log',
          name: 'Отдел диспетчеризации перевозок',
          isEnabled: true,
          isDelegated: false,
          completion: 100,
          ai_used_now: 'экспериментируем',
          ai_personal_accounts: 'нет',
          ai_corporate_access: 'у отдельных сотрудников',
          ai_policy: 'правил нет',
          ai_level: 'корпоративный доступ без регламентов',
          processes: [
            {
              id: 'p3',
              name: 'Обработка входящих заявок на перевозку',
              executor: { role: 'Диспетчер-логист', count: 8 },
              pr_role: 'Диспетчер-логист',
              pr_people: 8,
              frequency: 'несколько раз в день',
              pr_frequency: 'несколько раз в день',
              timePerOperation: 15,
              pr_minutes: 15,
              operationsPerMonth: 1200,
              pr_ops_month: 1200,
              manualWorkShare: 65,
              pr_manual_share: 65,
              pr_losses: ['loss_search']
            }
          ]
        }
      ]
    }
  },
  {
    id: 'a4', number: 'AU-004', clientId: 'c2', projectName: 'Корпоративный SaaS-контур',
    type: 'Экспресс-диагностика', status: 'согласован', totalScore: 72, verdict: 'Требует доработки перед стартом',
    scores: defaultScores, economics: defaultEconomics, summary: 'Анализ готовности ИТ-инфраструктуры к внедрению облачных AI-сервисов.',
    strengths: [], gaps: [], risks: [], amount: 50000, analyst: 'Александр Аналитик', createdAt: '2026-07-10T12:00:00Z', updatedAt: '2026-07-10T12:00:00Z', methodologyVersion: '1.0', isDemo: true,
    solutions: ['S02', 'S03', 'S01'],
    companyData: {
      format: 'comprehensive',
      profile: {
        clientId: 'c2',
        name: 'АО «Логитранс Групп»',
        industry: 'Логистика',
        totalStaff: 1200,
        avgHourlyRate: 850
      },
      departments: [
        {
          id: 'it',
          name: 'ИТ и корпоративная поддержка',
          isEnabled: true,
          isDelegated: false,
          completion: 100,
          ai_used_now: 'используются регулярно',
          ai_personal_accounts: 'нет',
          ai_corporate_access: 'у подразделения',
          ai_policy: 'устные договорённости',
          ai_level: 'корпоративный доступ с регламентами',
          processes: [
            {
              id: 'p4',
              name: 'Консультации по регламентам и ПО',
              executor: { role: 'Специалист техподдержки', count: 6 },
              pr_role: 'Специалист техподдержки',
              pr_people: 6,
              frequency: 'несколько раз в день',
              pr_frequency: 'несколько раз в день',
              timePerOperation: 20,
              pr_minutes: 20,
              operationsPerMonth: 800,
              pr_ops_month: 800,
              manualWorkShare: 55,
              pr_manual_share: 55,
              pr_losses: ['loss_repeat_questions'],
              sys_knowledge_base: 'есть в электронном виде'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'a5', number: 'AU-005', clientId: 'c3', projectName: 'Контроль качества и разбор брака',
    type: 'AI-аудит компании', status: 'в работе', totalScore: 69, verdict: 'Требует доработки перед стартом',
    scores: defaultScores, economics: defaultEconomics, summary: 'Внедрение компьютерного зрения для дефектовки деталей.',
    strengths: [], gaps: [], risks: [], amount: 250000, analyst: 'Александр Аналитик', createdAt: '2026-08-20T14:00:00Z', updatedAt: '2026-08-20T14:00:00Z', methodologyVersion: '1.0', isDemo: true,
    wizardStep: 3,
    solutions: ['S13'],
    companyData: {
      format: 'comprehensive',
      profile: {
        clientId: 'c3',
        name: 'ООО «Уралмашдеталь»',
        industry: 'Производство',
        totalStaff: 480,
        avgHourlyRate: 900
      },
      departments: []
    }
  },
  {
    id: 'a6', number: 'AU-006', clientId: 'c4', projectName: 'Управление торговой точкой',
    type: 'AI-аудит компании', status: 'завершён', totalScore: 63, verdict: 'Модель сырая, нужна переработка',
    scores: defaultScores, economics: defaultEconomics, summary: 'Оптимизация графиков смен и товарных запасов.',
    strengths: [], gaps: [], risks: [], amount: 350000, analyst: 'Александр Аналитик', createdAt: '2026-07-05T09:00:00Z', updatedAt: '2026-07-05T09:00:00Z', methodologyVersion: '1.0', isDemo: true,
    solutions: ['S14', 'S09', 'S07'],
    companyData: {
      format: 'comprehensive',
      profile: {
        clientId: 'c4',
        name: 'Сеть «Продукт Плюс»',
        industry: 'Ритейл',
        totalStaff: 2100,
        avgHourlyRate: 700
      },
      departments: [
        {
          id: 'retail',
          name: 'Управление товарными запасами',
          isEnabled: true,
          isDelegated: false,
          completion: 100,
          ai_used_now: 'используются регулярно',
          ai_personal_accounts: 'нет',
          ai_corporate_access: 'у всей компании',
          ai_policy: 'письменный регламент',
          ai_integration: 'пробный запуск',
          ai_level: 'встроен в процессы',
          processes: [
            {
              id: 'p6',
              name: 'Расчёт заказов и прогнозирование поставок',
              executor: { role: 'Товаровед-аналитик', count: 12 },
              pr_role: 'Товаровед-аналитик',
              pr_people: 12,
              frequency: 'ежедневно',
              pr_frequency: 'ежедневно',
              timePerOperation: 50,
              pr_minutes: 50,
              operationsPerMonth: 600,
              pr_ops_month: 600,
              manualWorkShare: 70,
              pr_manual_share: 70,
              pr_losses: ['loss_manual_reports']
            }
          ]
        }
      ]
    }
  },
  {
    id: 'a7', number: 'AU-007', clientId: 'c5', projectName: 'Автоматизация смен и списаний',
    type: 'Экспресс-диагностика', status: 'завершён', totalScore: 58, verdict: 'Модель сырая, нужна переработка',
    scores: defaultScores, economics: defaultEconomics, summary: 'Диагностика процессов ресторанного комплекса.',
    strengths: [], gaps: [], risks: [], amount: 0, analyst: 'Александр Аналитик', createdAt: '2026-08-15T15:00:00Z', updatedAt: '2026-08-15T15:00:00Z', methodologyVersion: '1.0', isDemo: true
  },
  {
    id: 'a8', number: 'AU-008', clientId: 'c6', projectName: 'Заявки и подрядчики',
    type: 'Экспресс-диагностика', status: 'в работе', totalScore: 66, verdict: 'Требует доработки перед стартом',
    scores: defaultScores, economics: defaultEconomics, summary: 'Анализ процесса обработки заявок на facility-услуги.',
    strengths: [], gaps: [], risks: [], amount: 0, analyst: 'Александр Аналитик', createdAt: '2026-09-01T11:00:00Z', updatedAt: '2026-09-01T11:00:00Z', methodologyVersion: '1.0', isDemo: true,
    wizardStep: 4,
    solutions: ['S01', 'S04', 'S05'],
    companyData: {
      format: 'express',
      profile: {
        clientId: 'c6',
        name: 'ООО «ТехСервис Эксплуатация»',
        industry: 'Эксплуатация',
        totalStaff: 620,
        avgHourlyRate: 800
      },
      departments: [
        {
          id: 'disp',
          name: 'Диспетчерская служба и заявки',
          isEnabled: true,
          isDelegated: false,
          completion: 60,
          ai_used_now: 'используются неофициально',
          ai_personal_accounts: 'да',
          ai_corporate_access: 'нет',
          ai_policy: 'правил нет',
          ai_level: 'личные аккаунты, компания не знает',
          processes: [
            {
              id: 'p8',
              name: 'Приём и классификация аварийных заявок',
              executor: { role: 'Оператор диспетчерской', count: 6 },
              pr_role: 'Оператор диспетчерской',
              pr_people: 6,
              frequency: 'несколько раз в день',
              pr_frequency: 'несколько раз в день',
              timePerOperation: 10,
              pr_minutes: 10,
              operationsPerMonth: 1800,
              pr_ops_month: 1800,
              manualWorkShare: 85,
              pr_manual_share: 85
            }
          ]
        }
      ]
    }
  },
  {
    id: 'a9', number: 'AU-009', clientId: 'c7', projectName: 'Платформа подбора линейного персонала',
    type: 'Аудит бизнес-идеи', status: 'завершён', totalScore: 47, verdict: 'Высокий риск, запуск не рекомендован',
    scores: defaultScores,
    economics: {
      ...defaultEconomics,
      avgCheck: 5000,
      unitCost: 7000,
      revenue: 500000,
      annualProfit: -2000000,
      margin: -40,
    },
    summary: 'Юнит-экономика не сходится: стоимость привлечения и обработки кандидата выше среднего чека.',
    strengths: [], gaps: [], risks: [], amount: 250000, analyst: 'Александр Аналитик', createdAt: '2026-09-02T10:00:00Z', updatedAt: '2026-09-02T10:00:00Z', methodologyVersion: '1.0', isDemo: true
  },
  {
    id: 'a10', number: 'AU-010', clientId: 'c8', projectName: 'Обработка обращений абонентов',
    type: 'AI-аудит компании', status: 'завершён', totalScore: 41, verdict: 'Высокий риск, запуск не рекомендован',
    scores: [
      { criterion: 'Качество данных', category: 'Данные', weight: 15, score: 3, rationale: 'Данные зашумлены, исторические записи отсутствуют.' }
    ],
    economics: defaultEconomics, summary: 'Низкое качество данных не позволяет обучить модель с приемлемой точностью.',
    strengths: [], gaps: [], risks: [], amount: 250000, analyst: 'Александр Аналитик', createdAt: '2026-07-15T14:00:00Z', updatedAt: '2026-07-15T14:00:00Z', methodologyVersion: '1.0', isDemo: true
  },
  {
    id: 'a11', number: 'AU-011', clientId: 'c3', projectName: 'Планирование производства',
    type: 'Аудит бизнес-идеи', status: 'черновик', totalScore: 74, verdict: 'Требует доработки перед стартом',
    scores: defaultScores, economics: defaultEconomics, summary: 'Черновик аудита системы планирования для завода.',
    strengths: [], gaps: [], risks: [], amount: 0, analyst: 'Александр Аналитик', createdAt: '2026-09-05T12:00:00Z', updatedAt: '2026-09-05T12:00:00Z', methodologyVersion: '1.0', isDemo: true,
    wizardStep: 5,
    solutions: ['S13', 'S14', 'S07'],
    companyData: {
      format: 'comprehensive',
      profile: {
        clientId: 'c3',
        name: 'ООО «Уралмашдеталь»',
        industry: 'Производство',
        totalStaff: 480,
        avgHourlyRate: 900
      },
      departments: [
        {
          id: 'pdo',
          name: 'Производственно-диспетчерский отдел',
          isEnabled: true,
          isDelegated: false,
          completion: 100,
          ai_used_now: 'экспериментируем',
          ai_personal_accounts: 'нет',
          ai_corporate_access: 'у отдельных сотрудников',
          ai_policy: 'устные договорённости',
          ai_level: 'корпоративный доступ без регламентов',
          processes: [
            {
              id: 'p11',
              name: 'Диспетчеризация цеховых заказов',
              executor: { role: 'Диспетчер производства', count: 4 },
              pr_role: 'Диспетчер производства',
              pr_people: 4,
              frequency: 'ежедневно',
              pr_frequency: 'ежедневно',
              timePerOperation: 40,
              pr_minutes: 40,
              operationsPerMonth: 250,
              pr_ops_month: 250,
              manualWorkShare: 70,
              pr_manual_share: 70
            }
          ]
        }
      ]
    }
  },
  {
    id: 'a12', number: 'AU-012', clientId: 'c4', projectName: 'Прогноз остатков и списаний',
    type: 'AI-аудит компании', status: 'оплачен', totalScore: 88, verdict: 'Готов к запуску',
    scores: defaultScores, economics: defaultEconomics, summary: 'Образцовый проект с высоким потенциалом экономии за счет снижения списаний скоропорта.',
    strengths: ['Качественная Big Data', 'Прямая экономическая выгода'],
    gaps: [], risks: [], amount: 400000, analyst: 'Александр Аналитик', createdAt: '2026-09-04T10:00:00Z', updatedAt: '2026-09-04T10:00:00Z', methodologyVersion: '1.0', isDemo: true
  }
];

export const DEMO_DOCUMENTS: DocRecord[] = [
  {
    id: 'd1', fileName: 'КП_Севзаппромстрой_2026.pdf', docType: 'коммерческое предложение', size: 1800000,
    clientId: 'c1', auditId: 'a1', uploadedAt: '2026-04-15T10:00:00Z', status: 'проанализирован',
    summary: 'КП на внедрение AI-системы контроля чертежей.',
    keyNumbers: [{ label: 'Срок реализации', value: '4 месяца' }],
    gaps: [], redFlags: [], isDemo: true
  },
  {
    id: 'd2', fileName: 'Финмодель_Логитранс.xlsx', docType: 'финансовая модель', size: 340000,
    clientId: 'c2', auditId: 'a3', uploadedAt: '2026-05-25T09:00:00Z', status: 'проанализирован',
    summary: 'Расчет окупаемости AI-диспетчеризации.',
    keyNumbers: [{ label: 'ROI', value: '240%' }],
    gaps: [], redFlags: [], isDemo: true
  },
  {
    id: 'd3', fileName: 'Регламент_ПТО_v3.docx', docType: 'описание процесса', size: 220000,
    clientId: 'c1', auditId: 'a2', uploadedAt: '2026-05-10T11:00:00Z', status: 'проанализирован',
    summary: 'Внутренний регламент работы отдела ПТО.',
    keyNumbers: [], gaps: [], redFlags: [], isDemo: true
  },
  {
    id: 'd4', fileName: 'Выгрузка_заявок_2026Q1.csv', docType: 'данные операций', size: 4100000,
    clientId: 'c6', auditId: 'a8', uploadedAt: '2026-08-28T14:00:00Z', status: 'проанализирован',
    summary: 'Исторические данные по заявкам на эксплуатацию.',
    keyNumbers: [{ label: 'Заявок в месяц', value: '12 400' }],
    gaps: [], redFlags: [], isDemo: true
  },
  {
    id: 'd5', fileName: 'Презентация_проекта_Кадровый.pdf', docType: 'презентация', size: 6200000,
    clientId: 'c7', auditId: 'a9', uploadedAt: '2026-08-30T10:00:00Z', status: 'проанализирован',
    summary: 'Питч-дек платформы подбора персонала.',
    keyNumbers: [], gaps: ['Нет данных по CAC'], redFlags: ['Оптимистичные прогнозы без обоснования'], isDemo: true
  },
  {
    id: 'd6', fileName: 'Штатное_расписание.xlsx', docType: 'данные по ФОТ', size: 180000,
    clientId: null, auditId: null, uploadedAt: '2026-09-05T16:00:00Z', status: 'обрабатывается',
    summary: '', keyNumbers: [], gaps: [], redFlags: [], isDemo: true
  }
];

export const DEMO_FINANCES: FinanceRecord[] = [
  {
    id: 'f1', date: '2026-04-25T10:00:00Z', clientId: 'c1', auditId: 'a1', service: 'AI-аудит компании',
    amount: 350000, type: 'разово', payStatus: 'оплачен', paidAt: '2026-04-30T14:00:00Z', isDemo: true
  },
  {
    id: 'f2', date: '2026-06-05T09:00:00Z', clientId: 'c2', auditId: 'a3', service: 'AI-аудит компании',
    amount: 350000, type: 'разово', payStatus: 'оплачен', paidAt: '2026-06-10T11:00:00Z', isDemo: true
  },
  {
    id: 'f3', date: '2026-09-01T10:00:00Z', clientId: 'c4', auditId: 'a12', service: 'AI-аудит компании',
    amount: 400000, type: 'разово', payStatus: 'оплачен', paidAt: '2026-09-05T15:00:00Z', isDemo: true
  },
  {
    id: 'f4', date: '2026-08-01T10:00:00Z', clientId: 'c1', auditId: null, service: 'AI Office Subscription',
    amount: 250000, type: 'ежемесячно', payStatus: 'оплачен', paidAt: '2026-08-05T10:00:00Z', isDemo: true
  },
  {
    id: 'f5', date: '2026-09-01T10:00:00Z', clientId: 'c1', auditId: null, service: 'AI Office Subscription',
    amount: 250000, type: 'ежемесячно', payStatus: 'выставлен', paidAt: null, isDemo: true
  },
  {
    id: 'f6', date: '2026-09-02T10:00:00Z', clientId: 'c7', auditId: 'a9', service: 'Аудит бизнес-идеи',
    amount: 250000, type: 'разово', payStatus: 'просрочен', paidAt: null, isDemo: true
  }
];
