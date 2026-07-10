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
  const displayDate = getDisplayDate(selectedDateObj, viewMode, localeCode);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      api.setCurrentDate(
        api.currentDate.year(date.getFullYear()).month(date.getMonth()).date(date.getDate())
      );
      setIsOpen(false);
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

  return (
    <HeaderPortal to="header-calendar-portal-root">
      <div className="flex items-center">
        <Button size="default" variant="outline" onClick={() => api.today()}>
          Today
        </Button>
        <Button variant="ghost" size="icon" onClick={handlePrev}>
          <ChevronLeftIcon />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleNext}>
          <ChevronRightIcon />
        </Button>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <span className="truncate">{displayDate}</span>
              <ChevronDown />
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
