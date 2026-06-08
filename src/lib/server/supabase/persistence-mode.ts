import { isSupabaseConfigured } from "@/lib/supabase/config";

/** True when API persistence should read/write Supabase instead of `.data` JSON. */
export function useSupabasePersistence(): boolean {
  if (process.env.YVITY_FORCE_LOCAL_DATA === "true") return false;
  return isSupabaseConfigured();
}
