import { publicProcedure } from "../../../create-context";
import { createClient } from "@supabase/supabase-js";

export const supabaseHealthProcedure = publicProcedure.query(async () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      status: "error",
      connected: false,
      message: "Supabase credentials not configured",
    };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from("subjects").select("id").limit(1);

    if (error) {
      return {
        status: "error",
        connected: false,
        message: error.message,
        details: "Database query failed. Check if tables exist and RLS policies allow access.",
      };
    }

    return {
      status: "ok",
      connected: true,
      message: "Supabase connection successful",
      tablesChecked: ["subjects"],
    };
  } catch (err) {
    return {
      status: "error",
      connected: false,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
});

export default supabaseHealthProcedure;
