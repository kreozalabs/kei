import { useMemo, useCallback } from "react";
import { useSettings } from "@/providers/SettingsContext";
import {
  getEffectiveDateFormat,
  getEffectiveTimeFormat,
  getEffectiveLanguage,
  getEffectiveTimezone,
  formatDate as formatWithSettings,
  formatTimeValue as formatTimeWithSettings,
  formatDurationValue as formatDurationWithSettings,
} from "@/utils/systemLocalization";
import { TIME_FORMATS } from "@kreozalabs/kei-core";

/**
 * Primary React hook for application date, time, timezone, and language localization.
 * Consumes SettingsContext to resolve system defaults and provides pre-bound
 * formatting helpers (`formatDate`, `formatTime`, `formatDuration`) for UI rendering.
 *
 * @example
 * const { formatDate, formatTime } = useLocalization();
 * return <div>{formatDate(action.scheduledDate)} - {formatTime(action.startTime)}</div>;
 */
export function useLocalization() {
  const { settings } = useSettings();

  const effectiveDateFormat = useMemo(
    () => getEffectiveDateFormat(settings.date_format),
    [settings.date_format]
  );
  const effectiveTimeFormat = useMemo(
    () => getEffectiveTimeFormat(settings.time_format),
    [settings.time_format]
  );
  const effectiveLanguage = useMemo(
    () => getEffectiveLanguage(settings.language),
    [settings.language]
  );
  const effectiveTimezone = useMemo(
    () => getEffectiveTimezone(settings.timezone),
    [settings.timezone]
  );

  const formatDate = useCallback(
    (date: Date | string | number) =>
      formatWithSettings(date, settings.date_format, settings.timezone, settings.language),
    [settings.date_format, settings.timezone, settings.language]
  );

  const formatTime = useCallback(
    (time: Date | string | number) =>
      formatTimeWithSettings(time, settings.time_format, settings.timezone, settings.language),
    [settings.time_format, settings.timezone, settings.language]
  );

  const formatDuration = useCallback(
    (min: number, max: number | null = null) =>
      formatDurationWithSettings(min, max, settings.language),
    [settings.language]
  );

  const is24Hour = effectiveTimeFormat === TIME_FORMATS.H24;
  const hourCycle = is24Hour ? "h23" : "h12";

  return {
    settings,
    effectiveDateFormat,
    effectiveTimeFormat,
    effectiveLanguage,
    effectiveTimezone,
    is24Hour,
    hourCycle,
    formatDate,
    formatTime,
    formatDuration,
  };
}
