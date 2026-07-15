// NOTE: On mobile order is different: {calendar that opens down moving page} {space} {search} {today} {view switcher}
// NOTE: Otherwise: {title} {space} {today} {arrows} {calendar that opens as popover}{space}{search}{view switcher}{new action}

import { AppHeader } from "@/components/layout/AppHeader";
import { HeaderTitleArea } from "@/components/layout/HeaderTitleArea";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { HeaderNewAction } from "@/components/layout/HeaderNewAction";
import { ViewSwitcher } from "@/routes/app/dashboard/components/ViewSwitcher";

export const DashboardHeader = () => {
  return (
    <AppHeader>
      <div className="flex w-full flex-col">
        {/* Main Header Row */}
        <div className="flex w-full items-center justify-between">
          {/* Mobile Left: Calendar Trigger portal target */}
          <div id="calendar-mobile-trigger-target" className="mr-2 flex min-w-0 flex-1 md:hidden" />

          {/* Desktop Left: Title Area & Today, Arrows, Calendar Popover portal target */}
          <div className="hidden items-center gap-2 md:flex">
            <HeaderTitleArea title="Timeline" />
            <div
              id="calendar-desktop-controls-target"
              className="hidden items-center gap-4 md:ml-5 md:flex lg:ml-18"
            />
          </div>

          {/* Right Section: Actions */}
          <div className="flex shrink-0 items-center gap-1 md:gap-4">
            <HeaderSearch />

            {/* Mobile Today portal target */}
            <div id="calendar-mobile-today-target" className="flex md:hidden" />

            <ViewSwitcher />
            <HeaderNewAction />
          </div>
        </div>

        {/* Mobile Dropdown Calendar Panel target */}
        <div id="calendar-mobile-dropdown-target" className="w-full md:hidden" />
      </div>
    </AppHeader>
  );
};
