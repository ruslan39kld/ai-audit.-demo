import React, { useState } from 'react';
import { storage, ReportBranding } from '../storage';
import { Settings2, Database, Trash2, Download, ShieldCheck, Palette, AlertTriangle, CheckCircle2, Save, RotateCcw } from 'lucide-react';
import { Role } from '../types';
import { useAuth, UserRole } from '../contexts/AuthContext';

export const SettingsView: React.FC = () => {
  const { user, setRole } = useAuth();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [branding, setBranding] = useState<ReportBranding>(() => storage.getBranding());

  // Security: Client role must never access settings
  if (user?.role === 'client') {
    return (
      <div className="card p-12 text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-12 h-12 bg-danger/10 text-danger rounded-xl flex items-center justify-center mx-auto">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-xl font-bold">Доступ ограничен</h3>
        <p className="text-sm text-[var(--text-secondary)]">Раздел «Настройки» недоступен для роли Заказчик.</p>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  const handleSaveBranding = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    storage.saveBranding(branding);
    setSuccessMsg('Настройки брендирования успешно сохранены');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleResetBranding = () => {
    const emptyBranding: ReportBranding = {
      companyName: '',
      auditorName: '',
      auditorRole: '',
      phone: '',
      email: '',
      website: '',
      accentColor: '#1E3A8A'
    };
    setBranding(emptyBranding);
    storage.saveBranding(emptyBranding);
    setSuccessMsg('Брендирование очищено (контакты в отчете будут скрыты)');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleClear = () => {
    if (!isAdmin) return;
    if (confirm('Вы уверены, что хотите удалить все данные? Это действие необратимо.')) {
      storage.clearAll();
      window.location.reload();
    }
  };

  const handleLoadDemo = () => {
    if (!isAdmin) return;
    storage.loadDemoData();
    window.location.reload();
  };

  const handleExportAll = () => {
    if (!isAdmin) return;
    const allData = {
      clients: storage.getClients(),
      audits: storage.getAudits(),
      documents: storage.getDocuments(),
      finances: storage.getFinances(),
      branding: storage.getBranding()
    };
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_platform_export_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setSuccessMsg('База данных успешно экспортирована');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 text-accent rounded-xl">
            <Settings2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Настройки</h2>
            <p className="text-sm text-[var(--text-secondary)]">Управление системой, данными и доступом</p>
          </div>
        </div>
        {successMsg && (
          <div className="flex items-center gap-2 text-xs font-semibold text-success bg-success/10 px-3 py-1.5 rounded-lg">
            <CheckCircle2 size={14} />
            {successMsg}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Data Section */}
        <div className="card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-4">
            <Database size={20} className="text-accent" />
            <h3 className="font-bold">Управление данными</h3>
          </div>
          
          <div className="space-y-4">
            {isAdmin ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Демонстрационные данные</p>
                    <p className="text-xs text-[var(--text-secondary)]">Заполнить систему примерами для обучения</p>
                  </div>
                  <button onClick={handleLoadDemo} className="btn-secondary text-xs">Загрузить</button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Резервное копирование</p>
                    <p className="text-xs text-[var(--text-secondary)]">Скачать всю базу данных в JSON</p>
                  </div>
                  <button onClick={handleExportAll} className="btn-secondary text-xs flex items-center gap-2">
                    <Download size={14} />
                    Экспорт всей базы
                  </button>
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                  <button 
                    onClick={handleClear}
                    className="w-full btn-secondary text-danger border-danger/20 hover:bg-danger/10 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Очистить все данные
                  </button>
                </div>
              </>
            ) : (
              <p className="text-xs text-[var(--text-secondary)] py-2">
                Действия по управлению базой данных и очистке доступны только Администратору.
              </p>
            )}
          </div>
        </div>

        {/* Roles Section - ONLY for Admin */}
        {isAdmin && (
          <div className="card p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-4">
              <ShieldCheck size={20} className="text-accent" />
              <h3 className="font-bold">Доступ и Роли</h3>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Переключатель ролей (доступен только Администратору):
              </p>
              
              <div className="space-y-2">
                {([
                  { id: 'admin', label: 'Администратор' },
                  { id: 'auditor', label: 'Аудитор' },
                  { id: 'client', label: 'Заказчик' }
                ] as const).map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left ${user?.role === r.id ? 'border-accent bg-accent/5 font-bold' : 'border-[var(--border)] hover:bg-[var(--background)]'}`}
                  >
                    <span className="text-sm">{r.label}</span>
                    {user?.role === r.id && <span className="text-[10px] bg-accent text-white px-2 py-0.5 rounded-full font-bold">Активно</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Branding Section */}
        <div className="card p-6 space-y-6 md:col-span-2">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div className="flex items-center gap-2">
              <Palette size={20} className="text-accent" />
              <div>
                <h3 className="font-bold">Брендирование отчетов</h3>
                <p className="text-xs text-[var(--text-secondary)]">Реквизиты исполнителя и контакты для генерации PDF-документов</p>
              </div>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetBranding}
                  className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5"
                  title="Очистить все поля контактов"
                >
                  <RotateCcw size={14} />
                  <span>Очистить поля</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveBranding()}
                  className="btn-primary text-xs flex items-center gap-1.5 px-3 py-1.5"
                >
                  <Save size={14} />
                  <span>Сохранить</span>
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveBranding} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                Название компании-исполнителя
              </label>
              <input 
                type="text" 
                placeholder="AI Audit Enterprise Platform"
                value={branding.companyName}
                onChange={(e) => setBranding(prev => ({ ...prev, companyName: e.target.value }))}
                disabled={!isAdmin}
                className="w-full px-3.5 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm disabled:opacity-60"
              />
              <p className="text-[11px] text-[var(--text-secondary)]">Отображается в шапке каждой страницы и в блоке контактов</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                ФИО аудитора / эксперта
              </label>
              <input 
                type="text" 
                placeholder="Алексей Смирнов"
                value={branding.auditorName}
                onChange={(e) => setBranding(prev => ({ ...prev, auditorName: e.target.value }))}
                disabled={!isAdmin}
                className="w-full px-3.5 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm disabled:opacity-60"
              />
              <p className="text-[11px] text-[var(--text-secondary)]">Используется, если у текущего пользователя не заполнено имя</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                Контактный телефон
              </label>
              <input 
                type="text" 
                placeholder="+7 (495) 123-45-67"
                value={branding.phone}
                onChange={(e) => setBranding(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!isAdmin}
                className="w-full px-3.5 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                Электронная почта
              </label>
              <input 
                type="email" 
                placeholder="expert@ai-audit.platform"
                value={branding.email}
                onChange={(e) => setBranding(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isAdmin}
                className="w-full px-3.5 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                Официальный сайт
              </label>
              <input 
                type="text" 
                placeholder="ai-audit.platform"
                value={branding.website}
                onChange={(e) => setBranding(prev => ({ ...prev, website: e.target.value }))}
                disabled={!isAdmin}
                className="w-full px-3.5 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Цвет акцента отчёта</label>
              <div className="flex items-center gap-3 pt-1">
                {[
                  { color: '#1E3A8A', name: 'Синий индиго' },
                  { color: '#1E5EFF', name: 'Яркий синий' },
                  { color: '#0F766E', name: 'Изумрудный' },
                  { color: '#7C3AED', name: 'Фиолетовый' },
                  { color: '#B45309', name: 'Янтарный' }
                ].map(c => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => isAdmin && setBranding(prev => ({ ...prev, accentColor: c.color }))}
                    className={`w-9 h-9 rounded-lg border-2 transition-all flex items-center justify-center ${branding.accentColor === c.color ? 'border-accent scale-110 shadow-md ring-2 ring-accent/30' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                  >
                    {branding.accentColor === c.color && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">Цвет верхней полосы страниц и заголовков в PDF</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
