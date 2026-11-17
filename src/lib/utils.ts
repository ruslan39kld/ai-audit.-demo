import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU').format(d);
}

export function formatRoi(roi: number): { text: string; colorClass: string; isNegative: boolean; warningText?: string } {
  const rounded = Math.round(roi);
  if (rounded < 0) {
    return {
      text: `-${Math.abs(rounded)}%`,
      colorClass: 'text-red-500 font-bold',
      isNegative: true,
      warningText: 'Проект не окупается за год при текущих допущениях'
    };
  }
  if (rounded > 0) {
    return {
      text: `+${rounded}%`,
      colorClass: 'text-emerald-500 dark:text-emerald-400 font-bold',
      isNegative: false
    };
  }
  return {
    text: '0%',
    colorClass: 'text-[var(--text-secondary)] font-bold',
    isNegative: false
  };
}

export function formatPayback(months: number): { text: string; colorClass: string; caption?: string } {
  const m = Math.round(months * 10) / 10;
  if (m > 60) {
    return {
      text: `${m} мес.`,
      colorClass: 'text-red-500 font-bold',
      caption: 'свыше пяти лет'
    };
  }
  if (m > 24) {
    return {
      text: `${m} мес.`,
      colorClass: 'text-amber-500 font-bold'
    };
  }
  return {
    text: `${m} мес.`,
    colorClass: 'text-[var(--text-primary)] font-bold'
  };
}
