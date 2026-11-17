import React from 'react';
import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  delta?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, delta, subtitle, className }) => {
  return (
    <div className={cn("card p-5 flex flex-col gap-2", className)}>
      <span className="text-sm font-medium text-[var(--text-secondary)]">{title}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {delta && (
          <div className={cn(
            "flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full",
            delta.isPositive ? "text-success bg-success/10" : "text-danger bg-danger/10"
          )}>
            {delta.isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {delta.value}%
          </div>
        )}
      </div>
      {subtitle && <span className="text-xs text-[var(--text-secondary)] mt-1">{subtitle}</span>}
    </div>
  );
};
