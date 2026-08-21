#!/usr/bin/env node
/**
 * Quick test worker seeder
 * Creates 3-4 test workers with devices and status that will show up in the Workers page
 * 
 * Usage: node scripts/seed-test-workers.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not load .env.local file');
  }
}

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function minutesAgo(minutes) {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutes);
  return date.toISOString();
}

async function main() {
  console.log('👷 Seeding test workers...\n');

  // Get existing profiles
  const { data: existingProfiles } = await supabase
    .from('profiles')
    .select('id, display_name, email');

  if (!existingProfiles || existingProfiles.length === 0) {
    console.error('❌ No user profiles found. Please sign up at least one user first.');
    process.exit(1);
  }

  console.log(`Found ${existingProfiles.length} existing user(s)\n`);

  // Get a project to assign workers to
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .limit(1);

  if (!projects || projects.length === 0) {
    console.error('❌ No projects found. Run npm run seed first.');
    process.exit(1);
  }

  const project = projects[0];
  console.log(`Using project: ${project.name}\n`);

  // Get zones for the project
  const { data: zones } = await supabase
    .from('zones')
    .select('id, name')
    .eq('project_id', project.id)
    .limit(5);

  const devices = [];
  const workerStatuses = [];
  const deviceNames = ['RealWear Navigator 520', 'Vuzix M400', 'Google Glass Enterprise 2', 'ThirdEye X2'];
  const tasks = [
    'Installing electrical conduits',
    'Framing interior walls',
    'Pouring concrete',
    'Installing HVAC',
  ];

  // Use first 4 profiles (or all if less than 4)
  const profilesToUse = existingProfiles.slice(0, Math.min(4, existingProfiles.length));

  for (const profile of profilesToUse) {
    const zone = zones && zones.length > 0 ? randomItem(zones) : null;
    const aiSession = randomItem(['active', 'active', 'idle']); // Mostly active
    
    // Create device
    devices.push({
      id: randomUUID(),
      user_id: profile.id,
      name: randomItem(deviceNames),
      firmware: `v3.${randomInt(0, 9)}.${randomInt(0, 20)}`,
      adapter: 'bluetooth',
      is_simulated: false,
      battery_level: aiSession === 'active' ? randomInt(60, 95) : randomInt(20, 50),
      charging: false,
      storage_used_gb: randomInt(8, 20),
      storage_total_gb: 32,
      connection_state: aiSession === 'active' ? 'connected' : 'idle',
      media_transport: aiSession === 'active' ? 'streaming' : 'stored',
      project_id: project.id,
      last_seen_at: minutesAgo(randomInt(1, 10)),
    });

    // Create worker status
    workerStatuses.push({
      user_id: profile.id,
      project_id: project.id,
      zone_id: zone?.id || null,
      ai_session: aiSession,
      task: randomItem(tasks),
      hazard: null,
      hazard_severity: null,
      last_active_at: minutesAgo(randomInt(1, 15)),
    });
  }

  // Insert devices
  console.log(`Creating ${devices.length} devices...`);
  const { error: devicesError } = await supabase.from('devices').insert(devices);
  if (devicesError) {
    console.error('❌ Error creating devices:', devicesError.message);
  } else {
    console.log(`✓ Created ${devices.length} devices\n`);
  }

  // Insert worker statuses
  console.log(`Creating ${workerStatuses.length} worker status records...`);
  const { error: statusError } = await supabase.from('worker_status').insert(workerStatuses);
  if (statusError) {
    console.error('❌ Error creating worker status:', statusError.message);
    console.error('Details:', statusError);
  } else {
    console.log(`✓ Created ${workerStatuses.length} worker status records\n`);
  }

  console.log('✨ Done! Refresh your Workers page to see the new crew.\n');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
