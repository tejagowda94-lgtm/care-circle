import { createClient } from '@supabase/supabase-js';

// Replace the text inside the quotes with your actual data from Supabase
const supabaseUrl = 'https://xtsuawlmervnmdcnjwxw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0c3Vhd2xtZXJ2bm1kY25qd3h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NDU2NDYsImV4cCI6MjA5MjUyMTY0Nn0.-VeRGTL8-ha6jF1E3_3MbgLVkgJBPVLaiFwXHnZEPjw';

export const supabase = createClient(supabaseUrl
, supabaseKey);