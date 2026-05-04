const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize from .env or hardcode (we have the keys in previous scripts)
const supabaseUrl = 'https://rgucydqdqfwjnkveibhr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndWN5ZHFkcWZ3am5rdmVpYmhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNDIzMywiZXhwIjoyMDkzMjAwMjMzfQ.RtBWM7wWIs-KcW71k5bjOL51g7GTOen6-8QDhVq7lsc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log("=== PROFILES TABLE SCHEMA ===");
  const { data: profileData, error: profileErr } = await supabase.from('profiles').select('*').limit(1);
  if (profileErr) console.error("Error fetching profiles:", profileErr);
  else console.log("Profiles sample:", Object.keys(profileData[0] || {}));

  console.log("\n=== STORAGE BUCKETS ===");
  const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
  if (bucketErr) console.error("Error fetching buckets:", bucketErr);
  else console.log("Buckets:", buckets.map(b => b.name));
}

inspect();
