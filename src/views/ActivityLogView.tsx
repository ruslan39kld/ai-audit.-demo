import React, { useState } from 'react';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  User, 
  FileText, 
  Database,
  ArrowDownToLine,
  RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LogEntry {
  id: string;
  time: string;
  user: string;
  role: 'admin' | 'auditor' | 'system';
  action: string;
  category: 'auth' | 'audit' | 'rules' | 'export' | 'system';
  status: 'success' | 'warning' | 'info';
  details?: string;
}

export const ActivityLogView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const logs: LogEntry[] = [
    {
      id: 'log-1',
      time: 'Сегодня, 10:48',
      user: 'Главный Администратор',
      role: 'admin',
      action: 'Проверка целостности правил подбора',
      category: 'rules',
      status: 'success',
      details: 'Все 38 правил синхронизированы с реестром полей. Ошибок: 0'
    },
    {
      id: 'log-2',
      time: 'Сегодня, 10:32',
      user: 'Главный Администратор',
      role: 'admin',
      action: 'Успешная авторизация в системе',
      category: 'auth',
      status: 'success',
      details: 'Вход с IP 192.168.1.42 (Сессия активна)'
    },
    {
      id: 'log-3',
      time: 'Сегодня, 09:40',
      user: 'Алексей Смирнов',
      role: 'auditor',
      action: 'Расчёт аудита готовности процессов',
      category: 'audit',
      status: 'success',
      details: 'Аудит «Логистика и складской комплекс»: рекомендованы S04, S09'
    },
    {
      id: 'log-4',
      time: 'Вчера, 18:15',
      user: 'Елена Васильева',
      role: 'auditor',
      action: 'Генерация аналитического отчёта',
      category: 'export',
      status: 'success',
      details: 'Экспорт PDF-отчёта и паспорта проекта для ООО «Ритейл Групп»'
    },
    {
      id: 'log-5',
      time: 'Вчера, 16:50',
      user: 'Система',
      role: 'system',
      action: 'Резервное копирование базы данных',
      category: 'system',
      status: 'success',
      details: 'Локальный снимок данных создан успешно'
    },
    {
      id: 'log-6',
      time: '2 дня назад, 14:20',
      user: 'Главный Администратор',
      role: 'admin',
      action: 'Калибровка справочника цен',
      category: 'rules',
      status: 'info',
      details: 'Обновлены нормативные диапазоны для решений S01, S04'
    }
  ];

  const filteredLogs = logs.filter(log => {
    const matchesCat = selectedCategory === 'all' || log.category === selectedCategory;
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
            <HistoryIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Журнал действий</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Аудит безопасности, фиксация изменений системных настроек и действий пользователей
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--border)] px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>Служба логирования активна</span>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              selectedCategory === 'all'
                ? "bg-accent text-white"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background)]"
            )}
          >
            Все события ({logs.length})
          </button>
          <button
            onClick={() => setSelectedCategory('rules')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              selectedCategory === 'rules'
                ? "bg-accent text-white"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background)]"
            )}
          >
            Настройки и правила
          </button>
          <button
            onClick={() => setSelectedCategory('audit')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              selectedCategory === 'audit'
                ? "bg-accent text-white"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background)]"
            )}
          >
            Аудиты
          </button>
          <button
            onClick={() => setSelectedCategory('auth')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              selectedCategory === 'auth'
                ? "bg-accent text-white"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background)]"
            )}
          >
            Авторизация
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
          <input
            type="text"
            placeholder="Поиск по журналу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Log Entries Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--background)] border-b border-[var(--border)] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 w-40">Время</th>
                <th className="px-5 py-3.5 w-56">Инициатор</th>
                <th className="px-5 py-3.5">Действие</th>
                <th className="px-5 py-3.5">Детали</th>
                <th className="px-5 py-3.5 w-24">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredLogs.map(entry => (
                <tr key={entry.id} className="hover:bg-[var(--background)]/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-[var(--text-secondary)] flex items-center gap-2">
                    <Clock size={13} />
                    <span>{entry.time}</span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[var(--text-primary)]">{entry.user}</p>
                    <span className="text-[10px] text-[var(--text-secondary)] uppercase">
                      {entry.role === 'admin' ? 'Администратор' : entry.role === 'auditor' ? 'Аудитор' : 'Система'}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-[var(--text-primary)]">
                    {entry.action}
                  </td>
                  <td className="px-5 py-4 text-[var(--text-secondary)] text-[11px]">
                    {entry.details || '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-[11px] text-success font-medium">
                      <CheckCircle2 size={13} /> Успех
                    </span>
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
