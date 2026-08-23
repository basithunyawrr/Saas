import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://fchwqspjwpxqksdwglfb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_PUBLISHABsb_publishable_L_ZIs7dVwBBrQkmU7kfzbg_0QR-ZnwTLE_KEY";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);