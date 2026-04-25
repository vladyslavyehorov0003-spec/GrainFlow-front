export const SERVER_ERROR_MESSAGE  = "Something went wrong. Please try again later.";
export const NETWORK_ERROR_MESSAGE = "Network error. Check your connection.";
const UNKNOWN_ERROR_MESSAGE        = "Unexpected error.";

interface ApiErrorOpts {
  status?:        number;
  isNetworkError?: boolean;
  serverMessage?:  string | null;
}

/**
 * Normalized error thrown by the api interceptor for any failed request.
 * Components catch this and read `.message` (already user-friendly) or
 * use `getErrorMessage()` to apply a context-specific fallback.
 */
export class ApiError extends Error {
  readonly status:         number;
  readonly isServerError:  boolean;
  readonly isNetworkError: boolean;
  /** Original backend `message` field for 4xx responses. Null otherwise. */
  readonly serverMessage:  string | null;

  constructor(message: string, opts: ApiErrorOpts = {}) {
    super(message);
    this.name           = "ApiError";
    this.status         = opts.status ?? 0;
    this.isServerError  = (opts.status ?? 0) >= 500;
    this.isNetworkError = opts.isNetworkError ?? false;
    this.serverMessage  = opts.serverMessage ?? null;
  }
}

/**
 * Picks the best message to show the user:
 *  - 5xx / network → generic message (never leak backend internals)
 *  - 4xx with backend message → backend message
 *  - 4xx without backend message → caller-provided fallback
 *  - non-ApiError → fallback
 */
export function getErrorMessage(error: unknown, fallback?: string): string {
  if (error instanceof ApiError) {
    if (error.isServerError || error.isNetworkError) return error.message;
    return error.serverMessage ?? fallback ?? error.message;
  }
  return fallback ?? UNKNOWN_ERROR_MESSAGE;
}
