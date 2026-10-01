import type { AppDispatch } from "@/store";
import { tokenStorage } from "@/core/auth/token-storage";
import { isAccessTokenExpired } from "@/core/auth/jwt";
import { clearUser, setTokens } from "@/domains/auth/store/auth.slice";

type RefreshResponse = {
  token: string;
  refreshToken: string;
  tokenExpires: number;
};

type RefreshDispatch = AppDispatch | ((action: unknown) => unknown);

/** Refresh tokens are single-use — share one in-flight refresh across callers. */
let refreshPromise: Promise<boolean> | null = null;

async function performRefresh(dispatch?: RefreshDispatch): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken || refreshToken.startsWith("mock-")) {
    return false;
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) return false;

    const data = (await response.json()) as RefreshResponse;
    if (!data.token || !data.refreshToken) return false;

    tokenStorage.setTokens(data.token, data.refreshToken);
    dispatch?.(
      setTokens({
        accessToken: data.token,
        refreshToken: data.refreshToken,
      })
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Exchange the refresh token for a new access + refresh pair.
 * Concurrent callers await the same in-flight request (backend refresh is single-use).
 */
export function refreshAccessToken(
  dispatch?: RefreshDispatch
): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = performRefresh(dispatch).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/** Ensure a usable access token exists, refreshing when expired or about to expire. */
export async function ensureFreshAccessToken(
  dispatch?: RefreshDispatch
): Promise<string | null> {
  const accessToken = tokenStorage.getAccessToken();
  if (!accessToken) return null;

  if (!isAccessTokenExpired(accessToken)) {
    return accessToken;
  }

  const refreshed = await refreshAccessToken(dispatch);
  if (!refreshed) {
    if (isAccessTokenExpired(accessToken, 0)) {
      tokenStorage.clearTokens();
      dispatch?.(clearUser());
      return null;
    }
    return accessToken;
  }

  return tokenStorage.getAccessToken();
}

export function clearSession(dispatch?: RefreshDispatch): void {
  tokenStorage.clearTokens();
  dispatch?.(clearUser());
}
