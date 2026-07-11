import {
  AppHeader,
  HeaderTitleArea,
  HeaderSidebarToggle,
  HeaderSearch,
  HeaderNewAction,
} from "@/components/layout/AppHeader";
import { ViewSwitcher } from "@/routes/app/dashboard/components/ViewSwitcher";
// TODO: Make them bigger
export const DashboardHeader = () => {
  return (
    <AppHeader>
      <div className="flex w-full items-center justify-between">
        {/* Left Section: Toggle & Title Area & Calendar */}
        <div className="flex items-center gap-4 md:gap-20">
          <div className="flex items-center gap-2">
            <HeaderSidebarToggle />
            <HeaderTitleArea title="Timeline" />
          </div>
          <div id="calendar-controls-target" />
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-4">
          <HeaderSearch />
          <ViewSwitcher />
          <HeaderNewAction />
        </div>
      </div>
    </AppHeader>
  );
};
