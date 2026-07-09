import { IlamyCalendar } from "@kreozalabs/kei-calendar";
import { recurrencePlugin } from "@kreozalabs/kei-calendar/plugins/recurrence";
import { agendaPlugin } from "@kreozalabs/kei-calendar/plugins/agenda";
import { dragToCreatePlugin } from "@kreozalabs/kei-calendar/plugins/drag-to-create";

export function CalendarView() {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="bg-background flex-1 overflow-hidden rounded-xl border shadow-sm">
        <IlamyCalendar
          plugins={[recurrencePlugin(), agendaPlugin(), dragToCreatePlugin()]}
          initialView="month"
        />
      </div>
    </div>
  );
}
