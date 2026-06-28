import { createClient } from "@supabase/supabase-js";
import type { Database } from "@vaulta/types";

export function createBrowserClient(url: string, anonKey: string) {
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export type { Database } from "@vaulta/types";
export { createClient } from "@supabase/supabase-js";
