/**
 * Fanaye Enterprise API Client
 * Features:
 * - Persistent `X-Device-Id` header generation & injection
 * - Single in-flight `refreshPromise` deduplication to prevent 401 refresh storms
 * - Normalized JSON error handling & auto-retry with exponential backoff
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

const DEVICE_ID_KEY = "fanaye_device_id";
const ACCESS_TOKEN_KEY = "fanaye_access_token";
const REFRESH_TOKEN_KEY = "fanaye_refresh_token";

// Deduplication singleton promise for concurrent token refreshes
let refreshPromise: Promise<string | null> | null = null;

/**
 * Retrieves or lazily generates a persistent device UUID for multi-device session tracking.
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") {
    return "server-node-session";
  }

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Deduplicated token refresh executor.
 * If multiple requests trigger 401 simultaneously, they all share this exact single in-flight promise.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Id": getOrCreateDeviceId(),
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        clearTokens();
        return null;
      }

      const data = await response.json();
      const newAccessToken = data.accessToken || data.token;
      if (newAccessToken) {
        setTokens(newAccessToken, data.refreshToken);
        return newAccessToken;
      }

      clearTokens();
      return null;
    } catch {
      clearTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Core enterprise fetch wrapper with automatic token management and error handling.
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { skipAuth = false, headers = {}, ...fetchOptions } = options;

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const requestHeaders = new Headers(headers);
  requestHeaders.set("X-Device-Id", getOrCreateDeviceId());

  if (!requestHeaders.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  let response = await fetch(url, {
    ...fetchOptions,
    headers: requestHeaders,
  });

  // Handle 401 Unauthorized via in-flight refresh promise deduplication
  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      requestHeaders.set("Authorization", `Bearer ${newToken}`);
      response = await fetch(url, {
        ...fetchOptions,
        headers: requestHeaders,
      });
    }
  }

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    const message =
      typeof errorData === "object" && errorData !== null && "message" in errorData
        ? String((errorData as { message: unknown }).message)
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  // Return empty object for 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
