import { useState, useEffect } from "react";
import { IlamyCalendar, useIlamyCalendarContext } from "@ilamy/calendar";
import { recurrencePlugin } from "@ilamy/calendar/plugins/recurrence";
import { agendaPlugin } from "@ilamy/calendar/plugins/agenda";
import { dragToCreatePlugin } from "@ilamy/calendar/plugins/drag-to-create";
import { Button, Popover, PopoverTrigger, PopoverContent, Calendar } from "@kreozalabs/kei-ui";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDown } from "lucide-react";
import { HeaderPortal } from "../../dashboard";
import { useSettings } from "@/providers/SettingsContext";
import { useDashboardContext } from "../context/DashboardContext";
import type { ViewMode } from "../types";

function CalendarHeaderControls() {
  const api = useIlamyCalendarContext();
  const { settings } = useSettings();
  const { viewMode } = useDashboardContext();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (api.view !== viewMode) {
      api.setView(viewMode as string);
    }
  }, [viewMode, api]);

  const localeCode = settings.language === "auto" ? undefined : settings.language;
  const selectedDateObj = api.currentDate.toDate();

  let displayDate = "";
  if (viewMode === "week" || viewMode === "agenda") {
    const startOfWeek = new Date(selectedDateObj);
    startOfWeek.setDate(selectedDateObj.getDate() - selectedDateObj.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startMonth = startOfWeek.toLocaleDateString(localeCode, { month: "long" });
    const endMonth = endOfWeek.toLocaleDateString(localeCode, { month: "long" });
    const startYear = startOfWeek.getFullYear();
    const endYear = endOfWeek.getFullYear();

    if (startYear !== endYear) {
      displayDate = `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
    } else if (startMonth !== endMonth) {
      displayDate = `${startMonth} - ${endMonth}, ${startYear}`;
    } else {
      displayDate = `${startMonth} ${startYear}`;
    }
  } else if (viewMode === "month") {
    displayDate = selectedDateObj.toLocaleDateString(localeCode, {
      month: "long",
      year: "numeric",
    });
  } else if (viewMode === "year") {
    displayDate = selectedDateObj.toLocaleDateString(localeCode, {
      year: "numeric",
    });
  } else {
    displayDate = selectedDateObj.toLocaleDateString(localeCode, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      api.setCurrentDate(
        api.currentDate.year(date.getFullYear()).month(date.getMonth()).date(date.getDate())
      );
      setIsOpen(false);
    }
  };

  const handlePrev = () => {
    let nextDate = api.currentDate;
    switch (viewMode) {
      case "day":
      case "inbox":
      case "kanban":
      case "lists":
        nextDate = api.currentDate.subtract(1, "day");
        break;
      case "week":
      case "agenda":
        nextDate = api.currentDate.subtract(1, "week");
        break;
      case "month":
        nextDate = api.currentDate.subtract(1, "month");
        break;
      case "year":
        nextDate = api.currentDate.subtract(1, "year");
        break;
      default:
        nextDate = api.currentDate.subtract(1, "day");
        break;
    }
    api.setCurrentDate(nextDate);
  };

  const handleNext = () => {
    let nextDate = api.currentDate;
    switch (viewMode) {
      case "day":
      case "inbox":
      case "kanban":
      case "lists":
        nextDate = api.currentDate.add(1, "day");
        break;
      case "week":
      case "agenda":
        nextDate = api.currentDate.add(1, "week");
        break;
      case "month":
        nextDate = api.currentDate.add(1, "month");
        break;
      case "year":
        nextDate = api.currentDate.add(1, "year");
        break;
      default:
        nextDate = api.currentDate.add(1, "day");
        break;
    }
    api.setCurrentDate(nextDate);
  };

  return (
    <HeaderPortal to="header-calendar-portal-root">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => api.today()}
          className="hover:bg-muted/50 text-muted-foreground flex h-8 items-center gap-2 rounded-md border-none px-3 text-sm font-black tracking-wider uppercase"
        >
          Today
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          className="hover:bg-muted/50 text-muted-foreground flex h-8 items-center gap-2 rounded-md border-none px-3 text-sm font-black tracking-wider"
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="hover:bg-muted/50 text-muted-foreground flex h-8 items-center gap-2 rounded-md border-none px-3 text-sm font-black tracking-wider"
        >
          <ChevronRightIcon />
        </Button>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="hover:bg-muted/50 text-muted-foreground flex h-8 min-w-[170px] w-auto items-center justify-between gap-2 rounded-md border-none px-3 text-sm font-black tracking-wider"
            >
              <span className="truncate">{displayDate}</span>
              <ChevronDown className="size-4 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDateObj}
              onSelect={handleSelect}
              lang={localeCode}
            />
          </PopoverContent>
        </Popover>
      </div>
    </HeaderPortal>
  );
}

export function CalendarView() {
  const { viewMode, setViewMode, setSelectedDate, setStartDateStr, setEndDateStr } =
    useDashboardContext();

  return (
    <div className="flex h-full flex-col p-4">
      <div className="bg-background flex-1 overflow-hidden rounded-xl border shadow-sm">
        <IlamyCalendar
          plugins={[recurrencePlugin(), agendaPlugin(), dragToCreatePlugin()]}
          initialView={viewMode as string}
          onViewChange={(view) => setViewMode(view as ViewMode)}
          headerComponent={<CalendarHeaderControls />}
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
