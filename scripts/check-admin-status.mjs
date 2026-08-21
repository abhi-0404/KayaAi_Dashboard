/**
 * Quick script to verify admin role assignment in Supabase
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Simple .env.local parser
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const env = {};
    
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
    return env;
  } catch (error) {
    console.error('Could not load .env.local:', error.message);
    return {};
  }
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminStatus() {
  console.log('🔍 Checking admin status...\n');

  // Get all profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name, email, approval_status');

  if (profileError) {
    console.error('❌ Error fetching profiles:', profileError.message);
    return;
  }

  console.log(`📋 Found ${profiles.length} profile(s):\n`);

  for (const profile of profiles) {
    console.log(`👤 ${profile.display_name || profile.email || 'Unknown'}`);
    console.log(`   ID: ${profile.id}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Approval: ${profile.approval_status}`);

    // Check roles for this user
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', profile.id);

    if (roleError) {
      console.log(`   Roles: Error - ${roleError.message}`);
    } else if (roles.length === 0) {
      console.log(`   Roles: ⚠️  No roles assigned (defaults to supervisor)`);
    } else {
      console.log(`   Roles: ✅ ${roles.map(r => r.role).join(', ')}`);
    }
    console.log('');
  }

  console.log('\n💡 To add admin role to a user, run:');
  console.log('   node scripts/add-admin-role.mjs <user-email>');
}

checkAdminStatus().catch(console.error);
