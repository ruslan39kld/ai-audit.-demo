import React from 'react';
import { cn } from '../../lib/utils';

type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  type?: StatusType;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, type = 'neutral', className }) => {
  const styles = {
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    info: 'bg-accent/10 text-accent border-accent/20',
    neutral: 'bg-[var(--background)] text-[var(--text-secondary)] border-[var(--border)]',
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap",
      styles[type],
      className
    )}>
      {label}
    </span>
  );
};
