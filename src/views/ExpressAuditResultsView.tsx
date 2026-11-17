import React, { useMemo, useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Zap, 
  ArrowLeft,
  Info,
  X,
  Calculator,
  ChevronRight,
  Printer,
  Sparkles,
  AlertCircle,
  HelpCircle,
  FileText,
  UserCheck,
  ShieldCheck,
  Cpu,
  XCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { CompanyAuditData } from '../types';
import { runAuditAnalysis } from '../lib/auditEngine';
import { calculateAiMaturityLevel } from '../lib/aiMaturity';
import { AI_SOLUTIONS, MATURITY_LEVELS } from '../auditMetadata';
import { formatCurrency, cn } from '../lib/utils';
import { ScoreRing } from '../components/ui/ScoreRing';
import { StatusBadge } from '../components/ui/StatusBadge';
import { generateExpressAuditPdfReport } from '../lib/pdfReportGenerator';
import { useAuth } from '../contexts/AuthContext';

interface ExpressAuditResultsViewProps {
  data: CompanyAuditData;
  onClose: () => void;
}

export const ExpressAuditResultsView: React.FC<ExpressAuditResultsViewProps> = ({ data, onClose }) => {
  const { user } = useAuth();
  const analysis = useMemo(() => runAuditAnalysis(data), [data]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  const dept = data.departments?.[0];
  const allProcesses = (data.departments || []).flatMap(d => d.processes || []);

  // 1. Индекс AI-готовности
  const maturity = calculateAiMaturityLevel(dept || {}, data.format);
  const lvl = maturity.level ?? 1;
  const matchedMaturity = MATURITY_LEVELS.find(m => m.level === lvl) || MATURITY_LEVELS[1];
  
  // Расчёт индекса готовности (0..100)
  const baseScores = [18, 35, 52, 68, 84, 96];
  const readinessIndex = Math.min(100, Math.max(10, baseScores[lvl] ?? 35));

  // 2. Рейтинг процессов — до 3 процессов, отсортированных по потенциалу, с указанием часов ручного труда
  const hourlyRate = Number(data.profile?.co_hourly_rate ?? data.profile?.avgHourlyRate ?? 700);

  const processRatings = allProcesses.map(proc => {
    const ops = Number(proc.pr_ops_month ?? proc.operationsPerMonth ?? 0);
    const mins = Number(proc.pr_minutes ?? proc.timePerOperation ?? 0);
    const manualShare = Number(proc.pr_manual_share ?? proc.manualWorkShare ?? 80);

    let manualHoursMonth = 0;
    if (ops > 0 && mins > 0) {
      manualHoursMonth = Math.round((ops * mins * (manualShare / 100)) / 60);
    } else {
      const people = Number(proc.pr_people ?? proc.executor?.count ?? 1);
      manualHoursMonth = Math.round(people * 160 * (manualShare / 100) * 0.4);
    }

    const matchingIni = analysis.initiatives.find(ini => 
      ini.processName?.toLowerCase().includes(proc.name.toLowerCase()) || 
      ini.processes?.some(p => p.toLowerCase().includes(proc.name.toLowerCase()))
    );

    const potentialSavings = matchingIni ? matchingIni.monthlySavings : Math.round(manualHoursMonth * hourlyRate * 0.5);

    return {
      id: proc.id,
      name: proc.name,
      ops,
      mins,
      manualShare,
      manualHoursMonth,
      potentialSavings
    };
  });

  const sortedProcesses = [...processRatings]
    .sort((a, b) => b.potentialSavings - a.potentialSavings)
    .slice(0, 3);

  // 3. Один рекомендуемый сценарий — только решение с наибольшим эффектом.
  const topInitiative = analysis.initiatives[0];
  const solution = AI_SOLUTIONS.find(s => s.code === topInitiative?.solutionCode);

  // 4. Роль ИИ в этом сценарии
  const aiRole = solution?.aiRole || 'помощник сотрудника';

  // 5. Диапазон эффекта — вилка от 70% до 130% от расчёта. Расчёт: операции × время × стоимость часа × 50%.
  // Находим процесс для сценария
  const targetProcess = allProcesses.find(p => p.name === topInitiative?.processName) || allProcesses[0];
  const processOps = Number(targetProcess?.pr_ops_month ?? targetProcess?.operationsPerMonth ?? 2000);
  const processMins = Number(targetProcess?.pr_minutes ?? targetProcess?.timePerOperation ?? 15);
  const timeInHours = processMins / 60;

  const calculatedMonthlyEffect = Math.round(processOps * timeInHours * hourlyRate * 0.5);
  const minRangeEffect = Math.round(calculatedMonthlyEffect * 0.7);
  const maxRangeEffect = Math.round(calculatedMonthlyEffect * 1.3);

  // 6. Ориентировочный срок запуска пилота в неделях
  const pilotWeeks = solution?.durationWeeks || topInitiative?.effortWeeks || 4;

  const getWeeksText = (weeks: number) => {
    const mod10 = weeks % 10;
    const mod100 = weeks % 100;
    if (mod100 >= 11 && mod100 <= 14) return `${weeks} недель`;
    if (mod10 === 1) return `${weeks} неделя`;
    if (mod10 >= 2 && mod10 <= 4) return `${weeks} недели`;
    return `${weeks} недель`;
  };

  // 7. Перечень данных, необходимых для полного аудита
  const requiredDataForFullAudit = [
    'Полная организационная структура и перечень всех подразделений компании с описанием зон ответственности',
    'Регламенты, технологические карты, должностные инструкции и правила выполнения рабочих процессов',
    'Выгрузки из учётных программ, где ведётся работа, со статистикой операций за последние 6–12 месяцев',
    'Фактические данные по фонду оплаты труда, часовым ставкам специалистов и оценкам потерь от ошибок',
    'Примеры реальных рабочих документов (сканы, спецификации, договоры, накладные, акты, служебные записки)',
    'Требования к безопасности данных, правила конфиденциальности и ограничения по размещению систем',
    'Техническое описание корпоративных программ, возможности их интеграции и структура хранения данных'
  ];

  // Обязательный список «Что не входит в бесплатную оценку»
  const notIncludedItems = [
    'Интервью с сотрудниками',
    'Выезд на предприятие',
    'Наблюдение за процессами',
    'Детальное моделирование',
    'Проверка качества данных',
    'Доступ к системам',
    'Техническое проектирование',
    'Разработка решения',
    'Точная оценка бюджета',
    'Гарантированный расчёт эффекта',
    'План внедрения для всей компании'
  ];

  const industryName = data.profile?.industry || data.profile?.co_industry || 'Компания';

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      {/* Верхняя шапка */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Заключение по экспресс-оценке AI-готовности
            </h1>
            <StatusBadge label="Бесплатный экспресс-формат" type="info" />
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Отрасль: <span className="font-medium text-[var(--text-primary)]">{industryName}</span>
            {dept?.name ? ` • Подразделение: ${dept.name}` : ''}
            {' • Экспресс-диагностика на основе анкетных данных'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={onClose} className="btn-secondary flex items-center gap-2">
            <ArrowLeft size={16} />
            Назад
          </button>
          <button 
            onClick={() => generateExpressAuditPdfReport(data, analysis, user)} 
            className="btn-secondary flex items-center gap-2"
            title="Печать или сохранение в PDF"
          >
            <Printer size={16} />
            Печать / PDF
          </button>
        </div>
      </div>

      {/* Предупреждение о границах бесплатной оценки */}
      <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-start gap-3">
        <Info size={20} className="text-sky-500 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          <span className="font-bold text-[var(--text-primary)]">Экспресс-заключение сформировано по 1 подразделению:</span>{' '}
          это предварительная экспертная оценка для быстрого выявления первого приоритетного сценария. Ниже представлены 7 ключевых параметров экспресс-анализа.
        </div>
      </div>

      {/* СТРОГО СЕМЬ БЛОКОВ В ЗАДАННОМ ПОРЯДКЕ */}

      {/* БЛОК 1: Индекс AI-готовности */}
      <section className="card p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0">
            1
          </div>
          <h2 className="text-xl font-bold">1. Индекс AI-готовности</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
          <div className="shrink-0 flex flex-col items-center">
            <ScoreRing score={readinessIndex} size={96} strokeWidth={9} />
            <span className="text-xs font-bold text-accent mt-2">{readinessIndex} из 100</span>
          </div>
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <span className="font-bold text-base sm:text-lg">
                Уровень зрелости: {matchedMaturity.name} ({lvl} из 5)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold uppercase">
                {lvl === 0 ? 'Базовый старт' : lvl === 1 ? 'Теневой риск' : lvl <= 3 ? 'Готов к пилоту' : 'Высокая зрелость'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {matchedMaturity.description}
            </p>
            <p className="text-xs text-[var(--text-secondary)] pt-1 border-t border-[var(--border)]">
              <b>Расшифровка индекса:</b> {readinessIndex >= 60 
                ? 'Подразделение обладает достаточной цифровой культурой и регламентами для быстрого развертывания пилотного ИИ-сценария.' 
                : readinessIndex >= 35 
                ? 'Имеются первые предпосылки для автоматизации, однако требуются стандартизация регламентов и защита корпоративных данных.'
                : 'Процессы преимущественно ручные. Рекомендуется начать с базовой цифровизации и внедрения безопасного корпоративного контура.'}
            </p>
          </div>
        </div>
      </section>

      {/* БЛОК 2: Рейтинг процессов */}
      <section className="card p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0">
            2
          </div>
          <h2 className="text-xl font-bold">2. Рейтинг процессов</h2>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          До трёх ключевых процессов подразделения, отсортированных по потенциалу автоматизации с указанием ежемесячных затрат ручного труда:
        </p>

        <div className="grid grid-cols-1 gap-4">
          {sortedProcesses.length > 0 ? (
            sortedProcesses.map((proc, index) => (
              <div 
                key={proc.id || index}
                className="p-4 sm:p-5 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0 text-base">
                    №{index + 1}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-[var(--text-primary)]">{proc.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] flex-wrap">
                      {proc.ops > 0 && <span>{proc.ops.toLocaleString('ru-RU')} операций/мес</span>}
                      {proc.mins > 0 && <span>• {proc.mins} мин/операция</span>}
                      <span>• Доля ручного труда: {proc.manualShare}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--border)] shrink-0">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold">Ручной труд</span>
                  <span className="text-base font-bold text-accent">
                    {proc.manualHoursMonth} ч/мес ручного труда
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-[var(--text-secondary)] bg-[var(--background)] rounded-2xl border border-[var(--border)]">
              В анкете не указаны процессы подразделения.
            </div>
          )}
        </div>
      </section>

      {/* БЛОК 3: Один рекомендуемый сценарий */}
      <section className="card p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0">
            3
          </div>
          <h2 className="text-xl font-bold">3. Один рекомендуемый сценарий</h2>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          Решение с наибольшим подтверждённым эффектом среди всех проанализированных процессов (в экспресс-формате выводится строго один приоритетный сценарий):
        </p>

        {topInitiative ? (
          <div className="p-6 rounded-2xl bg-accent/5 border border-accent/20 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-lg bg-accent text-white">
                    {topInitiative.solutionCode}
                  </span>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    {topInitiative.name}
                  </h3>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Приоритетный процесс: <span className="font-semibold text-[var(--text-primary)]">{topInitiative.processName}</span>
                </p>
              </div>
              <span className="text-xs bg-success/10 text-success border border-success/20 px-2.5 py-1 rounded-full font-semibold">
                Максимальный эффект
              </span>
            </div>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {topInitiative.whatItDoes || solution?.description || 'Интеллектуальная автоматизация рутинных операций процесса.'}
            </p>

            <div className="pt-3 border-t border-accent/10 flex items-center justify-between text-xs text-[var(--text-secondary)] flex-wrap gap-2">
              <span>Категория: <b>{solution?.type || topInitiative.type || 'AI-решение'}</b></span>
              <span>Обоснование: <b>наивысшая экономия трудозатрат в периметре оценки</b></span>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-[var(--text-secondary)] bg-[var(--background)] rounded-2xl border border-[var(--border)]">
            Нет данных для формирования сценария.
          </div>
        )}
      </section>

      {/* БЛОК 4: Роль ИИ в этом сценарии */}
      <section className="card p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0">
            4
          </div>
          <h2 className="text-xl font-bold">4. Роль ИИ в этом сценарии</h2>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
            {aiRole === 'контролёр' ? (
              <ShieldCheck size={28} />
            ) : aiRole === 'исполнитель' ? (
              <Cpu size={28} />
            ) : (
              <UserCheck size={28} />
            )}
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">
                Формат взаимодействия:
              </span>
              <span className="text-sm font-bold capitalize px-3 py-0.5 rounded-full bg-accent text-white">
                {aiRole}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {aiRole === 'помощник сотрудника' && (
                <><b>Помощник сотрудника:</b> ИИ анализирует входящий контекст, готовит проекты документов, подсказывает варианты решений и формирует черновики. Специалист сохраняет контроль и подтверждает финальный результат.</>
              )}
              {aiRole === 'контролёр' && (
                <><b>Контролёр:</b> ИИ непрерывно осуществляет фоновую валидацию документов и расчётов, сверяет данные со стандартами и нормативами, выявляя расхождения и риски до отправки клиенту или руководству.</>
              )}
              {aiRole === 'исполнитель' && (
                <><b>Исполнитель:</b> ИИ берет на себя сквозное автономное выполнение типовой цепочки операций по строгим правилам без постоянного ручного вмешательства оператора.</>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* БЛОК 5: Диапазон эффекта */}
      <section className="card p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0">
            5
          </div>
          <h2 className="text-xl font-bold">5. Диапазон эффекта</h2>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          Упрощённый расчёт потенциального экономического эффекта: <b>операции × время × стоимость часа × 50%</b> с вилкой точности от <b>70%</b> до <b>130%</b>:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Карточка суммы расчёта и вилки */}
          <div className="p-6 rounded-2xl bg-success/5 border border-success/20 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-success">
                Расчётная сумма эффекта
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-success mt-1">
                {calculatedMonthlyEffect.toLocaleString('ru-RU')} ₽ <span className="text-sm font-normal text-[var(--text-secondary)]">/ месяц</span>
              </p>
            </div>

            <div className="pt-3 border-t border-success/15 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Вилка эффекта (70% – 130%):</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {minRangeEffect.toLocaleString('ru-RU')} ₽ – {maxRangeEffect.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Ориентир в год (вилка):</span>
                <span className="font-bold text-success">
                  {(minRangeEffect * 12).toLocaleString('ru-RU')} ₽ – {(maxRangeEffect * 12).toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>
          </div>

          {/* Карточка параметров формулы */}
          <div className="p-6 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <Calculator size={14} className="text-accent" />
              Параметры упрощённого расчёта
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[var(--border)]">
                <span className="text-[var(--text-secondary)]">Объём операций:</span>
                <span className="font-semibold">{processOps.toLocaleString('ru-RU')} операций</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border)]">
                <span className="text-[var(--text-secondary)]">Время на операцию:</span>
                <span className="font-semibold">{processMins} минут ({timeInHours.toFixed(2)} ч)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border)]">
                <span className="text-[var(--text-secondary)]">Стоимость часа:</span>
                <span className="font-semibold">{hourlyRate.toLocaleString('ru-RU')} ₽ / час</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[var(--text-secondary)]">Коэффициент эффекта:</span>
                <span className="font-semibold text-accent">50%</span>
              </div>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed pt-1">
              Формула: <code>{processOps.toLocaleString('ru-RU')} × {timeInHours.toFixed(2)} ч × {hourlyRate} ₽ × 50% = {calculatedMonthlyEffect.toLocaleString('ru-RU')} ₽</code>
            </p>
          </div>
        </div>
      </section>

      {/* БЛОК 6: Ориентировочный срок запуска пилота */}
      <section className="card p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0">
            6
          </div>
          <h2 className="text-xl font-bold">6. Ориентировочный срок запуска пилота</h2>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Clock className="text-accent" size={24} />
              <div>
                <span className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold">
                  Срок реализации первого этапа
                </span>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {getWeeksText(pilotWeeks)} (ориентировочно)
                </p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xl">
              Срок включает разметку тестового набора данных, конфигурацию модели, интеграцию безопасного шлюза и опытную эксплуатацию на ограниченной выборке задач.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs shrink-0 w-full sm:w-auto">
            <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-secondary)] block">Недели 1–2</span>
              <span className="font-semibold">Настройка и обучение</span>
            </div>
            <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-secondary)] block">Недели 3–{pilotWeeks}</span>
              <span className="font-semibold">Тест и запуск группы</span>
            </div>
          </div>
        </div>
      </section>

      {/* БЛОК 7: Перечень данных, необходимых для полного аудита */}
      <section className="card p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0">
            7
          </div>
          <h2 className="text-xl font-bold">7. Перечень данных, необходимых для полного аудита</h2>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          Для перехода от экспресс-оценки к комплексному расчету инвестиций и подготовке детального ТЗ требуется предоставить:
        </p>

        <div className="space-y-2.5">
          {requiredDataForFullAudit.map((item, idx) => (
            <div 
              key={idx} 
              className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-start gap-3"
            >
              <CheckCircle2 size={16} className="text-accent mt-0.5 shrink-0" />
              <span className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ОБЯЗАТЕЛЬНЫЙ БЛОК: «Что не входит в бесплатную оценку» */}
      <section className="card p-6 sm:p-8 space-y-5 border-amber-500/30 bg-amber-500/[0.03]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center shrink-0">
            <XCircle size={18} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Что не входит в бесплатную оценку
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Ограничения экспресс-формата — данные этапы выполняются только в рамках платного комплексного аудита:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {notIncludedItems.map((item, idx) => (
            <div 
              key={idx} 
              className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center gap-3 text-xs sm:text-sm"
            >
              <div className="w-5 h-5 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <X size={12} strokeWidth={3} />
              </div>
              <span className="text-[var(--text-secondary)]">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ПОСЛЕДНИЙ БЛОК: Предложение перейти к комплексному аудиту */}
      <section className="rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-purple-600 via-indigo-600 to-accent text-white shadow-xl shadow-purple-500/20 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold">
              <Sparkles size={14} />
              Рекомендуемый следующий шаг
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Комплексный AI-аудит компании
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              Глубокое обследование всех бизнес-процессов, интервью с ключевыми сотрудниками, выезд на предприятие, техническое проектирование архитектуры и расчёт возврата вложений для всей компании.
            </p>
          </div>

          <div className="text-left md:text-right shrink-0">
            <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">Стоимость аудита</p>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-0.5">
              650 000 ₽
            </p>
            <p className="text-xs text-white/70 mt-1">Базовая стоимость, диапазон 500 000 – 900 000 ₽</p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-white/80">
            <CheckCircle2 size={16} className="text-white shrink-0" />
            <span>Срок проведения: 4–8 недель • Полная карта проектов • Расчёт экономики по каждому процессу</span>
          </div>

          <button 
            onClick={() => setShowOrderModal(true)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-purple-900 font-bold text-sm hover:bg-white/90 active:scale-95 transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2"
          >
            <span>Заказать комплексный аудит</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* Модальное окно заказа комплексного аудита */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--surface)] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border)] space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Заявка на комплексный аудит</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Стоимость: 650 000 ₽</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowOrderModal(false);
                  setOrderSent(false);
                }}
                className="p-2 hover:bg-[var(--background)] rounded-full text-[var(--text-secondary)]"
              >
                <X size={18} />
              </button>
            </div>

            {orderSent ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-success/10 text-success mx-auto flex items-center justify-center">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="font-bold text-lg">Заявка успешно отправлена!</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Ведущий эксперт по AI-аудиту свяжется с вами для согласования даты установочного интервью и подписания соглашения о неразглашении конфиденциальной информации.
                </p>
                <button 
                  onClick={() => {
                    setShowOrderModal(false);
                    setOrderSent(false);
                  }}
                  className="btn-primary w-full"
                >
                  Понятно
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Вы заказываете <b>Комплексный AI-аудит компании</b> для <b>«{industryName}»</b> за <b>650 000 ₽</b>. В аудит войдут все 11 этапов глубокого исследования.
                </p>

                <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Формат:</span>
                    <span className="font-semibold">Комплексный AI-аудит компании</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Срок:</span>
                    <span className="font-semibold">4–8 недель</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[var(--border)]">
                    <span className="font-bold">Итого:</span>
                    <span className="font-bold text-accent text-sm">650 000 ₽</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowOrderModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Отмена
                  </button>
                  <button 
                    onClick={() => setOrderSent(true)}
                    className="btn-primary flex-1"
                  >
                    Подтвердить заказ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
