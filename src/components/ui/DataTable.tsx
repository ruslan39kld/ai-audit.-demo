import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  searchPlaceholder?: string;
}

export function DataTable<T extends { id: string }>({ 
  data, 
  columns, 
  onRowClick,
  searchPlaceholder = "Поиск..."
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredData = data.filter(item => {
    const searchStr = Object.values(item).join(' ').toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = (a as any)[sortKey];
    const valB = (b as any)[sortKey];
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary py-2 px-3 flex items-center gap-2">
            <Filter size={16} />
            <span className="text-sm">Фильтры</span>
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--background)] border-b border-[var(--border)]">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key.toString()}
                    className={cn(
                      "px-6 py-4 font-semibold text-[var(--text-secondary)] whitespace-nowrap",
                      col.sortable && "cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                    )}
                    onClick={() => col.sortable && handleSort(col.key.toString())}
                  >
                    <div className="flex items-center gap-2">
                      {col.header}
                      {col.sortable && sortKey === col.key.toString() && (
                        sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {sortedData.length > 0 ? (
                sortedData.map((item) => (
                  <tr
                    key={item.id}
                    className={cn(
                      "hover:bg-[var(--background)] transition-colors group",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((col) => (
                      <td key={col.key.toString()} className="px-6 py-4 whitespace-nowrap">
                        {col.render ? col.render(item) : (item as any)[col.key]}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--border)] transition-all">
                        <MoreVertical size={16} className="text-[var(--text-secondary)]" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                    Данные не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {sortedData.length > 0 && (
          <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between bg-[var(--background)]/30">
            <span className="text-xs text-[var(--text-secondary)]">
              Показано {sortedData.length} из {data.length} записей
            </span>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded hover:bg-[var(--border)] disabled:opacity-30" disabled>
                <ChevronLeft size={16} />
              </button>
              <div className="px-3 py-1 bg-accent text-white rounded text-xs font-bold">1</div>
              <button className="p-1 rounded hover:bg-[var(--border)] disabled:opacity-30" disabled>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
