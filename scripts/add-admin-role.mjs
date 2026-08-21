/**
 * Script to add admin role to a user by email
 * Usage: node scripts/add-admin-role.mjs user@example.com
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

const email = process.argv[2];

if (!email) {
  console.error('❌ Usage: node scripts/add-admin-role.mjs <user-email>');
  process.exit(1);
}

async function addAdminRole() {
  console.log(`🔍 Looking for user: ${email}\n`);

  // Find user by email
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name, email, approval_status')
    .eq('email', email)
    .single();

  if (profileError || !profiles) {
    console.error('❌ User not found:', profileError?.message || 'No profile found');
    console.log('\n💡 Make sure the user has signed up first');
    return;
  }

  console.log(`👤 Found: ${profiles.display_name || profiles.email}`);
  console.log(`   ID: ${profiles.id}`);
  console.log(`   Approval: ${profiles.approval_status}\n`);

  // Check if user needs approval
  if (profiles.approval_status === 'pending') {
    console.log('⚠️  User is pending approval. Approving now...');
    const { error: approveError } = await supabase
      .from('profiles')
      .update({
        approval_status: 'approved',
        approved_at: new Date().toISOString(),
      })
      .eq('id', profiles.id);

    if (approveError) {
      console.error('❌ Error approving user:', approveError.message);
      return;
    }
    console.log('✅ User approved\n');
  }

  // Check existing roles
  const { data: existingRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', profiles.id);

  const hasAdmin = existingRoles?.some(r => r.role === 'admin');

  if (hasAdmin) {
    console.log('✅ User already has admin role!');
    return;
  }

  // Delete existing roles and add admin
  console.log('📝 Setting admin role...');
  
  const { error: deleteError } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', profiles.id);

  if (deleteError) {
    console.error('⚠️  Could not delete existing roles:', deleteError.message);
  }

  const { error: insertError } = await supabase
    .from('user_roles')
    .insert({
      user_id: profiles.id,
      role: 'admin'
    });

  if (insertError) {
    console.error('❌ Error adding admin role:', insertError.message);
    return;
  }

  console.log('✅ Admin role added successfully!');
  console.log('\n🔄 Refresh your browser to see the changes');
}

addAdminRole().catch(console.error);
