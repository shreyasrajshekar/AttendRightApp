// supabase.js
import { createClient } from "@supabase/supabase-js";

// Your public Supabase URL + anon key
const SUPABASE_URL = "https://bcvswzcdujealdrdoqdg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdnN3emNkdWplYWxkcmRvcWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjA1OTUsImV4cCI6MjA3MTM5NjU5NX0.wf0vw3U8urvvJLWq_l75sf6AWe9_co_ZsSlK3BczOJ0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
