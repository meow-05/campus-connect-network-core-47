
import { supabase } from "@/integrations/supabase/client";

// Supabase hook
export function useSupabase() {
  return supabase;
}
