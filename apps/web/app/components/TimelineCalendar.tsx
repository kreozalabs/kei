import { useState, useMemo, useEffect, useRef } from "react";
import { 
  Button, 
  cn, 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@kreozalabs/ui";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ChevronDownIcon 
} from "lucide-react";

interface TimelineCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onDateSelect: (date: string) => void;
}

export function TimelineCalendar({ selectedDate, onDateSelect }: TimelineCalendarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Track the year the user is currently "viewing" in the month picker
  const [pickerYear, setPickerYear] = useState(() => new Date(selectedDate + "T12:00:00").getFullYear());

  // Reset pickerYear when the selected date changes externally (e.g. today button)
  useEffect(() => {
    setPickerYear(new Date(selectedDate + "T12:00:00").getFullYear());
  }, [selectedDate]);

  // Generate a range of dates around the selected date
  const days = useMemo(() => {
    const centerDate = new Date(selectedDate + "T12:00:00");
    const result = [];

    // Show 21 days (10 before, 10 after) for better horizontal context
    for (let i = -10; i <= 10; i++) {
      const d = new Date(centerDate);
      d.setDate(d.getDate() + i);
      result.push({
        full: d.toLocaleDateString("en-CA"), // YYYY-MM-DD
        dayNum: d.getDate(),
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        monthName: d.toLocaleDateString("en-US", { month: "short" }),
        isToday: d.toLocaleDateString("en-CA") === new Date().toLocaleDateString("en-CA"),
      });
    }
    return result;
  }, [selectedDate]);

  // Handle auto-centering of selected date
  useEffect(() => {
    const activeElement = scrollRef.current?.querySelector('[data-selected="true"]');
    if (activeElement && scrollRef.current) {
      const container = scrollRef.current;
      const scrollLeft =
        (activeElement as HTMLElement).offsetLeft -
        container.offsetWidth / 2 +
        (activeElement as HTMLElement).offsetWidth / 2;

      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  }, [selectedDate]);

  const currentMonthYear = useMemo(() => {
    const d = new Date(selectedDate + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [selectedDate]);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Drag to scroll logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleToday = () => {
    onDateSelect(new Date().toLocaleDateString("en-CA"));
  };

  const shiftDate = (offset: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + offset);
    onDateSelect(d.toLocaleDateString("en-CA"));
  };

  const handleMonthSelect = (monthIndex: number) => {
    // Jump to the 1st of that month in the current pickerYear
    const d = new Date(pickerYear, monthIndex, 1, 12, 0, 0);
    onDateSelect(d.toLocaleDateString("en-CA"));
  };

  return (
    <div className="flex flex-col gap-4 mb-6 sticky top-0 bg-background/95 backdrop-blur-md z-30 py-3 border-b border-border/5 shadow-sm">
      <div className="flex items-center justify-between px-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <h3 className="text-[15px] font-black tracking-tight flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors group">
              {currentMonthYear}
              <div className="size-5 flex items-center justify-center rounded-full bg-muted/30 group-hover:bg-primary/10 transition-colors">
                <ChevronDownIcon className="size-3 opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all" />
              </div>
            </h3>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="w-56 p-2 rounded-2xl bg-muted border border-border/40 shadow-2xl z-50 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between px-1 py-1">
               <Button 
                variant="ghost" 
                size="icon" 
                className="size-7"
                onClick={(e) => { e.stopPropagation(); setPickerYear(p => p - 1); }}
               >
                 <ChevronLeftIcon className="size-4" />
               </Button>
               <span className="text-sm font-black tracking-widest">{pickerYear}</span>
               <Button 
                variant="ghost" 
                size="icon" 
                className="size-7"
                onClick={(e) => { e.stopPropagation(); setPickerYear(p => p + 1); }}
               >
                 <ChevronRightIcon className="size-4" />
               </Button>
            </div>
            <DropdownMenuSeparator className="my-2" />
            <div className="grid grid-cols-3 gap-1">
              {months.map((month, idx) => (
                <DropdownMenuItem 
                  key={month}
                  onClick={() => handleMonthSelect(idx)}
                  className={cn(
                    "flex items-center justify-center h-9 text-[11px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all",
                    new Date(selectedDate + "T12:00:00").getMonth() === idx && 
                    new Date(selectedDate + "T12:00:00").getFullYear() === pickerYear
                      ? "bg-primary text-primary-foreground focus:bg-primary focus:text-primary-foreground" 
                      : "hover:bg-accent focus:bg-accent"
                  )}
                >
                  {month}
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-muted/20 p-0.5 rounded-lg border border-border/40">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => shiftDate(-1)}
              className="size-7 rounded-md hover:bg-background hover:shadow-sm transition-all"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="h-7 px-3 text-[10px] font-black uppercase tracking-widest hover:bg-background hover:shadow-sm transition-all text-muted-foreground/80 hover:text-foreground"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => shiftDate(1)}
              className="size-7 rounded-md hover:bg-background hover:shadow-sm transition-all"
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="relative px-2">
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={cn(
            "flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar mask-fade-edges cursor-grab active:cursor-grabbing",
            isDragging && "select-none"
          )}
        >
          {days.map((day) => {
            const isSelected = day.full === selectedDate;
            return (
              <Button
                key={day.full}
                variant="ghost"
                data-selected={isSelected}
                onClick={() => !isDragging && onDateSelect(day.full)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[3.5rem] h-20 rounded-2xl transition-all duration-300 relative border border-transparent shadow-none shrink-0 group",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xl shadow-primary/25 scale-105 z-10"
                    : "hover:bg-muted/40 text-muted-foreground/60 hover:text-foreground active:scale-95",
                  day.isToday && !isSelected && "bg-primary/5 border-primary/20"
                )}
              >
                <span
                  className={cn(
                    "text-[10px] uppercase font-black tracking-widest mb-1.5 transition-colors",
                    isSelected ? "text-primary-foreground/70" : "text-muted-foreground/40 group-hover:text-muted-foreground"
                  )}
                >
                  {day.dayName}
                </span>
                <span className="text-lg font-black leading-none">
                  {day.dayNum}
                </span>
                
                {day.isToday && (
                  <div className={cn(
                    "absolute bottom-2 size-1.5 rounded-full",
                    isSelected ? "bg-primary-foreground/40" : "bg-primary"
                  )} />
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
