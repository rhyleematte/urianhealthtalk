const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rgucydqdqfwjnkveibhr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndWN5ZHFkcWZ3am5rdmVpYmhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNDIzMywiZXhwIjoyMDkzMjAwMjMzfQ.RtBWM7wWIs-KcW71k5bjOL51g7GTOen6-8QDhVq7lsc'
);

async function inviteUser() {
  const { data, error } = await supabase.auth.admin.inviteUserByEmail('rhyleematte@gmail.com');
  
  if (error) {
    console.error('Error inviting user:', error.message);
  } else {
    console.log('User invited successfully:', data);
  }
}

inviteUser();
