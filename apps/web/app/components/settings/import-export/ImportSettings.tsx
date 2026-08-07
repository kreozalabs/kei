import { importBackupFile } from "@/services/backupService";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { SettingButton } from "../primitives/SettingButton";
import { Input, toast } from "@kreozalabs/kei-ui";

export function ImportSettings() {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const result = await importBackupFile(file);

      if (result.actualImportedCount === 0) {
        toast.info("Database up to date", {
          description: "All events in the backup are already present in your local database.",
        });
      } else {
        toast.success("Data imported successfully", {
          description: `Successfully restored and rebuilt ${result.actualImportedCount} events. Refreshing...`,
        });

        if (result.shouldReload) {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to import data:", error);
      toast.error("Import failed", {
        description: error instanceof Error ? error.message : "Invalid backup file format.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <SettingButton
        label="Import"
        description="Restore your data from a backup (JSON file)."
        icon={<Upload className="text-primary size-4" />}
        onClick={handleImportClick}
        buttonVariant="outline"
        loading={isImporting}
      >
        {isImporting ? "Importing..." : "Import"}
      </SettingButton>

      {/* Hidden browser file input fallback. Triggered programmatically via fileInputRef */}
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleImportChange}
        accept=".json"
        className="hidden"
        aria-label="Import database backup JSON file"
      />
    </>
  );
}
