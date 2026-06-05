import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://unbxwjbgmmdtkjeggndm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuYnh3amJnbW1kdGtqZWdnbmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MTQxMzksImV4cCI6MjA5NjA5MDEzOX0.8hTug7JG4XY21NFDi1y74Tys7X_8YegLW-0jbjdIQL8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
