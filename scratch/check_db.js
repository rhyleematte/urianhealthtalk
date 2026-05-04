const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rgucydqdqfwjnkveibhr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndWN5ZHFkcWZ3am5rdmVpYmhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNDIzMywiZXhwIjoyMDkzMjAwMjMzfQ.RtBWM7wWIs-KcW71k5bjOL51g7GTOen6-8QDhVq7lsc'
);

async function checkDatabase() {
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) return console.error('Error fetching users:', userError);

  console.log(`Found ${users.users.length} users.`);
  
  for (const user of users.users) {
    console.log(`\nUser: ${user.email} (ID: ${user.id})`);
    console.log(`Auth Providers: ${user.app_metadata.providers.join(', ')}`);
    
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profile) {
      console.log(`Profile Plan: ${profile.plan_type}`);
      console.log(`Profile Expires: ${profile.plan_expires_at}`);
    } else {
      console.log('No profile found.');
    }
  }
}

checkDatabase();
