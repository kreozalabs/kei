import { useState, useMemo } from "react";
import { Button, cn } from "@kreozalabs/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MicroCalendarProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  className?: string;
}

export function MicroCalendar({ value, onChange, className }: MicroCalendarProps) {
  const initialDate = useMemo(() => {
    if (value) {
      const parts = value.split("-");
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (!isNaN(d.getTime())) return d;
      }
    }
    return new Date();
  }, [value]);

  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const daysGrid = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const days = [];

    // Empty spots for preceding days of the week
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    const tempDate = new Date(firstDayOfMonth);
    while (tempDate.getMonth() === currentMonth) {
      days.push(new Date(tempDate));
      tempDate.setDate(tempDate.getDate() + 1);
    }

    return days;
  }, [currentMonth, currentYear]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const selectDay = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
  };

  const isSelected = (date: Date) => {
    if (!value) return false;
    const parts = value.split("-");
    return (
      date.getFullYear() === Number(parts[0]) &&
      date.getMonth() + 1 === Number(parts[1]) &&
      date.getDate() === Number(parts[2])
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const monthName = new Intl.DateTimeFormat(undefined, { month: "long" }).format(
    new Date(currentYear, currentMonth, 1)
  );

  return (
    <div className={cn("p-3 w-65 bg-background rounded-2xl flex flex-col gap-2", className)}>
      {/* Header controls */}
      <div className="flex items-center justify-between gap-1 pb-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
          className="size-7 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 p-0"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-[11px] font-black uppercase tracking-widest text-foreground/80 select-none">
          {monthName} {currentYear}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="size-7 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 p-0"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 text-center gap-1.5">
        {daysOfWeek.map((day) => (
          <span
            key={day}
            className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/35 select-none"
          >
            {day}
          </span>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysGrid.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="size-7" />;
          }

          const selected = isSelected(day);
          const today = isToday(day);

          return (
            <Button
              key={day.getTime()}
              variant="ghost"
              size="sm"
              onClick={() => selectDay(day)}
              className={cn(
                "size-7 p-0 rounded-lg text-[11px] font-bold transition-all relative flex items-center justify-center shrink-0 border-none",
                selected
                  ? "bg-primary text-primary-foreground hover:bg-primary shadow-sm"
                  : today
                    ? "text-primary bg-primary/10 hover:bg-primary/20 ring-1 ring-primary/20"
                    : "text-muted-foreground/80 hover:text-foreground hover:bg-muted"
              )}
            >
              <span>{day.getDate()}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
