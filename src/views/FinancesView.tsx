import React from 'react';
import { DataTable, Column } from '../components/ui/DataTable';
import { FinanceRecord } from '../types';
import { storage } from '../storage';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatCurrency } from '../lib/utils';
import { RussianRuble, Plus, Download, TrendingUp } from 'lucide-react';
import { MetricCard } from '../components/ui/MetricCard';
import { exportFinancesRegistryCsv } from '../lib/pdfReportGenerator';

export const FinancesView: React.FC = () => {
  const finances = storage.getFinances();
  const clients = storage.getClients();

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Неизвестен';

  const totalRevenue = finances.reduce((acc, curr) => curr.payStatus === 'оплачен' ? acc + curr.amount : acc, 0);
  const receivables = finances.reduce((acc, curr) => curr.payStatus === 'выставлен' || curr.payStatus === 'просрочен' ? acc + curr.amount : acc, 0);

  const columns: Column<FinanceRecord>[] = [
    { 
      key: 'date', 
      header: 'Дата',
      sortable: true,
      render: (f) => new Date(f.date).toLocaleDateString('ru-RU')
    },
    { 
      key: 'clientId', 
      header: 'Клиент',
      sortable: true,
      render: (f) => (
        <div className="flex flex-col">
          <span className="font-semibold">{getClientName(f.clientId)}</span>
          <span className="text-[10px] text-[var(--text-secondary)]">{f.service}</span>
        </div>
      )
    },
    { key: 'type', header: 'Тип', sortable: true },
    { 
      key: 'amount', 
      header: 'Сумма', 
      sortable: true,
      render: (f) => <span className="font-bold">{formatCurrency(f.amount)}</span>
    },
    { 
      key: 'payStatus', 
      header: 'Статус', 
      sortable: true,
      render: (f) => {
        const typeMap: Record<string, any> = {
          'оплачен': 'success',
          'выставлен': 'info',
          'просрочен': 'danger',
          'отменён': 'neutral'
        };
        return <StatusBadge label={f.payStatus} type={typeMap[f.payStatus] || 'neutral'} />;
      }
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 text-accent rounded-xl">
            <RussianRuble size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Финансы</h2>
            <p className="text-sm text-[var(--text-secondary)]">Учет платежей, подписок и дебиторской задолженности</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => exportFinancesRegistryCsv(finances, clients)} 
            className="btn-secondary flex items-center gap-2"
            title="Выгрузить реестр платежей в CSV"
          >
            <Download size={18} />
            Экспорт
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Выручка (оплачено)" value={formatCurrency(totalRevenue)} />
        <MetricCard title="Дебиторка" value={formatCurrency(receivables)} className="border-danger/20" />
        <MetricCard title="Прогноз месяца" value={formatCurrency(totalRevenue + receivables)} delta={{ value: 15, isPositive: true }} />
      </div>

      <DataTable 
        data={finances} 
        columns={columns} 
        searchPlaceholder="Поиск по клиенту или услуге..."
      />
    </div>
  );
};
