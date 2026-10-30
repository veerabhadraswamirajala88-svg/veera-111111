import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-14 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
        <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-8 w-14 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>
    </div>
  );
};

export const GridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};
