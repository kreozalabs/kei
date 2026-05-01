export const formatTime = (time24: string, format: "12h" | "24h") => {
  if (!time24) return "";
  if (format === "24h") return time24;
  const [h, m] = time24.split(":");
  const hours = parseInt(h, 10);
  const ampm = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${m}${ampm}`;
};
