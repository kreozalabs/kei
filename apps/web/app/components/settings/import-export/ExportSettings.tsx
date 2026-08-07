import { exportBackupFile } from "@/services/backupService";
import { useState } from "react";
import { SettingButton } from "../primitives/SettingButton";
import { Download } from "lucide-react";
import { toast } from "@kreozalabs/kei-ui";

export function ExportSettings() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportedCount = await exportBackupFile();
      toast.success("Data exported successfully", {
        description: `Exported ${exportedCount} events. Keep this file safe!`,
      });
    } catch (error) {
      console.error("Failed to export data:", error);
      toast.error("Export failed", {
        description: "Check the console for more details.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SettingButton
      label="Export"
      description="Back up your data (JSON file)."
      icon={<Download className="text-primary size-4" />}
      onClick={handleExport}
      buttonVariant="outline"
      loading={isExporting}
    >
      {isExporting ? "Exporting..." : "Export"}
    </SettingButton>
  );
}
