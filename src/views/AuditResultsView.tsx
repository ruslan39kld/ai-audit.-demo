import React, { useMemo } from 'react';
import { 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  Download, 
  Share2, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Zap, 
  Shield, 
  Target,
  ChevronRight,
  Layers,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  AlertTriangle,
  Info,
  X,
  Calculator,
  Search
} from 'lucide-react';
import { CompanyAuditData, Initiative, InitiativeCriteriaScores } from '../types';
import { runAuditAnalysis } from '../lib/auditEngine';
import { formatCurrency, formatRoi, formatPayback, cn } from '../lib/utils';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ExpressAuditResultsView } from './ExpressAuditResultsView';
import { SevenCriteriaMatrix } from '../components/SevenCriteriaMatrix';
import { evaluateInitiativeSevenCriteria } from '../lib/sevenCriteria';
import { generatePaidAuditPdfReport } from '../lib/pdfReportGenerator';
import { useAuth } from '../contexts/AuthContext';

interface AuditResultsViewProps {
  data: CompanyAuditData;
  onClose: () => void;
}

export const AuditResultsView: React.FC<AuditResultsViewProps> = ({ data, onClose }) => {
  const { user } = useAuth();
  if (data.format === 'express') {
    return <ExpressAuditResultsView data={data} onClose={onClose} />;
  }

  const analysis = useMemo(() => runAuditAnalysis(data), [data]);
  const [selectedInitiative, setSelectedInitiative] = React.useState<Initiative | null>(null);
  const [auditorScores, setAuditorScores] = React.useState<Record<string, { risks?: number; staffImpact?: number }>>({});

  const { initiatives, mode, completeness } = analysis;

  const handleUpdateInitiativeScores = React.useCallback((initiativeId: string, scores: Partial<InitiativeCriteriaScores>) => {
    setAuditorScores(prev => ({
      ...prev,
      [initiativeId]: {
        ...prev[initiativeId],
        ...(scores.risks !== undefined ? { risks: scores.risks } : {}),
        ...(scores.staffImpact !== undefined ? { staffImpact: scores.staffImpact } : {})
      }
    }));
  }, []);

  const totalMonthlySavings = initiatives.reduce((acc, ini) => acc + ini.monthlySavings, 0);
  const totalInvestment = initiatives.reduce((acc, ini) => acc + ini.investment, 0);
  const avgPayback = initiatives.length > 0 ? totalInvestment / (totalMonthlySavings || 1) : 0;
  const totalHoursSaved = initiatives.reduce((acc, ini) => acc + ini.potentialHoursSaved, 0);

  const industryName = data.profile.industry || data.profile.co_industry || 'Не указана';
  const staff = data.profile.co_headcount_total || data.profile.totalStaff || data.profile.co_headcount_scope || 0;

  const initiativeCountText = (() => {
    const c = initiatives.length;
    const mod10 = c % 10;
    const mod100 = c % 100;
    if (mod100 >= 11 && mod100 <= 19) return `${c} AI-инициатив`;
    if (mod10 === 1) return `${c} AI-инициативы`;
    if (mod10 >= 2 && mod10 <= 4) return `${c} AI-инициатив`;
    return `${c} AI-инициатив`;
  })();

  const deptData = useMemo(() => {
    const map: Record<string, number> = {};
    initiatives.forEach(ini => {
      map[ini.departmentName] = (map[ini.departmentName] || 0) + ini.monthlySavings;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [initiatives]);

  const evaluatedInitiatives = useMemo(() => {
    return initiatives.map(ini => {
      const custom = auditorScores[ini.id];
      const scoredIni = (custom || ini.criteriaScores) ? {
        ...ini,
        criteriaScores: {
          ...ini.criteriaScores,
          ...(custom?.risks !== undefined ? { risks: custom.risks } : {}),
          ...(custom?.staffImpact !== undefined ? { staffImpact: custom.staffImpact } : {})
        }
      } : ini;
      const evalRes = evaluateInitiativeSevenCriteria(scoredIni, completeness, initiatives);
      return {
        initiative: scoredIni,
        evaluation: evalRes
      };
    }).sort((a, b) => b.evaluation.overallPriority - a.evaluation.overallPriority);
  }, [initiatives, completeness, auditorScores]);

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#82E0AA'];

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold">Результаты AI-аудита</h1>
            <StatusBadge 
              label={mode === 'Full' ? 'Полный аудит' : mode === 'Estimated' ? 'Оценочный расчёт' : 'Предварительный отчёт'} 
              type={mode === 'Full' ? 'success' : mode === 'Estimated' ? 'warning' : 'info'} 
            />
          </div>
          <p className="text-[var(--text-secondary)]">
            Анализ потенциала для компании «{industryName}» • Полнота данных: {completeness}%
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={onClose} className="btn-secondary flex items-center gap-2">
             <ArrowLeft size={18} />
             Назад
           </button>
           <button 
             onClick={() => generatePaidAuditPdfReport(data, analysis, user, auditorScores)} 
             className="btn-primary flex items-center gap-2"
             title="Сформировать печатный PDF отчёт"
           >
             <Download size={18} />
             PDF Отчёт
           </button>
        </div>
      </div>

      {mode !== 'Full' && (
        <div className={cn(
          "p-4 rounded-2xl flex items-start gap-4",
          mode === 'Preliminary' ? "bg-info/10 border border-info/20" : "bg-warning/10 border border-warning/20"
        )}>
          <AlertTriangle className={mode === 'Preliminary' ? "text-info" : "text-warning"} size={20} />
          <div>
            <h4 className="font-bold text-sm">
              {mode === 'Preliminary' ? 'Низкая полнота данных' : 'Оценочные данные'}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {mode === 'Preliminary' 
                ? 'Полнота данных ниже 30%. Показаны только качественные выводы, экономика может быть неточной (±40%). Дозаполните анкету для точного расчета.' 
                : 'Полнота данных средняя. Точность расчетов составляет ±30%. Рекомендуем уточнить параметры процессов для финального отчета.'}
            </p>
          </div>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Потенциальная экономия"
          value={formatCurrency(totalMonthlySavings)}
          subtitle="в месяц"
          trend={{ value: 24, isPositive: true }}
          icon={TrendingUp}
        />
        <MetricCard
          title="Высвобождение времени"
          value={`${totalHoursSaved} ч.`}
          subtitle="в месяц"
          icon={Clock}
        />
        <MetricCard
          title="Необходимые инвестиции"
          value={formatCurrency(totalInvestment)}
          subtitle="общий бюджет внедрения"
          icon={Zap}
        />
        <MetricCard
          title="Срок окупаемости"
          value={formatPayback(avgPayback).text}
          subtitle={formatPayback(avgPayback).caption || "в среднем"}
          icon={Target}
        />
      </div>

      {/* 7-Criteria Initiative Evaluation Matrix */}
      <SevenCriteriaMatrix 
        initiatives={initiatives}
        completeness={completeness}
        onSelectInitiative={(ini) => setSelectedInitiative(ini)}
        onUpdateInitiativeScores={handleUpdateInitiativeScores}
        externalScores={auditorScores}
      />

      {/* Savings by Department */}
      <div className="card p-8 space-y-6">
        <h3 className="font-bold text-lg">Эффект по подразделениям</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {deptData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="font-medium text-[var(--text-primary)]">{d.name}</span>
                </div>
                <span className="font-bold text-success">{formatCurrency(d.value)}/мес</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Initiatives List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Приоритетные проекты внедрения</h3>
        <div className="grid grid-cols-1 gap-4">
          {evaluatedInitiatives.slice(0, 5).map(({ initiative: ini, evaluation }, idx) => {
            const roiInfo = formatRoi(ini.roi);
            const paybackInfo = formatPayback(ini.paybackMonths);
            return (
              <div 
                key={ini.id} 
                onClick={() => setSelectedInitiative(ini)}
                className="card p-6 flex flex-col md:flex-row md:items-center justify-between hover:border-accent transition-all group cursor-pointer gap-6"
              >
                <div className="flex items-start gap-5 min-w-0">
                  <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center font-bold text-lg shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="space-y-2 min-w-0">
                     <div className="flex items-center gap-3 flex-wrap">
                       <h4 className="font-bold text-lg">{ini.name}</h4>
                       <span className="text-[10px] bg-[var(--background)] px-2 py-0.5 rounded-full border border-[var(--border)] uppercase font-bold text-[var(--text-secondary)]">
                         {ini.solutionCode}
                       </span>
                       <span className="text-xs text-[var(--text-secondary)]">
                         • {ini.departmentName}
                       </span>
                     </div>

                     {/* List of covered processes */}
                     {ini.processes && ini.processes.length > 1 ? (
                       <div className="space-y-1">
                         <p className="text-xs font-semibold text-[var(--text-secondary)]">
                           Закрывает процессы ({ini.processes.length}):
                         </p>
                         <ul className="list-disc list-inside text-xs text-[var(--text-primary)] space-y-0.5 ml-1">
                           {ini.processes.map((proc, pIdx) => (
                             <li key={pIdx}>{proc}</li>
                           ))}
                         </ul>
                       </div>
                     ) : (
                       <p className="text-sm text-[var(--text-secondary)]">
                         Процесс: <span className="font-medium text-[var(--text-primary)]">{ini.processName}</span>
                       </p>
                     )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-[var(--border)] shrink-0">
                   <div className="text-right">
                     <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Приоритет (7 критериев)</p>
                     <div className="flex items-center justify-end gap-1">
                       <span className="text-lg font-bold font-mono text-accent">
                         {evaluation.overallPriority.toFixed(1)}
                       </span>
                       <span className="text-[10px] text-[var(--text-secondary)]">/ 5.0</span>
                     </div>
                     {!evaluation.isComplete && (
                       <p className="text-[9px] text-amber-600 dark:text-amber-400 mt-0.5">оценка неполная</p>
                     )}
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Возврат инвестиций (ROI)</p>
                     <p className={cn("text-lg", roiInfo.colorClass)}>{roiInfo.text}</p>
                     {roiInfo.warningText && (
                       <p className="text-[9px] text-red-500 max-w-[130px] leading-tight mt-0.5">{roiInfo.warningText}</p>
                     )}
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Окупаемость</p>
                     <p className={cn("text-lg", paybackInfo.colorClass)}>{paybackInfo.text}</p>
                     {paybackInfo.caption && (
                       <p className="text-[9px] text-amber-500 max-w-[120px] leading-tight mt-0.5">{paybackInfo.caption}</p>
                     )}
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Экономия</p>
                     <p className="text-lg font-bold">{formatCurrency(ini.monthlySavings)}/мес</p>
                   </div>
                   <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInitiative(ini);
                        }}
                        className="p-2 hover:bg-[var(--background)] rounded-full text-[var(--text-secondary)] hover:text-accent transition-colors"
                        title="Подробнее о расчете"
                      >
                        <HelpCircle size={20} />
                      </button>
                      <ChevronRight className="text-[var(--border)] group-hover:text-accent transition-colors" />
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conclusion */}
      <div className="bg-accent/5 border border-accent/20 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
         <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-accent/20">
           <Zap size={36} />
         </div>
         <div className="space-y-4">
           <h3 className="text-2xl font-bold">Резюме аналитика</h3>
           <p className="text-[var(--text-secondary)] leading-relaxed text-sm sm:text-base">
             Для компании в отрасли «{industryName}»{staff > 0 ? ` со штатом ${staff} сотрудников` : ''} выявлен потенциал прямой экономии в размере <b>{formatCurrency(totalMonthlySavings * 12)} в год</b> через внедрение <b>{initiativeCountText}</b>. 
             {deptData.length > 0 && (
               <> Наибольший экономический эффект ожидается в подразделении <b>{deptData[0]?.name}</b>.</>
             )} Срок окупаемости внедрения составляет около <b>{Math.round(avgPayback * 10) / 10} мес.</b>
           </p>
           <button onClick={onClose} className="btn-primary flex items-center gap-2">
             Вернуться к списку аудитов
             <ArrowRight size={18} />
           </button>
         </div>
      </div>
      {/* Traceability Panel */}
      {selectedInitiative && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-lg bg-[var(--surface)] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calculator className="text-accent" size={24} />
                <h3 className="font-bold text-lg">Как это получено?</h3>
              </div>
              <button onClick={() => setSelectedInitiative(null)} className="p-2 hover:bg-[var(--background)] rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
              <section className="space-y-4">
                <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Инициатива</h4>
                <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{selectedInitiative.name}</span>
                    <span className="text-[10px] bg-accent/10 text-accent font-bold px-2 py-0.5 rounded-full">{selectedInitiative.solutionCode}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">{selectedInitiative.departmentName}</p>
                  {selectedInitiative.processes && selectedInitiative.processes.length > 1 ? (
                    <div className="pt-2 border-t border-[var(--border)]">
                      <p className="text-xs font-semibold text-[var(--text-secondary)] mb-1">Закрываемые процессы:</p>
                      <ul className="list-disc list-inside text-xs space-y-1">
                        {selectedInitiative.processes.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--text-secondary)]">Процесс: {selectedInitiative.processName}</p>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Оценка по 7 критериям</h4>
                <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                    <span className="text-xs font-bold">Итоговый приоритет</span>
                    <span className="text-sm font-bold font-mono text-accent">
                      {(() => {
                        const evalRes = evaluateInitiativeSevenCriteria(selectedInitiative, completeness, initiatives);
                        return `${evalRes.overallPriority.toFixed(1)} / 5.0`;
                      })()}
                    </span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {evaluateInitiativeSevenCriteria(selectedInitiative, completeness, initiatives).criteria.map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            c.isAuditorManual ? "bg-emerald-500" : "bg-accent"
                          )} />
                          {c.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-[var(--text-secondary)] font-mono">({c.source})</span>
                          <span className="font-bold">
                            {c.score !== null ? `${c.score}/5` : 'не оценено'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Сработавшие правила</h4>
                <div className="space-y-2">
                  {selectedInitiative.trace.matchedRules.map((rule, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-success/5 border border-success/20 rounded-xl">
                      <CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" />
                      <span className="text-sm">{rule}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Расчёт экономики</h4>
                <div className="p-5 bg-accent/5 border border-accent/10 rounded-2xl space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-accent uppercase font-bold">Формула</p>
                    <code className="text-xs break-words">{selectedInitiative.trace.calculationFormula}</code>
                  </div>
                  <div className="grid grid-cols-1 gap-3 pt-4 border-t border-accent/10">
                    {selectedInitiative.trace.dataSources.map((source, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-xs text-[var(--text-secondary)]">{source.label}</span>
                        <span className="text-xs font-bold font-mono text-right">{source.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2 border-t border-accent/10">
                      <span className="text-xs text-[var(--text-secondary)]">Необходимые инвестиции</span>
                      <span className="text-xs font-bold">{formatCurrency(selectedInitiative.investment)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--text-secondary)]">Возврат инвестиций (ROI)</span>
                      <span className={cn("text-xs font-bold", formatRoi(selectedInitiative.roi).colorClass)}>
                        {formatRoi(selectedInitiative.roi).text}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--text-secondary)]">Срок окупаемости</span>
                      <span className={cn("text-xs font-bold", formatPayback(selectedInitiative.paybackMonths).colorClass)}>
                        {formatPayback(selectedInitiative.paybackMonths).text}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-accent/10">
                      <span className="text-sm font-bold">Итоговая экономия</span>
                      <span className="text-sm font-bold text-success">{formatCurrency(selectedInitiative.monthlySavings)}/мес</span>
                    </div>
                  </div>
                </div>
              </section>

              <div className="p-4 bg-warning/5 border border-warning/10 rounded-2xl flex items-start gap-3">
                <Info size={18} className="text-warning shrink-0" />
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Данные взяты напрямую из анкеты подразделения. Погрешность расчёта для режима <b>{mode === 'Full' ? '±15%' : '±30-40%'}</b>.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border)]">
              <button 
                onClick={() => setSelectedInitiative(null)}
                className="btn-primary w-full"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
