import React, { useState, useRef } from 'react';
import { DataTable, Column } from '../components/ui/DataTable';
import { DocRecord } from '../types';
import { storage } from '../storage';
import { StatusBadge } from '../components/ui/StatusBadge';
import { FolderOpen, Upload, FileQuestion, Plus, Search, CheckCircle2 } from 'lucide-react';
import { Drawer } from '../components/ui/Drawer';
import { useAuth } from '../contexts/AuthContext';

export const DocumentsView: React.FC = () => {
  const { user } = useAuth();
  const [selectedDoc, setSelectedDoc] = useState<DocRecord | null>(null);
  const [uploadToast, setUploadToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [allDocuments, setAllDocuments] = useState<DocRecord[]>(storage.getDocuments());
  const allAudits = storage.getAudits();

  const clientAuditIds = new Set(
    allAudits
      .filter(a => a.clientId === user?.id || (user?.name && a.projectName.toLowerCase().includes(user.name.toLowerCase())) || (user?.company && a.projectName.toLowerCase().includes(user.company.toLowerCase())))
      .map(a => a.id)
  );

  const documents = user?.role === 'client'
    ? allDocuments.filter(d => d.clientId === user?.id || (d.auditId && clientAuditIds.has(d.auditId)))
    : allDocuments;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const newDoc: DocRecord = {
      id: 'doc_' + Date.now(),
      clientId: user?.id || 'c1',
      auditId: null,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      docType: file.name.endsWith('.xlsx') || file.name.endsWith('.csv') ? 'финмодель' : 'регламент',
      size: file.size,
      status: 'проанализирован',
      summary: `Файл ${file.name} загружен пользователем и обработан.`,
      keyNumbers: [
        { label: 'Размер файла', value: `${(file.size / 1024).toFixed(1)} КБ` },
        { label: 'Статус анализа', value: 'Данные учтены' }
      ],
      gaps: [],
      redFlags: []
    };
    storage.saveDocument(newDoc);
    setAllDocuments(storage.getDocuments());
    setUploadToast(true);
    setTimeout(() => setUploadToast(false), 3000);
  };

  const columns: Column<DocRecord>[] = [
    { 
      key: 'fileName', 
      header: 'Файл',
      sortable: true,
      render: (d) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--background)] rounded-lg text-[var(--text-secondary)]">
            <FileQuestion size={16} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">{d.fileName}</span>
            <span className="text-[10px] text-[var(--text-secondary)]">{(d.size / 1024 / 1024).toFixed(2)} МБ</span>
          </div>
        </div>
      )
    },
    { key: 'docType', header: 'Тип документа', sortable: true },
    { 
      key: 'uploadedAt', 
      header: 'Загружен', 
      sortable: true,
      render: (d) => new Date(d.uploadedAt).toLocaleDateString('ru-RU')
    },
    { 
      key: 'status', 
      header: 'Статус', 
      sortable: true,
      render: (d) => {
        const typeMap: Record<string, any> = {
          'проанализирован': 'success',
          'обрабатывается': 'info',
          'загружен': 'neutral',
          'ошибка': 'danger'
        };
        return <StatusBadge label={d.status} type={typeMap[d.status] || 'neutral'} />;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 text-accent rounded-xl">
            <FolderOpen size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Документы</h2>
            <p className="text-sm text-[var(--text-secondary)]">База материалов проектов и результаты анализа</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {uploadToast && (
            <span className="flex items-center gap-1.5 text-xs text-success font-medium">
              <CheckCircle2 size={15} /> Файл загружен и обработан
            </span>
          )}
          <input 
            ref={fileInputRef} 
            type="file" 
            className="hidden" 
            onChange={handleFileUpload} 
            accept=".xlsx,.xls,.csv,.pdf,.docx,.txt"
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="btn-primary flex items-center gap-2"
          >
            <Upload size={18} />
            Загрузить файлы
          </button>
        </div>
      </div>

      <div className="card p-4 bg-accent/5 border-accent/20">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-accent/10 text-accent rounded-lg mt-1">
             <FileQuestion size={20} />
          </div>
          <div className="flex-1">
             <h4 className="font-bold text-sm mb-1">Какие документы загружать?</h4>
             <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
               Для качественного аудита рекомендуется загрузить: Бизнес-план, Финмодель (XLSX), Регламенты процессов и Отчеты из CRM. 
               Система автоматически извлечет из них цифры для анкеты аудита.
             </p>
          </div>
          <button className="text-accent text-xs font-bold hover:underline">Справка</button>
        </div>
      </div>

      <DataTable 
        data={documents} 
        columns={columns} 
        onRowClick={(d) => setSelectedDoc(d)}
        searchPlaceholder="Поиск по названию..."
      />

      <Drawer
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc?.fileName || ''}
      >
        {selectedDoc && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="font-bold border-b border-[var(--border)] pb-2 text-sm">Разбор AI</h4>
              <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border)] space-y-3">
                <p className="text-sm italic leading-relaxed text-[var(--text-secondary)]">
                  {selectedDoc.summary || 'Анализ еще не завершен...'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
               <h4 className="font-bold border-b border-[var(--border)] pb-2 text-sm">Ключевые показатели</h4>
               <div className="grid grid-cols-1 gap-2">
                 {selectedDoc.keyNumbers.length > 0 ? selectedDoc.keyNumbers.map((kn, i) => (
                   <div key={i} className="flex justify-between items-center p-3 bg-[var(--background)] rounded-lg text-sm border border-[var(--border)]">
                     <span className="text-[var(--text-secondary)]">{kn.label}</span>
                     <span className="font-bold text-accent">{kn.value}</span>
                   </div>
                 )) : (
                   <p className="text-xs text-[var(--text-secondary)] text-center py-4">Показатели не найдены</p>
                 )}
               </div>
            </div>

            {selectedDoc.redFlags.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-danger text-sm">Красные флаги</h4>
                <ul className="space-y-2">
                  {selectedDoc.redFlags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs bg-danger/5 text-danger p-2 rounded-lg border border-danger/10">
                      <span>•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 pt-6">
              <button className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Plus size={18} />
                Создать аудит
              </button>
              <button className="btn-secondary">Просмотр</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
