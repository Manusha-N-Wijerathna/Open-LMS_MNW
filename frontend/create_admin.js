const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kblnrplzmkycyuptyzdr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibG5ycGx6bWt5Y3l1cHR5emRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMDI4OTQsImV4cCI6MjA5Njc3ODg5NH0.dhX22B4jybw4hnz2TmiPE4tlcaKf7BPFr25dDk26kFA'
);

async function main() {
  const { data, error } = await supabase.auth.signUp({
    email: 'manushaugcnuwan@gmail.com',
    password: 'Manu#2002606',
    options: {
      data: { full_name: 'Admin' }
    }
  });
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success:', data.user.id);
  }
}

main();
