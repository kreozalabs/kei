import {
  AppHeader,
  HeaderTitleArea,
  HeaderSidebarToggle,
  HeaderSearch,
  HeaderNewAction,
} from "@/components/layout/AppHeader";
import { ViewSwitcher } from "@/routes/app/dashboard/components/ViewSwitcher";
import { useDashboardContext } from "@/routes/app/dashboard/context/DashboardContext";
import { parseDateString, formatTitleDate } from "@kreozalabs/kei-core";

export const DashboardHeader = () => {
  const { selectedDate } = useDashboardContext();

  return (
    <AppHeader>
      <div className="flex w-full items-center justify-between">
        {/* Left Section: Toggle & Title Area */}
        <div className="flex items-center">
          <HeaderSidebarToggle />
          <HeaderTitleArea
            title="Timeline"
            subtitle={formatTitleDate(parseDateString(selectedDate))}
          />
        </div>

        {/* Center Section: Calendar Controls (Portaled) & View Switcher */}
        <div className="flex items-center gap-3">
          <div id="calendar-controls-target" className="flex items-center gap-1" />
          <ViewSwitcher />
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-4">
          <HeaderSearch />
          <HeaderNewAction />
        </div>
      </div>
    </AppHeader>
  );
};
