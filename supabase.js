import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://fchwqspjwpxqksdwglfb.supabase.co/rest/v1/";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_L_ZIs7dVwBBrQkmU7kfzbg_0QR-ZnwT";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);