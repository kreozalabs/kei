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
