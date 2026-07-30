import { AppHeader } from "@/components/layout/AppHeader";
import { HeaderTitleArea } from "@/components/layout/HeaderTitleArea";
import { HeaderSearch } from "@/components/layout/HeaderSearch";

export const SettingsHeader = () => {
  return (
    <AppHeader>
      <div className="flex w-full flex-col">
        {/* Main Header Row */}
        <div className="flex w-full items-center justify-between">
          {/* Return button */}
          {/* Desktop Left: Title Area & Today, Arrows, Calendar Popover portal target */}
          <div className="hidden items-center gap-2 md:flex">
            <HeaderTitleArea title="Settings" />
          </div>
          {/* Search button focused on content of settings. Extended width on desktop? Icon on mobile.*/}

          <HeaderSearch />
        </div>
      </div>
    </AppHeader>
  );
};
