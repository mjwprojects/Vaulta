import { createServerClient as createSSRServerClient } from "@supabase/ssr";
import type { Database } from "@vaulta/types";

type CookieOptions = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

export function createServerClient(
  url: string,
  anonKey: string,
  cookies: {
    getAll(): { name: string; value: string }[];
    setAll(cookies: CookieOptions[]): void;
  }
) {
  return createSSRServerClient<Database>(url, anonKey, {
    cookies: {
      getAll: () => cookies.getAll(),
      setAll: (cookiesList) => cookies.setAll(cookiesList),
    },
  });
}
