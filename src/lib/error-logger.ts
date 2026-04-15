// Client-side error logger
// Fire-and-forget — doesn't block the user if logging fails

interface LogErrorOptions {
  source: string;
  message: string;
  level?: "error" | "warning" | "info";
  stack?: string;
  metadata?: Record<string, any>;
  userId?: string;
  userEmail?: string;
}

// Deduplicate errors: don't log the same error twice within 5 seconds
const recentErrors = new Map<string, number>();
const DEDUPE_WINDOW_MS = 5000;

export async function logError(options: LogErrorOptions): Promise<void> {
  try {
    // Build a dedup key
    const dedupKey = `${options.source}:${options.message}`;
    const now = Date.now();
    const lastLogged = recentErrors.get(dedupKey);
    if (lastLogged && now - lastLogged < DEDUPE_WINDOW_MS) {
      return; // Skip duplicate
    }
    recentErrors.set(dedupKey, now);

    // Clean up old entries to prevent memory leak
    if (recentErrors.size > 100) {
      const cutoff = now - DEDUPE_WINDOW_MS;
      for (const [key, time] of recentErrors.entries()) {
        if (time < cutoff) recentErrors.delete(key);
      }
    }

    await fetch("/api/admin/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: options.level || "error",
        source: options.source,
        message: options.message,
        stack: options.stack,
        metadata: options.metadata,
        userId: options.userId,
        userEmail: options.userEmail,
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
        url: typeof window !== "undefined" ? window.location.pathname + window.location.search : undefined,
      }),
    });
  } catch {
    // Silently fail — don't cascade errors
  }
}

// Helper to log from a try/catch block
export function logCaughtError(source: string, err: unknown, metadata?: Record<string, any>) {
  const error = err instanceof Error ? err : new Error(String(err));
  logError({
    source,
    message: error.message,
    stack: error.stack,
    metadata,
  });
}

// Install global error handlers (call once on app load)
export function installGlobalErrorHandlers(userId?: string, userEmail?: string) {
  if (typeof window === "undefined") return;

  // Unhandled JS errors
  window.addEventListener("error", (event) => {
    logError({
      source: "window.error",
      message: event.message || "Unknown error",
      stack: event.error?.stack,
      userId,
      userEmail,
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // Unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack : undefined;
    logError({
      source: "unhandledrejection",
      message,
      stack,
      userId,
      userEmail,
    });
  });
}
