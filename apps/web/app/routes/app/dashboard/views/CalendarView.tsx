import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { IlamyCalendar, useIlamyCalendarContext } from "@ilamy/calendar";
import { recurrencePlugin } from "@ilamy/calendar/plugins/recurrence";
import { agendaPlugin } from "@ilamy/calendar/plugins/agenda";
import { dragToCreatePlugin } from "@ilamy/calendar/plugins/drag-to-create";
import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Calendar,
  useMediaQuery,
  cn,
} from "@kreozalabs/kei-ui";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDown, CalendarIcon } from "lucide-react";
import { useSettings } from "@/providers/SettingsContext";
import { useDashboardContext } from "../context/DashboardContext";
import type { ViewMode } from "../types";
import { useActionInputModal } from "@/providers/ActionInputModalContext";
import type { Action } from "@kreozalabs/kei-core";

const VIEW_MODE_UNITS: Record<string, "day" | "week" | "month" | "year"> = {
  day: "day",
  inbox: "day",
  lists: "day",
  week: "week",
  agenda: "week",
  month: "month",
  year: "year",
};

function getDisplayDate(dateObj: Date, viewMode: string, localeCode?: string): string {
  if (viewMode === "week" || viewMode === "agenda") {
    const startOfWeek = new Date(dateObj);
    startOfWeek.setDate(dateObj.getDate() - dateObj.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startMonth = startOfWeek.toLocaleDateString(localeCode, { month: "long" });
    const endMonth = endOfWeek.toLocaleDateString(localeCode, { month: "long" });
    const startYear = startOfWeek.getFullYear();
    const endYear = endOfWeek.getFullYear();

    if (startYear !== endYear) {
      return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
    }
    if (startMonth !== endMonth) {
      return `${startMonth} - ${endMonth}, ${startYear}`;
    }
    return `${startMonth} ${startYear}`;
  }

  if (viewMode === "month") {
    return dateObj.toLocaleDateString(localeCode, {
      month: "long",
      year: "numeric",
    });
  }

  if (viewMode === "year") {
    return dateObj.toLocaleDateString(localeCode, {
      year: "numeric",
    });
  }

  return dateObj.toLocaleDateString(localeCode, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function TodayButton({ onClick }: { onClick?: () => void }) {
  const api = useIlamyCalendarContext();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Get today's day number (e.g., 11)
  const todayElement = new Date().getDate();

  return (
    <Button
      size="default"
      variant={isMobile ? "ghost" : "outline"}
      className={cn("", isMobile ? "" : "rounded-3xl p-5 text-sm font-medium")}
      onClick={() => {
        api.today();
        if (onClick) onClick();
      }}
    >
      {isMobile ? (
        <CalendarIcon className="size-7">
          <text
            x="50%"
            y="68%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="9"
            fontWeight="italic"
            fill="currentColor"
            stroke="none" /* Keeps the number crisp without inheriting the icon's outline stroke */
            className="font-sans tracking-tighter"
          >
            {todayElement}
          </text>
        </CalendarIcon>
      ) : (
        <span>Today</span>
      )}
    </Button>
  );
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

interface CalendarHeaderControlsProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

function CalendarHeaderControls({ isOpen, setIsOpen }: CalendarHeaderControlsProps) {
  const api = useIlamyCalendarContext();
  const { settings } = useSettings();
  const { viewMode } = useDashboardContext();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [slideDirection, setSlideDirection] = useState<-1 | 1>(1);

  const [desktopTarget, setDesktopTarget] = useState<HTMLElement | null>(null);
  const [mobileTriggerTarget, setMobileTriggerTarget] = useState<HTMLElement | null>(null);
  const [mobileTodayTarget, setMobileTodayTarget] = useState<HTMLElement | null>(null);
  const [mobileDropdownTarget, setMobileDropdownTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (api.view !== viewMode) {
      api.setView(viewMode as string);
    }
  }, [viewMode, api]);

  useEffect(() => {
    const dt = document.getElementById("calendar-desktop-controls-target");
    const mtt = document.getElementById("calendar-mobile-trigger-target");
    const mtot = document.getElementById("calendar-mobile-today-target");
    const mdt = document.getElementById("calendar-mobile-dropdown-target");

    queueMicrotask(() => {
      if (dt) setDesktopTarget(dt);
      if (mtt) setMobileTriggerTarget(mtt);
      if (mtot) setMobileTodayTarget(mtot);
      if (mdt) setMobileDropdownTarget(mdt);
    });
  }, []);

  const localeCode = settings.language === "auto" ? undefined : settings.language;
  const selectedDateObj = api.currentDate.toDate();
  const currentDateMs = api.currentDate.valueOf();
  const [visibleMonth, setVisibleMonth] = useState<Date>(selectedDateObj);

  useEffect(() => {
    const newDate = new Date(currentDateMs);
    const prevDate = visibleMonth;

    const prevYear = prevDate.getFullYear();
    const prevMonth = prevDate.getMonth();
    const newYear = newDate.getFullYear();
    const newMonth = newDate.getMonth();

    if (prevYear !== newYear || prevMonth !== newMonth) {
      const prevTotalMonths = prevYear * 12 + prevMonth;
      const newTotalMonths = newYear * 12 + newMonth;
      const direction = newTotalMonths > prevTotalMonths ? 1 : -1;
      setSlideDirection(direction);
    }

    setVisibleMonth(newDate);
  }, [currentDateMs]);

  const displayDate = getDisplayDate(
    isOpen && isMobile ? visibleMonth : selectedDateObj,
    isOpen && isMobile ? "month" : viewMode,
    localeCode
  );

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      api.setCurrentDate(
        api.currentDate.year(date.getFullYear()).month(date.getMonth()).date(date.getDate())
      );
      if (!isMobile) {
        setIsOpen(false);
      }
    }
  };

  const handlePrev = () => {
    const unit = VIEW_MODE_UNITS[viewMode] || "day";
    api.setCurrentDate(api.currentDate.subtract(1, unit));
  };

  const handleNext = () => {
    const unit = VIEW_MODE_UNITS[viewMode] || "day";
    api.setCurrentDate(api.currentDate.add(1, unit));
  };

  const handleSwipePrev = () => {
    setSlideDirection(-1);
    setVisibleMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleSwipeNext = () => {
    setSlideDirection(1);
    setVisibleMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  if (isMobile) {
    return (
      <>
        {mobileTriggerTarget &&
          createPortal(
            <Button
              variant="ghost"
              className="hover:bg-muted-foreground/10 flex max-w-full min-w-0 items-center gap-1 px-2 text-base font-bold"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="truncate">{displayDate}</span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </Button>,
            mobileTriggerTarget
          )}

        {mobileTodayTarget &&
          createPortal(
            <TodayButton
              onClick={() => {
                const today = new Date();
                const prevDate = visibleMonth;
                const prevYear = prevDate.getFullYear();
                const prevMonth = prevDate.getMonth();
                const newYear = today.getFullYear();
                const newMonth = today.getMonth();

                if (prevYear !== newYear || prevMonth !== newMonth) {
                  const prevTotalMonths = prevYear * 12 + prevMonth;
                  const newTotalMonths = newYear * 12 + newMonth;
                  const direction = newTotalMonths > prevTotalMonths ? 1 : -1;
                  setSlideDirection(direction);
                }
                setVisibleMonth(today);
              }}
            />,
            mobileTodayTarget
          )}

        {mobileDropdownTarget &&
          createPortal(
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="border-border/40 -mx-6 flex w-[calc(100%+3rem)] justify-center overflow-hidden border-b bg-transparent pt-2 pb-2"
                >
                  <div className="relative w-full overflow-hidden bg-transparent px-6">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.div
                        key={`${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}`}
                        custom={slideDirection}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          x: { type: "spring", stiffness: 300, damping: 30 },
                          opacity: { duration: 0.2 },
                        }}
                        className="w-full bg-transparent"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                          const swipeThreshold = 50;
                          if (info.offset.x > swipeThreshold) {
                            handleSwipePrev();
                          } else if (info.offset.x < -swipeThreshold) {
                            handleSwipeNext();
                          }
                        }}
                      >
                        <Calendar
                          mode="single"
                          showOutsideDays={false}
                          selected={selectedDateObj}
                          onSelect={handleSelect}
                          month={visibleMonth}
                          onMonthChange={setVisibleMonth}
                          lang={localeCode}
                          className="w-full bg-transparent p-0"
                          classNames={{
                            root: "w-full bg-transparent",
                            months: "w-full",
                            month: "w-full flex flex-col gap-1",
                            month_grid: "w-full border-collapse",
                            month_caption: "hidden",
                            nav: "hidden",
                            weekdays:
                              "w-full flex justify-between border-b border-border/10 pb-1.5",
                            weekday:
                              "flex-1 text-center text-sm font-semibold text-muted-foreground/60 select-none",
                            week: "w-full flex justify-between mt-1",
                            day: "flex-1 h-[38px] flex items-center justify-center relative p-0 text-center select-none [&_button]:text-[15px] [&_button]:font-medium [&_button]:size-10 [&_button]:rounded-lg",
                          }}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>,
            mobileDropdownTarget
          )}
      </>
    );
  }

  if (!desktopTarget) return null;

  return createPortal(
    <div className="flex items-center gap-2">
      <TodayButton />

      {/* Navigation Arrows Group */}
      <div className="bg-muted/40 flex items-center gap-0 rounded-lg p-0.5">
        {/* Prev Button */}
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-muted-foreground/10 h-8 w-7 rounded-md"
          onClick={handlePrev}
        >
          <ChevronLeftIcon className="size-5" />
        </Button>
        {/* Next Button */}
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-muted-foreground/10 h-8 w-7 rounded-md"
          onClick={handleNext}
        >
          <ChevronRightIcon className="size-5" />
        </Button>
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="hover:bg-muted-foreground/10">
            <span className="truncate">{displayDate}</span>
            <ChevronDown
              className={cn("size-4 transition-transform duration-200", isOpen && "rotate-180")}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDateObj}
            onSelect={handleSelect}
            lang={localeCode}
            className="[--cell-size:--spacing(10)]"
          />
        </PopoverContent>
      </Popover>
    </div>,
    desktopTarget
  );
}

export function CalendarView() {
  const {
    viewMode,
    setViewMode,
    setSelectedDate,
    setStartDateStr,
    setEndDateStr,
    allActions,
    setActionToEdit,
    setIsDialogOpen,
  } = useDashboardContext();
  const { openActionInput } = useActionInputModal();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const plugins = useMemo(() => [recurrencePlugin(), agendaPlugin(), dragToCreatePlugin()], []);

  const calendarEvents = useMemo(() => {
    return allActions.map((action) => {
      const hasTime = !!action.startTime;
      const start = hasTime ? `${action.scheduledDate}T${action.startTime}` : action.scheduledDate;
      const end = hasTime && action.endTime
        ? `${action.scheduledDate}T${action.endTime}`
        : action.scheduledDate;

      return {
        id: action.id,
        title: action.title,
        start,
        end,
        allDay: !hasTime,
        data: { action },
      };
    });
  }, [allActions]);

  return (
    <div className="flex h-full flex-col md:pr-2">
      <div className="bg-background flex-1 overflow-hidden">
        <IlamyCalendar
          plugins={plugins}
          initialView={viewMode as string}
          onViewChange={(view) => setViewMode(view as ViewMode)}
          headerComponent={
            <CalendarHeaderControls isOpen={isCalendarOpen} setIsOpen={setIsCalendarOpen} />
          }
          events={calendarEvents}
          onEventClick={(event) => {
            const originalAction = event.data?.action as Action | undefined;
            if (originalAction) {
              setActionToEdit(originalAction);
              setIsDialogOpen(true);
            }
          }}
          onCellClick={(info) => {
            openActionInput({ initialDate: info.start.format("YYYY-MM-DD") });
          }}
          onDateChange={(date, range) => {
            setSelectedDate(date.format("YYYY-MM-DD"));
            if (range) {
              setStartDateStr(range.start.format("YYYY-MM-DD"));
              setEndDateStr(range.end.format("YYYY-MM-DD"));
            }
          }}
        />
      </div>
    </div>
  );
}
