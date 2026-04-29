import { MONTHS } from '@/lib/utils';
import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthYearSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

export function MonthYearSelector({ month, year, onChange }: MonthYearSelectorProps) {
  const prevMonth = () => {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  };

  const nextMonth = () => {
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  };

  return (
    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border dark:border-slate-800 w-max transition-colors">
      <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 text-slate-500 dark:text-slate-400">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="w-48 text-center font-semibold text-lg text-slate-800 dark:text-slate-100">
        {MONTHS[month - 1]} {year}
      </div>

      <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 text-slate-500 dark:text-slate-400">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
