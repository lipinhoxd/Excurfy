import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://culjxolqweufpsjzussy.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_YJsnMlPCWjYe4cROWHNQPg_zKtVpePg";

export const supabase = createClient(url, key);
