import { createClient } from "@supabase/supabase-js";

// Deja la URL solo hasta .supabase.co (sin /rest/v1/)
const supabaseUrl = "https://tlijznxksapgcokqfuwr.supabase.co";
const supabaseAnonKey = "sb_publishable_uXUTpyDDkRS3I7K9nJe3DA_etwhTxmO";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
