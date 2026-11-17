import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  FileText, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { storage } from '../storage';
import { AI_SOLUTIONS } from '../auditMetadata';
import { calculateAiMaturityLevel } from '../lib/aiMaturity';
import { runAuditAnalysis } from '../lib/auditEngine';
import { Audit, AuditStatus } from '../types';
import { exportReportsAnalyticsCsv } from '../lib/pdfReportGenerator';

export const ReportsView: React.FC = () => {
  const [downloadToast, setDownloadToast] = useState(false);
  const audits = storage.getAudits();
  const clients = storage.getClients();

  // -------------------------------------------------------------
  // БЛОК 1: Аудиты по статусам
  // -------------------------------------------------------------
  const STATUS_ORDER: { status: AuditStatus; label: string; colorClass: string; barClass: string }[] = [
    { status: 'черновик', label: 'Черновик', colorClass: 'text-zinc-500 dark:text-zinc-400 bg-zinc-500/10 border-zinc-500/20', barClass: 'bg-zinc-400' },
    { status: 'в работе', label: 'В работе', colorClass: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20', barClass: 'bg-sky-500' },
    { status: 'завершён', label: 'Завершён', colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20', barClass: 'bg-emerald-500' },
    { status: 'согласован', label: 'Согласован', colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20', barClass: 'bg-amber-500' },
    { status: 'оплачен', label: 'Оплачен', colorClass: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20', barClass: 'bg-purple-600' }
  ];

  const totalAuditsCount = audits.length;

  const auditsByStatus = useMemo(() => {
    return STATUS_ORDER.map(item => {
      const count = audits.filter(a => a.status === item.status).length;
      const share = totalAuditsCount > 0 ? (count / totalAuditsCount) * 100 : 0;
      return {
        ...item,
        count,
        share
      };
    });
  }, [audits, totalAuditsCount]);

  // -------------------------------------------------------------
  // БЛОК 2: Где останавливаются клиенты (незавершённые аудиты)
  // -------------------------------------------------------------
  const WIZARD_STEPS = [
    { id: 1, key: 'format', title: 'Выбор формата', shortTitle: 'Формат' },
    { id: 2, key: 'profile', title: 'Профиль компании', shortTitle: 'Профиль' },
    { id: 3, key: 'perimeter', title: 'Периметр аудита', shortTitle: 'Периметр' },
    { id: 4, key: 'collection', title: 'Сбор данных', shortTitle: 'Сбор данных' },
    { id: 5, key: 'summary', title: 'Сводка и запуск', shortTitle: 'Сводка' }
  ];

  const unfinishedAudits = useMemo(() => {
    return audits.filter(a => a.status === 'черновик' || a.status === 'в работе');
  }, [audits]);

  const wizardStepDistribution = useMemo(() => {
    // Определяем шаг для каждого незавершённого аудита
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let determinedCount = 0;

    unfinishedAudits.forEach(audit => {
      let step: number | null = null;
      const anyAudit = audit as any;

      if (typeof anyAudit.wizardStep === 'number' && anyAudit.wizardStep >= 1 && anyAudit.wizardStep <= 5) {
        step = anyAudit.wizardStep;
      } else if (typeof anyAudit.step === 'number' && anyAudit.step >= 1 && anyAudit.step <= 5) {
        step = anyAudit.step;
      } else if (typeof anyAudit.wizardStep === 'string') {
        const str = anyAudit.wizardStep.toLowerCase();
        if (str.includes('формат') || str === 'format') step = 1;
        else if (str.includes('профил') || str === 'profile') step = 2;
        else if (str.includes('периметр') || str === 'perimeter') step = 3;
        else if (str.includes('сбор') || str === 'collection' || str === 'data') step = 4;
        else if (str.includes('сводк') || str === 'summary') step = 5;
      } else if (audit.companyData) {
        const cd = audit.companyData;
        if (!cd.format) step = 1;
        else if (!cd.profile?.industry) step = 2;
        else if (!cd.departments || cd.departments.length === 0) step = 3;
        else {
          const hasIncomplete = cd.departments.some(d => !d.processes || d.processes.length === 0 || !d.ai_level);
          step = hasIncomplete ? 4 : 5;
        }
      }

      if (step !== null) {
        counts[step] = (counts[step] || 0) + 1;
        determinedCount++;
      }
    });

    return {
      hasData: determinedCount > 0,
      totalDetermined: determinedCount,
      steps: WIZARD_STEPS.map(ws => ({
        ...ws,
        count: counts[ws.id] || 0,
        share: determinedCount > 0 ? ((counts[ws.id] || 0) / determinedCount) * 100 : 0
      }))
    };
  }, [unfinishedAudits]);

  // -------------------------------------------------------------
  // БЛОК 3: Востребованные решения (S01–S16)
  // -------------------------------------------------------------
  const solutionStats = useMemo(() => {
    // Подсчитываем, в скольких аудитах каждое решение встречается в отчётах
    const solutionAuditCounts: Record<string, number> = {};
    AI_SOLUTIONS.forEach(sol => {
      solutionAuditCounts[sol.code] = 0;
    });

    let auditsWithRecommendations = 0;

    audits.forEach(audit => {
      const matchedCodes = new Set<string>();

      if (audit.companyData) {
        try {
          const analysis = runAuditAnalysis(audit.companyData);
          if (analysis && Array.isArray(analysis.initiatives)) {
            analysis.initiatives.forEach(ini => {
              if (ini.solutionCode && solutionAuditCounts[ini.solutionCode] !== undefined) {
                matchedCodes.add(ini.solutionCode);
              }
            });
          }
        } catch {
          // безопасный пропуск при некорректных внутренних данных
        }
      }

      if (Array.isArray((audit as any).solutions)) {
        (audit as any).solutions.forEach((code: string) => {
          if (solutionAuditCounts[code] !== undefined) {
            matchedCodes.add(code);
          }
        });
      }

      if (matchedCodes.size > 0) {
        auditsWithRecommendations++;
        matchedCodes.forEach(code => {
          solutionAuditCounts[code] = (solutionAuditCounts[code] || 0) + 1;
        });
      }
    });

    const list = AI_SOLUTIONS.map(sol => ({
      code: sol.code,
      name: sol.name,
      description: sol.description,
      auditsCount: solutionAuditCounts[sol.code] || 0
    })).sort((a, b) => b.auditsCount - a.auditsCount || a.code.localeCompare(b.code));

    const hasData = list.some(s => s.auditsCount > 0);

    return {
      hasData,
      totalAuditsWithRecommendations: auditsWithRecommendations,
      list
    };
  }, [audits]);

  // -------------------------------------------------------------
  // БЛОК 4: Уровни использования ИИ у клиентов
  // -------------------------------------------------------------
  const MATURITY_LEVELS_INFO = [
    { level: 0, name: 'Нулевой', desc: 'ИИ не используется' },
    { level: 1, name: 'Теневой', desc: 'Личные аккаунты, нет регламентов' },
    { level: 2, name: 'Стихийный', desc: 'Пилоты без стратегии' },
    { level: 3, name: 'Управляемый доступ', desc: 'Корпоративный доступ с правилами' },
    { level: 4, name: 'Регламентированный', desc: 'Встроен в процессы и регламентирован' },
    { level: 5, name: 'Встроенный', desc: 'Сквозная интеграция в операции' }
  ];

  const maturityStats = useMemo(() => {
    let totalDepartments = 0;
    const levelCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const shadowCompanies = new Set<string>();

    audits.forEach(audit => {
      const client = clients.find(c => c.id === audit.clientId);
      const companyIdentifier = client?.name || audit.projectName || audit.number;

      if (audit.companyData && Array.isArray(audit.companyData.departments) && audit.companyData.departments.length > 0) {
        audit.companyData.departments.forEach(dept => {
          totalDepartments++;
          const maturityResult = calculateAiMaturityLevel(dept, audit.companyData?.format);
          const lvl = maturityResult.level !== null && maturityResult.level >= 0 && maturityResult.level <= 5
            ? maturityResult.level
            : null;

          if (lvl !== null) {
            levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
            if (lvl === 1) {
              shadowCompanies.add(companyIdentifier);
            }
          }
        });
      }
    });

    return {
      hasData: totalDepartments > 0,
      totalDepartments,
      shadowCompaniesCount: shadowCompanies.size,
      levels: MATURITY_LEVELS_INFO.map(item => ({
        ...item,
        count: levelCounts[item.level] || 0,
        share: totalDepartments > 0 ? ((levelCounts[item.level] || 0) / totalDepartments) * 100 : 0
      }))
    };
  }, [audits, clients]);

  const handleExportSummary = () => {
    exportReportsAnalyticsCsv({
      statusDistribution: auditsByStatus,
      wizardStepsDistribution: wizardStepDistribution.steps,
      topSolutions: solutionStats.list,
      maturityDistribution: maturityStats.levels
    });
    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 2500);
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
            <BarChart3 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Отчёты и аналитика</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Фактическая статистика на основе данных реестра аудитов
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {downloadToast && (
            <span className="flex items-center gap-1.5 text-xs text-success font-medium animate-in fade-in">
              <CheckCircle2 size={15} /> Сводка экспортирована
            </span>
          )}

          <button
            onClick={handleExportSummary}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
          >
            <Download size={16} />
            <span>Экспорт отчётов</span>
          </button>
        </div>
      </div>

      {/* Grid of 4 Core Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* БЛОК 1: Аудиты по статусам */}
        <div className="card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-1 border-b border-[var(--border)] pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-accent" />
                <h3 className="font-bold text-base">Аудиты по статусам</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent/10 text-accent">
                Всего: {totalAuditsCount}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Количество и доля аудитов в каждом статусе жизненного цикла
            </p>
          </div>

          {totalAuditsCount === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--text-secondary)]">
              Пока нет данных
            </div>
          ) : (
            <div className="space-y-4">
              {auditsByStatus.map(item => (
                <div key={item.status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${item.colorClass}`}>
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[var(--text-primary)]">{item.count}</span>
                      <span className="text-[var(--text-secondary)] w-12 text-right">
                        {item.share.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-[var(--background)] rounded-full overflow-hidden border border-[var(--border)]">
                    <div 
                      className={`h-full transition-all duration-500 ${item.barClass}`}
                      style={{ width: `${item.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)] flex justify-between items-center">
            <span>Источник: статус аудитов в базе</span>
            <span>{totalAuditsCount} записей</span>
          </div>
        </div>

        {/* БЛОК 2: Где останавливаются клиенты */}
        <div className="card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-1 border-b border-[var(--border)] pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-sky-500" />
                <h3 className="font-bold text-base">Где останавливаются клиенты</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 border border-sky-500/20">
                Незавершённых: {unfinishedAudits.length}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Распределение незавершённых аудитов по шагам мастера заполнения
            </p>
          </div>

          {!wizardStepDistribution.hasData ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
              <HelpCircle size={32} className="text-[var(--text-secondary)] opacity-40" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">Пока нет данных</p>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm">
                У текущих {unfinishedAudits.length} незавершённых аудитов в базе пока нет зафиксированных шагов визарда. Шаги сохраняются при прохождении опроса.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {wizardStepDistribution.steps.map(step => (
                <div key={step.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--text-primary)]">
                      Шаг {step.id}: {step.title}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{step.count}</span>
                      <span className="text-[var(--text-secondary)] w-12 text-right">
                        {step.share.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-[var(--background)] rounded-full overflow-hidden border border-[var(--border)]">
                    <div 
                      className="h-full bg-sky-500 transition-all duration-500"
                      style={{ width: `${step.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)] flex justify-between items-center">
            <span>Аудиты со статусом «черновик» и «в работе»</span>
            <span>{unfinishedAudits.length} аудитов</span>
          </div>
        </div>

        {/* БЛОК 3: Востребованные решения (S01–S16) */}
        <div className="card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-1 border-b border-[var(--border)] pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-purple-500" />
                <h3 className="font-bold text-base">Востребованные решения</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
                Каталог S01–S16
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Какие решения из S01–S16 чаще всего попадают в отчёты аудитов (сортировка по убыванию)
            </p>
          </div>

          {!solutionStats.hasData ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
              <Layers size={32} className="text-[var(--text-secondary)] opacity-40" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">Пока нет данных</p>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm">
                В отчётах существующих аудитов пока нет сгенерированных рекомендаций решений S01–S16. Рекомендации формируются при завершении аудита через движок правил.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {solutionStats.list
                .filter(s => s.auditsCount > 0)
                .map(sol => (
                  <div 
                    key={sol.code} 
                    className="p-3 bg-[var(--background)] rounded-xl border border-[var(--border)] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-bold text-xs px-2 py-1 bg-accent/10 text-accent rounded-lg shrink-0">
                        {sol.code}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-[var(--text-primary)] truncate">
                          {sol.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-[var(--text-primary)]">{sol.auditsCount}</span>
                      <span className="text-[11px] text-[var(--text-secondary)]">ауд.</span>
                    </div>
                  </div>
                ))}
            </div>
          )}

          <div className="pt-2 border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)] flex justify-between items-center">
            <span>Источник: анализ инициатив и решений аудитов</span>
            <span>16 решений</span>
          </div>
        </div>

        {/* БЛОК 4: Уровни использования ИИ у клиентов */}
        <div className="card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-1 border-b border-[var(--border)] pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-500" />
                <h3 className="font-bold text-base">Уровни использования ИИ у клиентов</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Зрелость 0–5
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Распределение подразделений по шести уровням зрелости использования ИИ
            </p>
          </div>

          {!maturityStats.hasData ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
              <ShieldAlert size={32} className="text-[var(--text-secondary)] opacity-40" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">Пока нет данных</p>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm">
                В базе пока нет подразделений с заполненными опросниками по использованию ИИ. Данные рассчитываются алгоритмом при анкетировании отделов.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Выделенный акцентный блок: Уровень 1 «Теневой» */}
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={16} className="text-amber-500 shrink-0" />
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      Компаний на уровне 1 «Теневой»: {maturityStats.shadowCompaniesCount}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    Риск утечки
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] italic">
                  самая быстрая продажа: разговор про утечку данных
                </p>
              </div>

              {/* Распределение подразделений по 6 уровням */}
              <div className="space-y-3">
                {maturityStats.levels.map(lvl => (
                  <div key={lvl.level} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[var(--text-primary)]">
                        {lvl.level}. {lvl.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{lvl.count} подр.</span>
                        <span className="text-[var(--text-secondary)] w-12 text-right">
                          {lvl.share.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[var(--background)] rounded-full overflow-hidden border border-[var(--border)]">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          lvl.level === 1 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${lvl.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)] flex justify-between items-center">
            <span>Источник: алгоритм расчёта зрелости подразделений</span>
            <span>{maturityStats.totalDepartments} подразделений</span>
          </div>
        </div>

      </div>
    </div>
  );
};

