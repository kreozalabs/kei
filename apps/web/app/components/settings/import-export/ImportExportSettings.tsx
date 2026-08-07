import { Database } from "lucide-react";
import { SettingSection } from "../primitives/SettingSection";
import { ImportSettings } from "./ImportSettings";
import { ExportSettings } from "./ExportSettings";

export function ImportExportSettings() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-1 py-2 sm:px-2">
      <SettingSection
        id="import-export"
        title="Export & Import"
        description="Export and Import Your Data."
        icon={<Database className="size-4" />}
      >
        <ExportSettings />
        <ImportSettings />
      </SettingSection>
    </div>
  );
}
