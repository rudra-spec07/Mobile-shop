import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'There are currently no items available to display.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-slate-200 border-dashed my-4">
      <div className="p-3 bg-slate-100 rounded-full text-slate-400 mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-slate-800 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
