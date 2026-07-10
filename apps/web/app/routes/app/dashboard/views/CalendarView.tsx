import { useState } from "react";
import { IlamyCalendar, useIlamyCalendarContext } from "@kreozalabs/kei-calendar";
import { recurrencePlugin } from "@kreozalabs/kei-calendar/plugins/recurrence";
import { agendaPlugin } from "@kreozalabs/kei-calendar/plugins/agenda";
import { dragToCreatePlugin } from "@kreozalabs/kei-calendar/plugins/drag-to-create";
import { Button, Popover, PopoverTrigger, PopoverContent, Calendar } from "@kreozalabs/kei-ui";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDown } from "lucide-react";
import { HeaderPortal } from "../../dashboard";
import { useSettings } from "@/providers/SettingsContext";
import { useDashboardContext } from "../context/DashboardContext";

function CalendarHeaderControls() {
  const api = useIlamyCalendarContext();
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  const localeCode = settings.language === "auto" ? undefined : settings.language;
  const selectedDateObj = api.currentDate.toDate();

  const displayDate = selectedDateObj.toLocaleDateString(localeCode, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      api.setCurrentDate(
        api.currentDate.year(date.getFullYear()).month(date.getMonth()).date(date.getDate())
      );
      setIsOpen(false);
    }
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
          onClick={() => api.prevPeriod()}
          className="hover:bg-muted/50 text-muted-foreground flex h-8 items-center gap-2 rounded-md border-none px-3 text-sm font-black tracking-wider"
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => api.nextPeriod()}
          className="hover:bg-muted/50 text-muted-foreground flex h-8 items-center gap-2 rounded-md border-none px-3 text-sm font-black tracking-wider"
        >
          <ChevronRightIcon />
        </Button>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="hover:bg-muted/50 text-muted-foreground flex h-8 w-[170px] items-center justify-between gap-2 rounded-md border-none px-3 text-sm font-black tracking-wider"
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
  const { setSelectedDate } = useDashboardContext();

  return (
    <div className="flex h-full flex-col p-4">
      <div className="bg-background flex-1 overflow-hidden rounded-xl border shadow-sm">
        <IlamyCalendar
          plugins={[recurrencePlugin(), agendaPlugin(), dragToCreatePlugin()]}
          initialView="day"
          headerComponent={<CalendarHeaderControls />}
          onDateChange={(date) => setSelectedDate(date.format("YYYY-MM-DD"))}
        />
      </div>
    </div>
  );
}
