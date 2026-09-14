const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kblnrplzmkycyuptyzdr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibG5ycGx6bWt5Y3l1cHR5emRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMDI4OTQsImV4cCI6MjA5Njc3ODg5NH0.dhX22B4jybw4hnz2TmiPE4tlcaKf7BPFr25dDk26kFA'
);

async function main() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'manushaugcnuwan@gmail.com',
    password: 'Manu#2002606',
  });
  if (error) {
    console.error('Login error:', error.message);
    return;
  }
  const token = data.session.access_token;
  console.log('Access token:', token);
  
  // Decode header
  const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString());
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
  console.log('Header:', header);
  console.log('Payload:', JSON.stringify(payload, null, 2));
}

main();
