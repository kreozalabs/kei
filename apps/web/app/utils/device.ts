/**
 * Returns the client-side device identifier stored in localStorage (or creates one).
 */
export function getOrCreateDeviceIdentity(): string {
  if (typeof window === "undefined") return "server";

  let deviceId = localStorage.getItem("kei_device_id");
  if (!deviceId) {
    deviceId = `kei-device-${crypto.randomUUID().slice(0, 8)}`;
    localStorage.setItem("kei_device_id", deviceId);
  }
  return deviceId;
}

/**
 * Returns a user-friendly device name generated from user agent or retrieved from localStorage.
 */
export function getDeviceName(): string {
  if (typeof window === "undefined") return "Server";

  const stored = localStorage.getItem("kei_device_name");
  if (stored) return stored;

  const ua = navigator.userAgent;
  let browser = "Browser";
  let os = "Device";

  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Chrome") && !ua.includes("Chromium") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";

  if (ua.includes("Windows NT")) os = "Windows";
  else if (ua.includes("Macintosh")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  const name = `${browser} on ${os}`;
  localStorage.setItem("kei_device_name", name);
  return name;
}
