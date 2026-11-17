import React, { useState } from 'react';
import { DataTable, Column } from '../components/ui/DataTable';
import { Client } from '../types';
import { storage } from '../storage';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatCurrency } from '../lib/utils';
import { Users, Plus, Download, Upload } from 'lucide-react';
import { Drawer } from '../components/ui/Drawer';

export const ClientsView: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const clients = storage.getClients();

  const columns: Column<Client>[] = [
    { 
      key: 'name', 
      header: 'Название компании',
      sortable: true,
      render: (c) => (
        <div className="flex flex-col">
          <span className="font-semibold">{c.name}</span>
          <span className="text-[10px] text-[var(--text-secondary)]">ИНН: {c.inn}</span>
        </div>
      )
    },
    { key: 'industry', header: 'Отрасль', sortable: true },
    { key: 'size', header: 'Размер', sortable: true },
    { 
      key: 'revenue', 
      header: 'Выручка', 
      sortable: true,
      render: (c) => formatCurrency(c.revenue)
    },
    { 
      key: 'status', 
      header: 'Статус', 
      sortable: true,
      render: (c) => {
        const typeMap: Record<string, any> = {
          'клиент': 'success',
          'диагностика': 'info',
          'предложение': 'warning',
          'переговоры': 'warning',
          'отказ': 'danger',
          'заморожен': 'neutral'
        };
        return <StatusBadge label={c.status} type={typeMap[c.status] || 'neutral'} />;
      }
    },
    { 
      key: 'updatedAt', 
      header: 'Обновлено', 
      sortable: true,
      render: (c) => new Date(c.updatedAt).toLocaleDateString('ru-RU')
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 text-accent rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Клиенты</h2>
            <p className="text-sm text-[var(--text-secondary)]">Реестр компаний и контактных лиц</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Upload size={18} />
            Импорт CSV
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Добавить клиента
          </button>
        </div>
      </div>

      <DataTable 
        data={clients} 
        columns={columns} 
        onRowClick={(c) => setSelectedClient(c)}
        searchPlaceholder="Поиск по названию или ИНН..."
      />

      <Drawer
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        title={selectedClient?.name || ''}
      >
        {selectedClient && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Отрасль</p>
                 <p className="text-sm font-medium">{selectedClient.industry}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Статус</p>
                 <StatusBadge label={selectedClient.status} type="info" />
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Выручка</p>
                 <p className="text-sm font-medium">{formatCurrency(selectedClient.revenue)}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Размер</p>
                 <p className="text-sm font-medium">{selectedClient.size}</p>
               </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold border-b border-[var(--border)] pb-2 text-sm">Контактное лицо</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">ФИО</span>
                  <span className="font-medium">{selectedClient.contactName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Должность</span>
                  <span className="font-medium">{selectedClient.contactRole}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Телефон</span>
                  <span className="font-medium">{selectedClient.contactPhone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Email</span>
                  <span className="font-medium text-accent">{selectedClient.contactEmail}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
               <h4 className="font-bold border-b border-[var(--border)] pb-2 text-sm">Заметки</h4>
               <p className="text-sm text-[var(--text-secondary)] bg-[var(--background)] p-3 rounded-lg border border-[var(--border)]">
                 {selectedClient.notes || 'Заметок нет'}
               </p>
            </div>

            <div className="flex gap-3 pt-6">
              <button className="btn-primary flex-1">Редактировать</button>
              <button className="btn-secondary">Аудиты</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
