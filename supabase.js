import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const SUPABASE_URL =
    "https://fchwqspjwpxqksdwglfb.supabase.co";

export const SUPABASE_ANON_KEY =
    "sb_publishable_L_ZIs7dVwBBrQkmU7kfzbg_0QR-ZnwT";

export const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

console.log(
    "EduFlow Supabase connected:",
    supabase
);