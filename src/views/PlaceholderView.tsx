import React from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { LucideIcon } from 'lucide-react';

interface PlaceholderViewProps {
  title: string;
  icon: LucideIcon;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, icon }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      
      <div className="card min-h-[400px] flex items-center justify-center">
        <EmptyState 
          icon={icon}
          title={`${title} пока пуст`}
          description={`Раздел ${title} находится в разработке. Скоро здесь появится полноценный функционал.`}
        />
      </div>
    </div>
  );
};
