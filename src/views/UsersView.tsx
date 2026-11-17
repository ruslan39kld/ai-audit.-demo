import React, { useState } from 'react';
import { 
  UserCheck, 
  Users, 
  Search, 
  Plus, 
  ShieldCheck, 
  User, 
  Mail, 
  Clock, 
  CheckCircle2, 
  X,
  UserPlus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { storage } from '../storage';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'auditor' | 'client';
  status: 'active' | 'inactive';
  lastLogin: string;
  organization?: string;
}

export const UsersView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'auditor' | 'client'>('auditor');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial user list seeded with realistic platform users
  const [usersList, setUsersList] = useState<SystemUser[]>([
    {
      id: 'usr-1',
      name: 'Главный Администратор',
      email: 'admin@ai-audit.platform',
      role: 'admin',
      status: 'active',
      lastLogin: 'Сегодня, 10:45',
      organization: 'AI Audit Core'
    },
    {
      id: 'usr-2',
      name: 'Алексей Смирнов (Ведущий аудитор)',
      email: 'auditor@ai-audit.platform',
      role: 'auditor',
      status: 'active',
      lastLogin: 'Сегодня, 09:12',
      organization: 'AI Audit Services'
    },
    {
      id: 'usr-3',
      name: 'Елена Васильева (Аудитор)',
      email: 'e.vasilieva@ai-audit.platform',
      role: 'auditor',
      status: 'active',
      lastLogin: 'Вчера, 17:30',
      organization: 'AI Audit Services'
    },
    {
      id: 'usr-4',
      name: 'Иван Кузнецов (Заказчик)',
      email: 'client@company.ru',
      role: 'client',
      status: 'active',
      lastLogin: '2 дня назад',
      organization: 'ПАО «ТехноПром»'
    },
    {
      id: 'usr-5',
      name: 'Мария Сидорова (Заказчик)',
      email: 'm.sidorova@retail-group.ru',
      role: 'client',
      status: 'active',
      lastLogin: '5 дней назад',
      organization: 'ООО «Ритейл Групп»'
    }
  ]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser: SystemUser = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      status: 'active',
      lastLogin: 'Только что создан',
      organization: newUserRole === 'client' ? 'Корпоративный клиент' : 'AI Audit Team'
    };

    setUsersList(prev => [newUser, ...prev]);
    setIsModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setToastMessage(`Пользователь ${newUser.name} успешно добавлен`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredUsers = usersList.filter(u => {
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.organization && u.organization.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
            <UserCheck size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Пользователи</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Управление учётными записями, ролями и доступами платформы аудита
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {toastMessage && (
            <span className="flex items-center gap-1.5 text-xs text-success font-medium animate-in fade-in">
              <CheckCircle2 size={15} /> {toastMessage}
            </span>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
          >
            <UserPlus size={16} />
            <span>Добавить пользователя</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card p-6">
          <p className="text-xs text-[var(--text-secondary)] font-medium">Администраторы</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-black text-purple-600">
              {usersList.filter(u => u.role === 'admin').length}
            </span>
            <span className="text-xs bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded font-semibold">
              Полный доступ
            </span>
          </div>
        </div>

        <div className="card p-6">
          <p className="text-xs text-[var(--text-secondary)] font-medium">Аудиторы</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-black text-blue-600">
              {usersList.filter(u => u.role === 'auditor').length}
            </span>
            <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded font-semibold">
              Проведение аудитов
            </span>
          </div>
        </div>

        <div className="card p-6">
          <p className="text-xs text-[var(--text-secondary)] font-medium">Заказчики</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-black text-emerald-600">
              {usersList.filter(u => u.role === 'client').length}
            </span>
            <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-semibold">
              Личный кабинет
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedRole('all')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              selectedRole === 'all'
                ? "bg-accent text-white"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background)]"
            )}
          >
            Все ({usersList.length})
          </button>
          <button
            onClick={() => setSelectedRole('admin')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              selectedRole === 'admin'
                ? "bg-accent text-white"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background)]"
            )}
          >
            Администраторы
          </button>
          <button
            onClick={() => setSelectedRole('auditor')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              selectedRole === 'auditor'
                ? "bg-accent text-white"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background)]"
            )}
          >
            Аудиторы
          </button>
          <button
            onClick={() => setSelectedRole('client')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              selectedRole === 'client'
                ? "bg-accent text-white"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background)]"
            )}
          >
            Заказчики
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
          <input
            type="text"
            placeholder="Поиск по имени или email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--background)] border-b border-[var(--border)] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Пользователь</th>
                <th className="px-5 py-3.5 w-36">Роль</th>
                <th className="px-5 py-3.5 w-48">Организация</th>
                <th className="px-5 py-3.5 w-36">Последний вход</th>
                <th className="px-5 py-3.5 w-28">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-[var(--background)]/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent font-bold flex items-center justify-center text-xs">
                        {u.name.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">{u.name}</p>
                        <p className="text-[11px] text-[var(--text-secondary)] font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-bold uppercase",
                      u.role === 'admin' && "bg-purple-500/10 text-purple-600 border border-purple-500/20",
                      u.role === 'auditor' && "bg-blue-500/10 text-blue-600 border border-blue-500/20",
                      u.role === 'client' && "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    )}>
                      {u.role === 'admin' ? 'Администратор' : u.role === 'auditor' ? 'Аудитор' : 'Заказчик'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[var(--text-secondary)]">
                    {u.organization || '—'}
                  </td>
                  <td className="px-5 py-4 text-[var(--text-secondary)]">
                    {u.lastLogin}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-[11px] text-success font-medium">
                      <CheckCircle2 size={13} /> Активен
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add User */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-base font-bold">Новый пользователь</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-[var(--background)] rounded-lg transition-colors text-[var(--text-secondary)]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">ФИО пользователя</label>
                <input
                  type="text"
                  required
                  placeholder="Иванов Иван Иванович"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--background)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Рабочий Email</label>
                <input
                  type="email"
                  required
                  placeholder="user@organization.ru"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--background)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Роль в системе</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[var(--background)] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="auditor">Аудитор (проведение аудитов, отчёты)</option>
                  <option value="admin">Администратор (настройка системы)</option>
                  <option value="client">Заказчик (просмотр результатов)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border)] hover:bg-[var(--background)]"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Создать пользователя
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
