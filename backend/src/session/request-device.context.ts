import { AsyncLocalStorage } from 'async_hooks';

export type RequestDeviceStore = {
  deviceId?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
};

/** Per-request browser/device identity forwarded by the BFF or gateway (`X-Device-Id`, `User-Agent`). */
export const requestDeviceContext = new AsyncLocalStorage<RequestDeviceStore>();

export function getRequestDeviceStore(): RequestDeviceStore {
  return requestDeviceContext.getStore() ?? {};
}
