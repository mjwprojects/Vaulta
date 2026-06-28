import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@vaulta/types";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesList) => {
          try {
            for (const { name, value, options } of cookiesList) {
              cookieStore.set(name, value, options);
            }
          } catch {}
        },
      },
    }
  );
}
