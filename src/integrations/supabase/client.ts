// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://afnrcckplletaqljyjyi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbnJjY2twbGxldGFxbGp5anlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMDg0MzgsImV4cCI6MjA1NTg4NDQzOH0.9Sqh5vtPe3ovmfqPAnJZZAoAzzGyPyqCpaVtePhtpWE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);