/**
 * Utility to trigger a browser JSON file download from any object/payload.
 */
export function downloadJsonFile(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Reads a File object and parses its JSON content with standard validation.
 */
export async function readJsonFile<T = unknown>(file: File): Promise<T> {
  const text = await file.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Invalid JSON: The uploaded file is not a valid JSON document.");
  }
}
