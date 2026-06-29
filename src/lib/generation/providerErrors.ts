export type SanitizedProviderError = {
  code: string;
  message: string;
  retryable: boolean;
};

const secretPattern = /(GEMINI_API_KEY|x-goog-api-key|api[_-]?key)\s*=?\s*[^,\s"]+/gi;

export function mapProviderError(error: unknown): SanitizedProviderError {
  const raw = error instanceof Error ? error.message : String(error);
  const message = raw.replace(secretPattern, "$1=[redacted]");
  const lower = raw.toLowerCase();

  if (lower.includes("rate") || lower.includes("429")) {
    return { code: "rate_limited", message: "Provider rate limit reached. Try again later.", retryable: true };
  }
  if (lower.includes("api key") || lower.includes("unauthorized") || lower.includes("401")) {
    return { code: "provider_auth", message: "Image provider credentials are invalid or missing.", retryable: false };
  }
  if (lower.includes("safety") || lower.includes("blocked")) {
    return { code: "provider_blocked", message: "Provider blocked the request for safety or policy reasons.", retryable: false };
  }
  if (lower.includes("500") || lower.includes("503") || lower.includes("timeout")) {
    return { code: "provider_transient", message: "Image provider is temporarily unavailable.", retryable: true };
  }

  return { code: "provider_error", message: message || "Image provider failed.", retryable: false };
}
