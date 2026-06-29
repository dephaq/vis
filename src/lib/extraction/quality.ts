export type ParseQuality = "good" | "partial" | "poor" | "unsupported";

export function scoreTextQuality(text: string): ParseQuality {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length >= 120) return "good";
  if (normalized.length >= 30) return "partial";
  return "poor";
}

export function statusForQuality(quality: ParseQuality) {
  if (quality === "good" || quality === "partial") return "extracted";
  return "needs_manual_description";
}
