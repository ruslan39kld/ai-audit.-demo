import React, { useState } from 'react';
import { MetricCard } from '../components/ui/MetricCard';
import { storage } from '../storage';
import { formatCurrency, cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { FIELD_REGISTRY } from '../lib/fieldRegistry';
import { Drawer } from '../components/ui/Drawer';
import { runAuditAnalysis } from '../lib/auditEngine';
import { Audit } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ScoreRing } from '../components/ui/ScoreRing';
import { StatusBadge } from '../components/ui/StatusBadge';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const allAudits = storage.getAudits();
  const clients = storage.getClients();
  const allFinances = storage.getFinances();

  const isClient = user?.role === 'client';
  const clientAudits = allAudits.filter(a => a.clientId === user?.id || (user?.name && a.projectName.includes(user.name)));
  const audits = isClient
    ? (clientAudits.length > 0 ? clientAudits : allAudits.filter(a => a.clientId === 'c1'))
    : allAudits;

  const finances = user?.role === 'client'
    ? allFinances.filter(f => f.clientId === user.id)
    : allFinances;

  const totalAudits = audits.length;
  const avgScore = Math.round(audits.reduce((acc, curr) => acc + curr.totalScore, 0) / (totalAudits || 1));
  const totalRevenue = finances.reduce((acc, curr) => curr.payStatus === 'оплачен' ? acc + curr.amount : acc, 0);
  const activeAudits = audits.filter(a => a.status === 'в работе').length;

  if (user?.role === 'client') {
    const isAllCompleted = audits.length > 0 && audits.every(a => (a.completeness || 0) === 100);
    const clientStatus = isAllCompleted ? "Завершено" : "Заполняется";

    // Dynamic next steps: one item per incomplete audit
    interface NextStepItem {
      id: string;
      audit: Audit;
      title: string;
      desc: string;
      active: boolean;
    }

    const nextSteps: NextStepItem[] = [];
    const seenAuditIds = new Set<string>();

    audits.forEach(audit => {
      if (seenAuditIds.has(audit.id)) return;
      if (audit.status === 'завершён') return;

      if (audit.companyData) {
        let totalQuestions = 0;
        let filledQuestions = 0;

        // Company profile fields
        const companyFields = FIELD_REGISTRY.filter(f => f.level === 'company' && f.block !== 'Системное');
        companyFields.forEach(f => {
          totalQuestions++;
          const val = (audit.companyData!.profile as any)?.[f.key];
          if (val !== undefined && val !== null && val !== '' && (!Array.isArray(val) || val.length > 0)) {
            filledQuestions++;
          }
        });

        // Department and Process fields
        const deptFields = FIELD_REGISTRY.filter(f => f.level === 'department' && f.block !== 'Системное');
        const procFields = FIELD_REGISTRY.filter(f => f.level === 'process' && f.block !== 'Системное');

        (audit.companyData.departments || []).forEach(dept => {
          deptFields.forEach(f => {
            totalQuestions++;
            const val = (dept as any)[f.key];
            if (val !== undefined && val !== null && val !== '' && (!Array.isArray(val) || val.length > 0)) {
              filledQuestions++;
            }
          });

          (dept.processes || []).forEach(proc => {
            procFields.forEach(f => {
              totalQuestions++;
              const val = (proc as any)[f.key];
              if (val !== undefined && val !== null && val !== '' && (!Array.isArray(val) || val.length > 0)) {
                filledQuestions++;
              }
            });
          });
        });

        const remainingQuestions = Math.max(0, totalQuestions - filledQuestions);
        const completeness = audit.completeness !== undefined
          ? audit.completeness
          : (totalQuestions > 0 ? Math.round((filledQuestions / totalQuestions) * 100) : 0);

        if (remainingQuestions > 0 || completeness < 100) {
          seenAuditIds.add(audit.id);
          nextSteps.push({
            id: `audit-${audit.id}`,
            audit,
            title: `Завершить опросник: ${audit.projectName}`,
            desc: `Заполнено ${completeness}%, осталось ${remainingQuestions} вопросов`,
            active: true
          });
        }
      }
    });

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
           <div>
             <h2 className="text-3xl font-black">Привет, {user.name}!</h2>
             <p className="text-[var(--text-secondary)]">Статус вашего AI-аудита и потенциал роста</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Ваши аудиты" 
            value={totalAudits} 
            subtitle="Активные и завершенные"
          />
          <MetricCard 
            title="Индекс AI-готовности" 
            value={`${avgScore} из 100`} 
            subtitle="Зрелость процессов"
          />
          <MetricCard 
            title="Экономия (прогноз)" 
            value={formatCurrency(audits.reduce((acc, curr) => acc + curr.economics.annualProfit, 0))} 
            subtitle="Потенциал в год"
          />
          <MetricCard 
            title="Статус" 
            value={clientStatus} 
            subtitle="Текущий этап"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card p-6">
             <h3 className="text-lg font-bold mb-6">Динамика заполнения</h3>
             <div className="space-y-6">
                {audits.map(audit => (
                   <div key={audit.id} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold">{audit.projectName}</span>
                        <span className="text-accent font-bold">{audit.completeness || 0}%</span>
                      </div>
                      <div className="h-2 bg-[var(--background)] rounded-full overflow-hidden border border-[var(--border)]">
                        <div 
                          className="h-full bg-accent transition-all duration-1000" 
                          style={{ width: `${audit.completeness || 0}%` }}
                        />
                      </div>
                   </div>
                ))}
                {audits.length === 0 && (
                  <p className="text-center text-[var(--text-secondary)] py-12">У вас пока нет активных аудитов</p>
                )}
             </div>
          </div>

          <div className="card p-6">
             <h3 className="text-lg font-bold mb-6">Ближайшие шаги</h3>
             <div className="space-y-4">
                {nextSteps.slice(0, 3).map((step, idx) => (
                   <div 
                     key={step.id} 
                     onClick={() => setSelectedAudit(step.audit)}
                     className={cn(
                       "flex gap-4 items-start p-4 rounded-xl border cursor-pointer transition-all hover:border-accent hover:shadow-xs group",
                       step.active 
                         ? "bg-accent/5 border-accent/20" 
                         : "bg-[var(--background)] border-[var(--border)] opacity-75"
                     )}
                   >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-transform group-hover:scale-105",
                        step.active 
                          ? "bg-accent text-white" 
                          : "bg-[var(--border)] text-[var(--text-secondary)]"
                      )}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="font-bold text-sm text-[var(--text-primary)] group-hover:text-accent transition-colors truncate">
                           {step.title}
                         </p>
                         <p className="text-xs text-[var(--text-secondary)] mt-0.5">{step.desc}</p>
                      </div>
                   </div>
                ))}
                {nextSteps.length > 3 && (
                  <p className="text-xs text-[var(--text-secondary)] text-center pt-2 font-medium">
                    и ещё {nextSteps.length - 3}
                  </p>
                )}
                {nextSteps.length === 0 && (
                  <p className="text-sm text-[var(--text-secondary)] py-8 text-center">Нет запланированных шагов</p>
                )}
             </div>
          </div>
        </div>

        <Drawer
          isOpen={!!selectedAudit}
          onClose={() => setSelectedAudit(null)}
          title={selectedAudit ? `${selectedAudit.number}: ${selectedAudit.projectName}` : ''}
        >
          {selectedAudit && (
            <div className="space-y-8">
              <div className="flex items-center justify-between bg-[var(--background)] p-6 rounded-2xl border border-[var(--border)]">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Итоговый балл</p>
                  <p className="text-lg font-bold text-accent">{selectedAudit.verdict}</p>
                </div>
                <ScoreRing score={selectedAudit.totalScore} size={80} strokeWidth={8} />
              </div>

              <div className="space-y-4">
                <h4 className="font-bold border-b border-[var(--border)] pb-2 text-sm">Резюме</h4>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {selectedAudit.summary}
                </p>
              </div>

              {selectedAudit.companyData && (
                <div className="space-y-4">
                  <h4 className="font-bold border-b border-[var(--border)] pb-2 text-sm">Параметры компании</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-[var(--background)] p-3 rounded-lg border border-[var(--border)]">
                      <p className="text-[var(--text-secondary)] uppercase font-bold text-[9px]">Отрасль</p>
                      <p className="font-medium">{selectedAudit.companyData.profile.industry}</p>
                    </div>
                    <div className="bg-[var(--background)] p-3 rounded-lg border border-[var(--border)]">
                      <p className="text-[var(--text-secondary)] uppercase font-bold text-[9px]">Штат (аудит)</p>
                      <p className="font-medium">{selectedAudit.companyData.profile.auditStaff} чел.</p>
                    </div>
                    <div className="bg-[var(--background)] p-3 rounded-lg border border-[var(--border)]">
                      <p className="text-[var(--text-secondary)] uppercase font-bold text-[9px]">Подразделений</p>
                      <p className="font-medium">{selectedAudit.companyData.departments.length}</p>
                    </div>
                    <div className="bg-[var(--background)] p-3 rounded-lg border border-[var(--border)]">
                      <p className="text-[var(--text-secondary)] uppercase font-bold text-[9px]">География</p>
                      <p className="font-medium">{selectedAudit.companyData.profile.geography}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-bold border-b border-[var(--border)] pb-2 text-sm">Экономика</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--background)] p-3 rounded-lg border border-[var(--border)]">
                    <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">
                      {selectedAudit.type === 'AI-аудит компании' ? 'Годовая экономия' : 'Годовая прибыль'}
                    </p>
                    <p className="text-sm font-semibold">{formatCurrency(selectedAudit.economics.annualProfit)}</p>
                  </div>
                  <div className="bg-[var(--background)] p-3 rounded-lg border border-[var(--border)]">
                    <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Окупаемость</p>
                    <p className="text-sm font-semibold">{selectedAudit.economics.paybackMonths} мес.</p>
                  </div>
                </div>
              </div>

              {selectedAudit.companyData && (
                <div className="space-y-4">
                  <h4 className="font-bold border-b border-[var(--border)] pb-2 text-sm">Ключевые инициативы</h4>
                  <div className="space-y-2">
                    {runAuditAnalysis(selectedAudit.companyData).initiatives.slice(0, 3).map(ini => (
                      <div key={ini.id} className="p-3 bg-[var(--background)] border border-[var(--border)] rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold">{ini.name}</p>
                          <p className="text-[var(--text-secondary)]">{ini.departmentName}</p>
                        </div>
                        <span className="font-bold text-accent">{formatCurrency(ini.monthlySavings)}/мес</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Drawer>
      </div>
    );
  }

  const chartData = [
    { name: 'Март', audits: 1, revenue: 350000 },
    { name: 'Апр', audits: 2, revenue: 700000 },
    { name: 'Май', audits: 2, revenue: 500000 },
    { name: 'Июн', audits: 3, revenue: 1100000 },
    { name: 'Июл', audits: 2, revenue: 800000 },
    { name: 'Авг', audits: 2, revenue: 1400000 },
  ];

  const industryData = [
    { name: 'Строительство', value: 2 },
    { name: 'Логистика', value: 2 },
    { name: 'Производство', value: 3 },
    { name: 'Ритейл', value: 2 },
    { name: 'HR', value: 1 },
    { name: 'Остальное', value: 2 },
  ];

  const COLORS = ['#1E5EFF', '#12B76A', '#F79009', '#F04438', '#667085', '#9AA0A6'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Всего аудитов" 
          value={totalAudits} 
          delta={{ value: 12, isPositive: true }}
          subtitle="За всё время"
        />
        <MetricCard 
          title="Средний балл" 
          value={`${avgScore}`} 
          delta={{ value: 3, isPositive: true }}
          subtitle="Качество проектов"
        />
        <MetricCard 
          title="Выручка (оплачено)" 
          value={formatCurrency(totalRevenue)} 
          delta={{ value: 8, isPositive: true }}
          subtitle="За последние 6 мес."
        />
        <MetricCard 
          title="В работе" 
          value={activeAudits} 
          subtitle="Активные процессы"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-6">Динамика аудитов и выручки</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px' }}
                />
                <Line type="monotone" dataKey="audits" stroke="var(--color-accent)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold mb-6">Распределение по отраслям</h3>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={industryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {industryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-bold mb-6">Последние аудиты</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--background)] border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-3 font-semibold text-[var(--text-secondary)]">Проект</th>
                <th className="px-4 py-3 font-semibold text-[var(--text-secondary)]">Балл</th>
                <th className="px-4 py-3 font-semibold text-[var(--text-secondary)]">Статус</th>
                <th className="px-4 py-3 font-semibold text-[var(--text-secondary)]">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {audits.slice(0, 5).map(a => (
                <tr key={a.id} className="hover:bg-[var(--background)] transition-colors">
                  <td className="px-4 py-4 font-medium">{a.projectName}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <ScoreRing score={a.totalScore} size={30} strokeWidth={3} />
                      <span className="text-xs font-bold">{a.totalScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge label={a.status} type={a.status === 'оплачен' ? 'success' : 'info'} />
                  </td>
                  <td className="px-4 py-4 text-[var(--text-secondary)]">
                    {new Date(a.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
