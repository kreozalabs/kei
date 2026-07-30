import * as React from "react";
import { SettingCombobox, type SettingComboboxProps, type ComboboxGroup } from "./SettingCombobox";
import {
  formatTimezoneLabel,
  getRecentTimezones,
  addRecentTimezone,
  getTimezoneOptions,
} from "@/utils/timezoneUtils";

export type TimeZoneComboboxProps = Omit<
  SettingComboboxProps,
  "options" | "groups" | "searchValue" | "onSearchValueChange"
>;

export function TimeZoneCombobox({
  value = "system",
  onValueChange,
  onChange,
  placeholder = "Select time zone...",
  searchPlaceholder = "Type city or GMT offset to search...",
  emptyText = "No time zone found.",
  ...props
}: TimeZoneComboboxProps) {
  const [search, setSearch] = React.useState("");
  const [recent, setRecent] = React.useState<string[]>(() => getRecentTimezones());
  const deferredSearch = React.useDeferredValue(search);

  // Refresh recent list when dropdown opens
  const handleOpenChange = React.useCallback((open: boolean) => {
    if (open) {
      setRecent(getRecentTimezones());
    }
  }, []);

  const handleSelect = React.useCallback(
    (selectedTz: string) => {
      const val = selectedTz || "system";
      if (val !== "system") {
        addRecentTimezone(val);
        setRecent(getRecentTimezones());
      }
      onValueChange?.(val);
      onChange?.(val);
      setSearch("");
    },
    [onValueChange, onChange]
  );

  // Compute timezone option groups (search results vs System & Recently Used)
  const groups = React.useMemo<ComboboxGroup[]>(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (query) {
      const matches = getTimezoneOptions()
        .filter((opt) => opt.searchKey.includes(query))
        .slice(0, 50)
        .map(({ value: tzVal, label }) => ({ value: tzVal, label }));

      return [{ heading: "Matching Time Zones", options: matches }];
    }

    const list: ComboboxGroup[] = [
      {
        heading: "System & Selection",
        options: [
          { value: "system", label: formatTimezoneLabel("system") },
          ...(value && value !== "system" ? [{ value, label: formatTimezoneLabel(value) }] : []),
        ],
      },
    ];

    const recentOptions = recent
      .filter((tz) => tz !== "system" && tz !== value)
      .map((tz) => ({ value: tz, label: formatTimezoneLabel(tz) }));

    if (recentOptions.length > 0) {
      list.push({ heading: "Recently Used", options: recentOptions });
    }

    return list;
  }, [deferredSearch, value, recent]);

  return (
    <SettingCombobox
      value={value}
      onValueChange={handleSelect}
      groups={groups}
      searchValue={search}
      onSearchValueChange={setSearch}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyText={emptyText}
      onOpenChange={handleOpenChange}
      footer={
        !search.trim() ? (
          <div className="text-muted-foreground border-border/40 mt-1 border-t px-3 py-2 text-center text-xs italic">
            Type in search bar to find all time zones...
          </div>
        ) : null
      }
      {...props}
    />
  );
}
