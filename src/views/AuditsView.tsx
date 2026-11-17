import React, { useState } from 'react';
import { DataTable, Column } from '../components/ui/DataTable';
import { Audit } from '../types';
import { storage } from '../storage';
import { runAuditAnalysis } from '../lib/auditEngine';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ScoreRing } from '../components/ui/ScoreRing';
import { formatCurrency } from '../lib/utils';
import { FileText, Plus, Download, ListOrdered, CheckSquare, Eye } from 'lucide-react';
import { Drawer } from '../components/ui/Drawer';
import { useAuth } from '../contexts/AuthContext';
import { AuditStagesModal } from '../components/AuditStagesModal';
import { exportAuditsRegistryCsv, generatePaidAuditPdfReport, generateExpressAuditPdfReport } from '../lib/pdfReportGenerator';
import { AuditResultsView } from './AuditResultsView';

export const AuditsView: React.FC = () => {
  const { user } = useAuth();
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [stagesAudit, setStagesAudit] = useState<Audit | null>(null);
  const [viewingResultsAudit, setViewingResultsAudit] = useState<Audit | null>(null);
  const allAudits = storage.getAudits();
  const clients = storage.getClients();

  const isClient = user?.role === 'client';
  const isAuditor = user?.role === 'auditor' || !isClient;
  const clientAudits = allAudits.filter(a => a.clientId === user.id || (user.name && a.projectName.includes(user.name)));
  const audits = isClient
    ? (clientAudits.length > 0 ? clientAudits : allAudits.filter(a => a.clientId === 'c1'))
    : allAudits;

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name;

  const baseColumns: Column<Audit>[] = [
    { 
      key: 'number', 
      header: '№',
      sortable: true,
      render: (a) => <span className="font-mono text-xs font-bold text-accent">{a.number}</span>
    },
    { 
      key: 'projectName', 
      header: 'Проект',
      sortable: true,
      render: (a) => {
        const clientName = getClientName(a.clientId);
        return (
          <div className="flex flex-col">
            <span className="font-semibold">{a.projectName}</span>
            {clientName && (
              <span className="text-[10px] text-[var(--text-secondary)]">{clientName}</span>
            )}
          </div>
        );
      }
    },
    { 
      key: 'type', 
      header: 'Формат', 
      sortable: true,
      render: (a) => {
        const isExpress = a.auditFormat === 'express' || a.type === 'Бесплатная экспресс-оценка AI-готовности' || a.type === 'Экспресс-диагностика';
        if (isExpress) {
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 border border-sky-500/20 whitespace-nowrap">
              Бесплатная экспресс-оценка
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20 whitespace-nowrap">
            Комплексный AI-аудит
          </span>
        );
      }
    },
    { 
      key: 'totalScore', 
      header: 'Балл', 
      sortable: true,
      render: (a) => <ScoreRing score={a.totalScore} size={36} strokeWidth={4} />
    },
    { 
      key: 'status', 
      header: 'Статус', 
      sortable: true,
      render: (a) => {
        const typeMap: Record<string, any> = {
          'оплачен': 'success',
          'завершён': 'success',
          'в работе': 'info',
          'согласован': 'warning',
          'черновик': 'neutral'
        };
        return <StatusBadge label={a.status} type={typeMap[a.status] || 'neutral'} />;
      }
    }
  ];

  const columns: Column<Audit>[] = isClient
    ? baseColumns
    : [
        ...baseColumns,
        { 
          key: 'amount', 
          header: 'Сумма', 
          sortable: true,
          render: (a) => a.amount > 0 ? formatCurrency(a.amount) : '—'
        },
        {
          key: 'actions' as any,
          header: 'Действия',
          render: (a) => {
            const isComprehensive = a.auditFormat === 'comprehensive' || (!a.auditFormat && a.type !== 'Бесплатная экспресс-оценка AI-готовности' && a.type !== 'Экспресс-диагностика');
            if (!isComprehensive) return null;
            return (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setStagesAudit(a);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 hover:bg-accent text-accent hover:text-white transition-colors text-xs font-semibold border border-accent/20"
                title="Этапы работ комплексного аудита"
              >
                <CheckSquare size={13} />
                <span>Этапы работ</span>
              </button>
            );
          }
        }
      ];

  const isSelectedAuditComprehensive = selectedAudit && (
    selectedAudit.auditFormat === 'comprehensive' || 
    (!selectedAudit.auditFormat && selectedAudit.type !== 'Бесплатная экспресс-оценка AI-готовности' && selectedAudit.type !== 'Экспресс-диагностика')
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 text-accent rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Аудиты</h2>
            <p className="text-sm text-[var(--text-secondary)]">Реестр проведенных оценок и отчетов</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isClient && (
            <button 
              onClick={() => exportAuditsRegistryCsv(audits)} 
              className="btn-secondary flex items-center gap-2"
              title="Выгрузить реестр аудитов в CSV"
            >
              <Download size={18} />
              Экспорт
            </button>
          )}
        </div>
      </div>

      <DataTable 
        data={audits} 
        columns={columns} 
        onRowClick={(a) => setSelectedAudit(a)}
        searchPlaceholder="Поиск по номеру, названию или клиенту..."
      />

      <Drawer
        isOpen={!!selectedAudit}
        onClose={() => setSelectedAudit(null)}
        title={`${selectedAudit?.number}: ${selectedAudit?.projectName}`}
      >
        {selectedAudit && (
          <div className="space-y-8">
            {/* Header Stage Action Banner for Comprehensive Audits in Auditor View */}
            {isAuditor && isSelectedAuditComprehensive && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-accent/15 via-purple-500/10 to-accent/5 border border-accent/30 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-wider">
                    <CheckSquare size={14} />
                    <span>Управление проектом</span>
                  </div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    Этапы работ комплексного аудита
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    9 этапов: диагностика, интервью, оптимизация, AI-готовность, пилот
                  </p>
                </div>
                <button
                  onClick={() => setStagesAudit(selectedAudit)}
                  className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shrink-0 shadow-md"
                >
                  <ListOrdered size={15} />
                  <span>Этапы работ</span>
                </button>
              </div>
            )}

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
                    <div key={ini.id} className="p-2 bg-[var(--background)] rounded-lg border border-[var(--border)] flex justify-between items-center">
                       <div className="text-[10px]">
                         <p className="font-bold">{ini.name}</p>
                         <p className="text-[var(--text-secondary)]">{ini.departmentName}</p>
                       </div>
                       <p className="text-[10px] font-bold text-success">{formatCurrency(ini.monthlySavings)}/мес</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-6 flex-wrap">
              {isAuditor && isSelectedAuditComprehensive && (
                <button 
                  onClick={() => setStagesAudit(selectedAudit)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <CheckSquare size={16} />
                  <span>Этапы работ</span>
                </button>
              )}
              {selectedAudit.companyData && (
                <button 
                  onClick={() => setViewingResultsAudit(selectedAudit)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-1.5"
                >
                  <Eye size={16} />
                  <span>Полный отчет</span>
                </button>
              )}
              {selectedAudit.companyData && (
                <button 
                  onClick={() => {
                    const compData = selectedAudit.companyData;
                    if (!compData) return;
                    const an = runAuditAnalysis(compData);
                    if (compData.format === 'express') {
                      generateExpressAuditPdfReport(compData, an, user);
                    } else {
                      generatePaidAuditPdfReport(compData, an, user);
                    }
                  }}
                  className="btn-secondary flex items-center justify-center gap-1.5"
                  title="Сформировать печатный PDF отчет"
                >
                  <Download size={16} />
                  <span>Экспорт PDF</span>
                </button>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Full Audit Results Modal */}
      {viewingResultsAudit?.companyData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6 relative">
            <AuditResultsView 
              data={viewingResultsAudit.companyData} 
              onClose={() => setViewingResultsAudit(null)} 
            />
          </div>
        </div>
      )}

      {/* Audit Stages Modal for Comprehensive Audits */}
      {stagesAudit && (
        <AuditStagesModal
          audit={stagesAudit}
          isOpen={!!stagesAudit}
          onClose={() => setStagesAudit(null)}
          onAuditUpdated={(updated) => {
            setStagesAudit(updated);
            if (selectedAudit?.id === updated.id) {
              setSelectedAudit(updated);
            }
          }}
        />
      )}
    </div>
  );
};
