import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store";
import { tokenStorage } from "@/core/auth/token-storage";
import {
  clearSession,
  ensureFreshAccessToken,
  refreshAccessToken,
} from "@/core/auth/refresh-session";
import {
  DEMO_ACCOUNTS,
  demoAccountToUser,
} from "@/config/demo-accounts";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token =
      state.auth.accessToken ?? tokenStorage.getAccessToken() ?? undefined;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const tenantId =
      state.auth.user?.activeTenantId ??
      tokenStorage.getPersistedUser<{ activeTenantId?: string }>()
        ?.activeTenantId;

    if (tenantId) {
      headers.set("X-Tenant-Id", tenantId);
    }

    const locale =
      (typeof document !== "undefined" && document.documentElement.lang) ||
      "en";
    headers.set("x-custom-lang", locale);

    return headers;
  },
});

/** Endpoints that must not trigger access-token refresh. */
function isRefreshExemptUrl(url: string): boolean {
  return (
    url.includes("/auth/refresh") ||
    url.includes("/auth/email/login") ||
    url.includes("/auth/login") ||
    url.includes("/auth/logout") ||
    url.includes("/auth/signup") ||
    url.includes("/auth/email/register") ||
    url.includes("/auth/email/confirm") ||
    url.includes("/auth/forgot") ||
    url.includes("/auth/reset") ||
    url.includes("/auth/sectors") ||
    url.includes("/auth/accept-invite")
  );
}

export const baseQueryWithInterceptor: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const url = typeof args === "string" ? args : args.url;
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";

  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (url === "/auth/email/login" || url === "/auth/login") {
      const body = (args as FetchArgs).body as
        | Record<string, string>
        | undefined;
      const account = DEMO_ACCOUNTS.find(
        (u) =>
          u.email === body?.email?.trim().toLowerCase() &&
          u.password === body?.password
      );

      if (!account) {
        return {
          error: {
            status: 401,
            data: { error: "Invalid credentials" },
          } as FetchBaseQueryError,
        };
      }

      tokenStorage.setTokens(
        `mock-access-${account.id}`,
        `mock-refresh-${account.id}`
      );

      return {
        data: {
          token: `mock-access-${account.id}`,
          refreshToken: `mock-refresh-${account.id}`,
          tokenExpires: Date.now() + 3600000,
          user: {
            id: account.id,
            email: account.email,
            firstName: account.name.split(" ")[0],
            lastName: account.name.split(" ").slice(1).join(" "),
          },
          activeTenant: {
            id: account.activeTenantId,
            businessName: account.activeTenantName,
            taxRegime: "vat",
            fiscalYearStart: 7,
            currency: "ETB",
          },
          tenantRole: account.role,
          tenants: demoAccountToUser(account).tenants,
        },
      };
    }

    if (url === "/auth/me") {
      const token = tokenStorage.getAccessToken();
      if (token) {
        const userId = token.replace("mock-access-", "");
        const account =
          DEMO_ACCOUNTS.find((u) => u.id === userId) || DEMO_ACCOUNTS[0];
        const [firstName, ...rest] = account.name.split(" ");
        return {
          data: {
            id: account.id,
            email: account.email,
            firstName,
            lastName: rest.join(" "),
            isPlatformAdmin: false,
          },
        };
      }
      return {
        error: {
          status: 401,
          data: { error: "Unauthenticated" },
        } as FetchBaseQueryError,
      };
    }

    if (url === "/auth/tenants") {
      const token = tokenStorage.getAccessToken();
      if (token) {
        const userId = token.replace("mock-access-", "");
        const account =
          DEMO_ACCOUNTS.find((u) => u.id === userId) || DEMO_ACCOUNTS[0];
        return { data: demoAccountToUser(account).tenants };
      }
      return {
        error: {
          status: 401,
          data: { error: "Unauthenticated" },
        } as FetchBaseQueryError,
      };
    }

    if (url === "/auth/logout") {
      tokenStorage.clearTokens();
      return { data: { success: true } };
    }
  }

  const canRefresh = !isMock && !isRefreshExemptUrl(url);

  if (canRefresh) {
    const token = await ensureFreshAccessToken(api.dispatch);
    if (!token && !tokenStorage.getAccessToken()) {
      return {
        error: {
          status: 401,
          data: { error: "Session expired" },
        } as FetchBaseQueryError,
      };
    }
  }

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401 && canRefresh) {
    const refreshed = await refreshAccessToken(api.dispatch);
    if (refreshed) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      clearSession(api.dispatch);
    }
  }

  return result;
};
