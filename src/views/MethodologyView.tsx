import React, { useState } from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  Zap, 
  Code, 
  Search, 
  CheckCircle2, 
  Edit3, 
  Lock,
  Sparkles,
  Layers,
  Calculator,
  Gauge,
  TrendingUp,
  UserCheck,
  Coins,
  Sliders,
  ArrowRight,
  Shield,
  HelpCircle
} from 'lucide-react';
import { GLOSSARY, MATURITY_LEVELS } from '../auditMetadata';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export const MethodologyView: React.FC = () => {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveToast, setSaveToast] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isAuditor = user?.role === 'auditor';

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
    setIsEditMode(false);
  };

  const filteredGlossary = GLOSSARY.filter(item => 
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* Заголовок раздела */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Методика</h2>
              {isAuditor && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--text-secondary)]">
                  Только чтение
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Научно-методический базис экспресс-диагностики и комплексного аудита готовности процессов к искусственному интеллекту
            </p>
          </div>
        </div>

        {/* Элементы управления */}
        <div className="flex items-center gap-3">
          {saveToast && (
            <span className="flex items-center gap-1.5 text-xs text-success font-medium animate-in fade-in">
              <CheckCircle2 size={15} /> Изменения сохранены
            </span>
          )}

          {isAdmin ? (
            <button
              onClick={() => isEditMode ? handleSave() : setIsEditMode(true)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer",
                isEditMode 
                  ? "bg-accent text-white hover:opacity-90" 
                  : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--background)]"
              )}
            >
              <Edit3 size={16} />
              {isEditMode ? 'Сохранить изменения' : 'Редактировать'}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--border)]">
              <Lock size={14} className="text-[var(--text-secondary)]" />
              <span>Изменения вносит администратор</span>
            </div>
          )}
        </div>
      </div>

      {/* Уведомление о режиме редактирования для администратора */}
      {isAdmin && isEditMode && (
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5 text-accent text-sm font-medium">
            <Sparkles size={18} />
            <span>Режим редактирования параметров методики активен. Вы можете калибровать формулы и нормативы.</span>
          </div>
          <button 
            onClick={handleSave}
            className="btn-primary text-xs py-1.5 px-3"
          >
            Готово
          </button>
        </div>
      )}

      {/* 3 Базовых принципа */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 space-y-3">
          <div className="w-10 h-10 bg-success/10 text-success rounded-xl flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <h3 className="font-bold text-base">Многофакторный анализ</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Оценка основывается на комплексном анализе 154 параметров: структурированности данных, частоты операций, рутинности задач и наличии программных интерфейсов.
          </p>
        </div>

        <div className="card p-6 space-y-3">
          <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
            <Zap size={20} />
          </div>
          <h3 className="font-bold text-base">Как считается возврат вложений</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Расчёт окупаемости опирается на чистое высвобождение фонда оплаты труда, снижение стоимости ручных ошибок и коэффициент мультипликатора внедрения для отрасли.
          </p>
        </div>

        <div className="card p-6 space-y-3">
          <div className="w-10 h-10 bg-warning/10 text-warning rounded-xl flex items-center justify-center">
            <Code size={20} />
          </div>
          <h3 className="font-bold text-base">Безопасность и защищённый контур</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Приоритет локальным моделям и защищённым шлюзам для сохранения коммерческой тайны, конфиденциальности данных и предсказуемости операционных расходов.
          </p>
        </div>
      </div>

      {/* БЛОК 1: Как формируется рекомендация */}
      <div className="card p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 text-accent rounded-lg">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Как формируется рекомендация</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Пошаговая цепочка преобразования ответов клиента в детерминированную архитектурную рекомендацию
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-1 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)]">
              154 поля реестра
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)]">
              38 правил подбора
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)]">
              16 типовых решений
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Формирование рекомендаций платформы полностью детерминировано и исключает субъективные искажения. Алгоритм последовательно проходит через 8 этапов расчёта:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-accent bg-accent/10 px-2 py-0.5 rounded">Шаг 1</span>
                <HelpCircle size={15} className="text-[var(--text-secondary)]" />
              </div>
              <h4 className="font-bold text-xs text-[var(--text-primary)]">Ответы анкеты чек-листа</h4>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Сбор исходных данных по процессам подразделения (число сотрудников, частота задач, используемые программы, рутинность).
              </p>
            </div>

            <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-accent bg-accent/10 px-2 py-0.5 rounded">Шаг 2</span>
                <Layers size={15} className="text-[var(--text-secondary)]" />
              </div>
              <h4 className="font-bold text-xs text-[var(--text-primary)]">Поля реестра параметров</h4>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Маппинг ответов в 154 типизированных поля реестра со строгой валидацией типов (числовые значения, флаги, текстовые списки).
              </p>
            </div>

            <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-accent bg-accent/10 px-2 py-0.5 rounded">Шаг 3</span>
                <ShieldCheck size={15} className="text-[var(--text-secondary)]" />
              </div>
              <h4 className="font-bold text-xs text-[var(--text-primary)]">Срабатывание правил подбора</h4>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Проверка условий 38 детерминированных правил реестра. Правило активируется при выполнении всех заданных логических предикатов.
              </p>
            </div>

            <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-accent bg-accent/10 px-2 py-0.5 rounded">Шаг 4</span>
                <Zap size={15} className="text-[var(--text-secondary)]" />
              </div>
              <h4 className="font-bold text-xs text-[var(--text-primary)]">Выбор решения из каталога</h4>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Назначение целевого архитектурного решения из 16 типовых решений каталога с учётом технологических зависимостей.
              </p>
            </div>

            <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-accent bg-accent/10 px-2 py-0.5 rounded">Шаг 5</span>
                <UserCheck size={15} className="text-[var(--text-secondary)]" />
              </div>
              <h4 className="font-bold text-xs text-[var(--text-primary)]">Назначение роли ИИ</h4>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Определение зоны ответственности системы: помощник сотрудника, контролёр или полностью автономный исполнитель.
              </p>
            </div>

            <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-accent bg-accent/10 px-2 py-0.5 rounded">Шаг 6</span>
                <Coins size={15} className="text-[var(--text-secondary)]" />
              </div>
              <h4 className="font-bold text-xs text-[var(--text-primary)]">Фиксация стоимости внедрения</h4>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Определение бюджета пилотного проекта и регулярного владения по утверждённому справочнику цен и нормативным трудозатратам.
              </p>
            </div>

            <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-accent bg-accent/10 px-2 py-0.5 rounded">Шаг 7</span>
                <Calculator size={15} className="text-[var(--text-secondary)]" />
              </div>
              <h4 className="font-bold text-xs text-[var(--text-primary)]">Расчёт экономии и окупаемости</h4>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Математический расчёт ежемесячной экономии, высвобождения часов специалистов и точного срока окупаемости инвестиций.
              </p>
            </div>

            <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-accent bg-accent/10 px-2 py-0.5 rounded">Шаг 8</span>
                <Sliders size={15} className="text-[var(--text-secondary)]" />
              </div>
              <h4 className="font-bold text-xs text-[var(--text-primary)]">Оценка по 7 критериям</h4>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Скоринг по 7 критериям приоритизации для определения квадранта дорожной карты и очерёдности запуска пилотов.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* БЛОК 2: Формула расчёта эффекта процесса */}
      <div className="card p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 text-success rounded-lg">
              <Calculator size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Формула расчёта эффекта процесса</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Базовое уравнение расчёта ежемесячной экономии подразделения в комплексном аудите
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-success bg-success/10 px-3 py-1 rounded-lg">
            Комплексный аудит
          </span>
        </div>

        <div className="p-5 bg-[var(--background)] rounded-2xl border border-[var(--border)] font-mono text-xs leading-relaxed text-[var(--text-primary)]">
          <code>
            Экономия (₽/мес) = Часы_в_месяц × Доля_ручного_труда (%) × Коэффициент_эффективности_решения × Часовая_ставка (₽) × Отраслевой_множитель
          </code>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[var(--text-secondary)]">
          <div className="space-y-2">
            <p className="font-bold text-[var(--text-primary)]">Ключевые допущения калибровки:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Учитываются прямые временные затраты специалистов на выполнение рутинных задач.</li>
              <li>Часовая ставка рассчитывается из фонда оплаты труда сотрудников с налогами и накладными расходами.</li>
              <li>Коэффициент эффективности решения варьируется от 10% до 85% в зависимости от архитектурного типа.</li>
              <li>Отраслевой множитель калибрует специфику документооборота и регуляторных требований отрасли.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-[var(--text-primary)]">Приоритеты рекомендаций в дорожной карте:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-[var(--text-primary)]">Быстрый результат:</strong> окупаемость до 4 месяцев, низкая сложность внедрения, быстрый возврат вложений.</li>
              <li><strong className="text-[var(--text-primary)]">Крупные проекты:</strong> окупаемость до 12 месяцев с глубокой трансформацией и перестройкой сквозных процессов.</li>
              <li><strong className="text-[var(--text-primary)]">Базовые проекты:</strong> автоматизация рутинных вспомогательных функций подразделений.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* БЛОК 3: Формула упрощённого расчёта бесплатного формата */}
      <div className="card p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 text-warning rounded-lg">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Формула упрощённого расчёта бесплатного формата</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Алгоритм предварительной экспресс-оценки потенциала автоматизации
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-warning bg-warning/10 px-3 py-1 rounded-lg">
            Экспресс-оценка
          </span>
        </div>

        <div className="p-5 bg-[var(--background)] rounded-2xl border border-[var(--border)] font-mono text-xs leading-relaxed text-[var(--text-primary)]">
          <code>
            Базовая экономия = Число_операций_в_месяц × Время_на_операцию (ч) × Часовая_ставка (₽/ч) × 50%
          </code>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[var(--text-secondary)]">
          <div className="space-y-2">
            <p className="font-bold text-[var(--text-primary)]">Логика упрощённого расчёта:</p>
            <p className="leading-relaxed">
              В экспресс-формате используется консервативный норматив автоматизации 50% от совокупных трудозатрат на типовую операцию. Это позволяет мгновенно продемонстрировать потенциал оптимизации без проведения детального хронометража.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-[var(--text-primary)]">Коридор неопределённости (вилка 70–130%):</p>
            <p className="leading-relaxed">
              Для учёта отраслевой специфики и погрешности предварительных оценок клиенту демонстрируется диапазон экономии от 70% до 130% от базового расчётного значения. Точная цифра фиксируется на этапе комплексного платного аудита.
            </p>
          </div>
        </div>
      </div>

      {/* БЛОК 4: Как считается индекс готовности к внедрению ИИ */}
      <div className="card p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 text-accent rounded-lg">
              <Gauge size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Как считается индекс готовности к внедрению ИИ</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                100-балльная шкала готовности предприятия, агрегирующая 4 ключевых составляющих
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-lg">
            Максимум 100 баллов
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 space-y-2 bg-[var(--background)] border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-accent">Данные</span>
              <span className="text-sm font-black text-[var(--text-primary)]">30 баллов</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Оцифрованность документов, структурированность баз данных, глубина истории, отсутствие дубликатов и доступность регламентов.
            </p>
          </div>

          <div className="card p-5 space-y-2 bg-[var(--background)] border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-accent">Процессы</span>
              <span className="text-sm font-black text-[var(--text-primary)]">30 баллов</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Степень стандартизации и формализации операций, повторяемость рутинных сценариев, регулярность выполнения и прозрачность метрик.
            </p>
          </div>

          <div className="card p-5 space-y-2 bg-[var(--background)] border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-accent">Технологии</span>
              <span className="text-sm font-black text-[var(--text-primary)]">20 баллов</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Наличие современных учётных систем, открытые программные интерфейсы для интеграции, защищённая серверная инфраструктура.
            </p>
          </div>

          <div className="card p-5 space-y-2 bg-[var(--background)] border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-accent">Организация</span>
              <span className="text-sm font-black text-[var(--text-primary)]">20 баллов</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Вовлечённость руководства, цифровая культура команды, отсутствие сопротивления автоматизации, регламенты информационной безопасности.
            </p>
          </div>
        </div>
      </div>

      {/* БЛОК 5: Шесть уровней использования ИИ */}
      <div className="card p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 text-success rounded-lg">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Шесть уровней использования ИИ</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Классификатор технологической зрелости процессов и условия присвоения уровней
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-success bg-success/10 px-3 py-1 rounded-lg">
            Уровни 0–5
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 w-28">Уровень</th>
                <th className="py-3 px-4 w-44">Название</th>
                <th className="py-3 px-4">Описание состояния</th>
                <th className="py-3 px-4">Ключевые критерии присвоения</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {MATURITY_LEVELS.map((lvl) => (
                <tr key={lvl.level} className="hover:bg-[var(--background)] transition-colors">
                  <td className="py-3.5 px-4 font-black text-accent text-sm">
                    Уровень {lvl.level}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">
                    {lvl.name}
                  </td>
                  <td className="py-3.5 px-4 text-[var(--text-secondary)] leading-relaxed">
                    {lvl.description}
                  </td>
                  <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {lvl.characteristics.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* БЛОК 6: Три роли ИИ */}
      <div className="card p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 text-accent rounded-lg">
              <UserCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Три роли ИИ</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Градация степени автономности алгоритмов и нормативная стоимость пилотных проектов
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-lg">
            Базовые нормативы
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-accent">Роль 1</span>
              <span className="text-sm font-black text-accent">от 450 000 ₽</span>
            </div>
            <h4 className="font-bold text-base text-[var(--text-primary)]">Помощник сотрудника</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Ускоряет человека: готовит черновики писем и отчётов, ищет факты в регламентах, расшифровывает аудиозаписи совещаний. Окончательное решение всегда принимает человек.
            </p>
            <div className="pt-2 border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)]">
              <strong>Типовые решения:</strong> S01, S02, S03, S15, S16
            </div>
          </div>

          <div className="p-6 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-accent">Роль 2</span>
              <span className="text-sm font-black text-accent">от 700 000 ₽</span>
            </div>
            <h4 className="font-bold text-base text-[var(--text-primary)]">Контролёр</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Автоматически проверяет сметы, спецификации, договоры и транзакции на ошибки, дубликаты и отклонения от регламентов перед передачей на утверждение руководителю.
            </p>
            <div className="pt-2 border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)]">
              <strong>Типовые решения:</strong> S04, S07, S09, S11, S12
            </div>
          </div>

          <div className="p-6 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-accent">Роль 3</span>
              <span className="text-sm font-black text-accent">от 900 000 ₽</span>
            </div>
            <h4 className="font-bold text-base text-[var(--text-primary)]">Исполнитель</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Автономно исполняет рутинные операции полного цикла: маршрутизация входящих заявок, распознавание и проводка первичных документов, заполнение карточек учёта.
            </p>
            <div className="pt-2 border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)]">
              <strong>Типовые решения:</strong> S05, S06, S08, S10, S13, S14
            </div>
          </div>
        </div>
      </div>

      {/* БЛОК 7: Семь критериев приоритизации */}
      <div className="card p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 text-accent rounded-lg">
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Семь критериев приоритизации</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Матрица взвешенной оценки инициатив (5 автоматических критериев движка и 2 экспертных критерия аудитора)
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-lg">
            Шкала 1–5 баллов
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-sm text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              5 Автоматических критериев (рассчитываются системой по формулам)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--text-primary)]">1. Экономический эффект</span>
                  <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded">Авто</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Оценивается по сумме годовой экономии процесса: свыше 3 млн ₽/год = 5 баллов, 1.5–3 млн ₽ = 4, 800 тыс. – 1.5 млн ₽ = 3, 300–800 тыс. ₽ = 2, менее 300 тыс. ₽ = 1 балл.
                </p>
              </div>

              <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--text-primary)]">2. Скорость внедрения</span>
                  <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded">Авто</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Оценивается по сроку пилота: до 4 недель = 5 баллов, до 6 недель = 4, до 8 недель = 3, до 12 недель = 2, свыше 12 недель = 1 балл.
                </p>
              </div>

              <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--text-primary)]">3. Стоимость решения</span>
                  <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded">Авто</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Оценивается по бюджету внедрения (чем дешевле, тем выше балл): до 500 тыс. ₽ = 5 баллов, до 800 тыс. ₽ = 4, до 1.5 млн ₽ = 3, до 3 млн ₽ = 2, свыше 3 млн ₽ = 1 балл.
                </p>
              </div>

              <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--text-primary)]">4. Зрелость процесса</span>
                  <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded">Авто</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Оценивается по уровню стандартизации: регламентированные процессы = 5 баллов, типовые сценарии = 4, частично описанные = 3, нестабильные = 2, хаотичные = 1 балл.
                </p>
              </div>

              <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--text-primary)]">5. Полнота данных</span>
                  <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded">Авто</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Оценивается по доле оцифрованных данных и заполнению анкеты: полнота свыше 80% = 5 баллов, от 60% = 4, от 40% = 3, от 20% = 2, менее 20% = 1 балл.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="font-bold text-sm text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              2 Экспертных критерия (заполняются и калибруются аудитором)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--text-primary)]">6. Готовность персонала и влияние на команду</span>
                  <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">Аудитор</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Оценивается экспертом во время интервью: цифровая грамотность ключевых сотрудников, открытость к изменениям, отсутствие саботажа и готовность лидера подразделения быть куратором пилота (1–5 баллов).
                </p>
              </div>

              <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--text-primary)]">7. Риски внедрения и безопасность</span>
                  <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">Аудитор</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Оценивается аудитором по уровню конфиденциальности данных, регуляторным ограничениям отрасли, стабильности внешних систем и вероятности технологических сбоев (5 — минимальные риски, 1 — критические риски).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* БЛОК 8: Глоссарий понятий */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg">Глоссарий понятий</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Единый понятийный аппарат платформы для консультаций клиентов и презентации отчётов
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
            <input
              type="text"
              placeholder="Поиск по понятиям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGlossary.map((item, index) => (
            <div key={index} className="card p-5 space-y-2 hover:border-accent/50 transition-all group">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-accent">{item.term}</h4>
                {isAdmin && isEditMode && (
                  <button className="text-[10px] text-[var(--text-secondary)] hover:text-accent font-medium cursor-pointer">
                    Править
                  </button>
                )}
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {item.definition}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
