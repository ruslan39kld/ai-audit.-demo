import React from 'react';
import { FieldDefinition } from '../../lib/fieldRegistry';
import { cn } from '../../lib/utils';

interface DynamicFieldProps {
  field: FieldDefinition;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  contextValue?: string; // Prompt 18
}

export const DynamicField: React.FC<DynamicFieldProps> = ({ field, value, onChange, error, contextValue }) => {
  const displayLabel = (contextValue && field.labelOverrides?.[contextValue]) || field.label;

  const renderInput = () => {
    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            value={value || ''}
            onChange={(e) => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
            className={cn(
              "w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-[var(--text-primary)] shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all",
              error && "border-red-500"
            )}
            placeholder={field.hint}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-[var(--text-primary)] shadow-sm min-h-[100px]",
              "focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all",
              error && "border-red-500"
            )}
            placeholder={field.hint}
          />
        );

      case 'select':
        return (
          <div className="relative">
            <select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className={cn(
                "w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-[var(--text-primary)] shadow-sm appearance-none",
                "focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all",
                error && "border-red-500"
              )}
            >
              <option value="">Выберите вариант...</option>
              {field.options?.map((opt: any) => (
                <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
                  {typeof opt === 'string' ? opt : opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
               <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
            </div>
          </div>
        );

      case 'multi':
        const selected = Array.isArray(value) ? value : [];
        return (
          <div className="flex flex-wrap gap-2">
            {field.options?.map((opt: any) => {
              const val = typeof opt === 'string' ? opt : opt.value;
              const lab = typeof opt === 'string' ? opt : opt.label;
              const isSelected = selected.includes(val);
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    const next = isSelected 
                      ? selected.filter(v => v !== val)
                      : [...selected, val];
                    onChange(next);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    isSelected 
                      ? "bg-accent border-accent text-white" 
                      : "bg-[var(--background)] border-[var(--border)] text-[var(--text-secondary)] hover:border-accent"
                  )}
                >
                  {lab}
                </button>
              );
            })}
          </div>
        );

      case 'scale':
        return (
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onChange(num)}
                className={cn(
                  "w-10 h-10 rounded-full font-bold transition-all",
                  value === num 
                    ? "bg-accent text-white scale-110" 
                    : "bg-[var(--background)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-accent"
                )}
              >
                {num}
              </button>
            ))}
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={value || 0}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
              <span>0%</span>
              <span className="text-accent">{value || 0}%</span>
              <span>100%</span>
            </div>
          </div>
        );

      case 'table':
        const rows = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
              <table className="w-full text-sm">
                <thead className="bg-[var(--background)] border-b border-[var(--border)]">
                  <tr>
                    {field.tableColumns?.map(col => (
                      <th key={col.key} className="px-4 py-2 text-left font-semibold">{col.label}</th>
                    ))}
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {rows.map((row, idx) => (
                    <tr key={idx}>
                      {field.tableColumns?.map(col => (
                        <td key={col.key} className="px-4 py-2">
                          <input
                            type={col.type === 'number' ? 'number' : 'text'}
                            value={row[col.key] || ''}
                            onChange={(e) => {
                              const nextRows = [...rows];
                              nextRows[idx] = { ...row, [col.key]: col.type === 'number' ? Number(e.target.value) : e.target.value };
                              onChange(nextRows);
                            }}
                            className="w-full bg-transparent focus:outline-none"
                          />
                        </td>
                      ))}
                      <td className="px-4 py-2">
                        <button 
                          type="button"
                          onClick={() => onChange(rows.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700"
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => onChange([...rows, {}])}
              className="text-xs font-bold text-accent flex items-center gap-1 hover:underline"
            >
              + Добавить строку
            </button>
          </div>
        );

      default:
        return <div>Unsupported field type: {field.type}</div>;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-bold text-[var(--text-main)]">
          {displayLabel}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      {renderInput()}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
