const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rgucydqdqfwjnkveibhr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndWN5ZHFkcWZ3am5rdmVpYmhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNDIzMywiZXhwIjoyMDkzMjAwMjMzfQ.RtBWM7wWIs-KcW71k5bjOL51g7GTOen6-8QDhVq7lsc'
);

async function clearRequests() {
  // 1. Get user ID
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) throw userError;

  const targetUser = users.users.find(u => u.email === 'rhyleematte@gmail.com');
  if (!targetUser) {
    console.log('User not found');
    return;
  }

  // 2. Delete pending requests
  const { data, error } = await supabase
    .from('subscription_requests')
    .delete()
    .eq('user_id', targetUser.id)
    .eq('status', 'pending');
  
  if (error) {
    console.error('Error deleting requests:', error.message);
  } else {
    console.log('Successfully cleared pending requests for rhyleematte@gmail.com');
  }
}

clearRequests();
