#!/usr/bin/env node
/**
 * Database seeder for Kaya AI Dashboard
 * 
 * Populates Supabase tables with realistic test data including:
 * - Projects, zones, and levels
 * - Workers with profiles and status
 * - Devices (AI glasses)
 * - Site events (hazards, observations)
 * - Tasks, blueprints, and reports
 * 
 * Usage: node scripts/seed-database.mjs
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

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Make sure they are set in your .env.local file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Helper functions
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBool(probability = 0.5) {
  return Math.random() < probability;
}

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function hoursAgo(hours) {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

function minutesAgo(minutes) {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutes);
  return date.toISOString();
}

// Sample data
const workerNames = [
  'John Smith', 'Maria Garcia', 'James Johnson', 'Sarah Williams', 'Michael Brown',
  'Jennifer Davis', 'David Miller', 'Lisa Wilson', 'Robert Moore', 'Jessica Taylor',
  'William Anderson', 'Emily Thomas', 'Richard Jackson', 'Michelle White', 'Charles Harris'
];

const siteRoles = ['worker', 'site_engineer', 'safety_officer'];

const projectNames = [
  'Harbor Point Tower',
  'Riverside Mall Expansion',
  'Downtown Office Complex',
  'Greenfield Hospital Wing',
  'Airport Terminal Renovation'
];

const clients = [
  'Metro Development Corp',
  'Pacific Properties LLC',
  'Skyline Builders',
  'Urban Planning Group',
  'Coastal Construction'
];

const locations = [
  '123 Harbor St, San Francisco, CA',
  '456 River Rd, Portland, OR',
  '789 Main Ave, Seattle, WA',
  '321 Park Blvd, Los Angeles, CA',
  '654 Airport Dr, San Diego, CA'
];

const zoneNames = ['Zone A - Foundation', 'Zone B - Structure', 'Zone C - Electrical', 'Zone D - Plumbing', 'Zone E - Finishing'];
const levelNames = ['Ground Floor', 'Level 1', 'Level 2', 'Level 3', 'Roof'];

const taskTitles = [
  'Install electrical conduits',
  'Pour concrete foundation',
  'Frame interior walls',
  'Install HVAC ductwork',
  'Mount drywall panels',
  'Install plumbing fixtures',
  'Paint interior walls',
  'Install windows',
  'Lay flooring tiles',
  'Install fire sprinklers'
];

const hazardTypes = [
  { title: 'Missing hard hat detected', type: 'PPE_VIOLATION', severity: 'HIGH' },
  { title: 'Worker in restricted zone', type: 'HAZARD', severity: 'CRITICAL' },
  { title: 'Unsecured ladder observed', type: 'HAZARD', severity: 'MEDIUM' },
  { title: 'Missing safety vest', type: 'PPE_VIOLATION', severity: 'MEDIUM' },
  { title: 'Exposed electrical wiring', type: 'HAZARD', severity: 'CRITICAL' },
  { title: 'Slip hazard - wet floor', type: 'HAZARD', severity: 'MEDIUM' },
  { title: 'Missing safety gloves', type: 'PPE_VIOLATION', severity: 'LOW' },
  { title: 'Unsecured materials overhead', type: 'HAZARD', severity: 'HIGH' }
];

const deviceNames = ['RealWear Navigator 520', 'Vuzix M400', 'Google Glass Enterprise 2', 'ThirdEye X2'];
const adapters = ['bluetooth', 'wifi', 'usb'];

async function clearExistingData() {
  console.log('🧹 Clearing existing test data...');
  
  const tables = [
    'form_submissions',
    'media_assets',
    'site_events',
    'tasks',
    'blueprints',
    'reports',
    'devices',
    'worker_status',
    'zones',
    'levels',
    'project_members',
    'projects',
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error && !error.message.includes('violates foreign key')) {
      console.warn(`   ⚠️  Warning clearing ${table}:`, error.message);
    }
  }
  
  console.log('   ✓ Tables cleared\n');
}

async function seedProjects() {
  console.log('📁 Seeding projects...');
  
  const projects = projectNames.map((name, i) => ({
    id: randomUUID(),
    name,
    code: `PRJ-${1000 + i}`,
    client: clients[i],
    location: locations[i],
    description: `${name} construction project`,
    phase: randomItem(['planning', 'foundation', 'structure', 'finishing']),
    budget: `$${randomInt(5, 50)}M`,
    status: i === 0 ? 'active' : randomItem(['active', 'active', 'on_hold']),
    progress: randomInt(15, 85),
    created_at: daysAgo(randomInt(180, 365)),
  }));

  const { data, error } = await supabase.from('projects').insert(projects).select();
  
  if (error) {
    console.error('   ❌ Error seeding projects:', error.message);
    return [];
  }
  
  console.log(`   ✓ Created ${data.length} projects\n`);
  return data;
}

async function seedLevelsAndZones(projects) {
  console.log('🏗️  Seeding levels and zones...');
  
  const levels = [];
  const zones = [];
  
  for (const project of projects) {
    // Create levels for each project
    for (let idx = 0; idx < levelNames.length; idx++) {
      const levelId = randomUUID();
      levels.push({
        id: levelId,
        project_id: project.id,
        name: levelNames[idx],
        number: idx,
        status: 'active',
        created_at: daysAgo(randomInt(30, 90)),
      });
      
      // Create 2-3 zones per level
      const numZones = randomInt(2, 3);
      for (let i = 0; i < numZones; i++) {
        zones.push({
          id: randomUUID(),
          project_id: project.id,
          level_id: levelId,
          name: randomItem(zoneNames),
          code: `Z${idx}-${i}`,
          description: `Work zone in ${levelNames[idx]}`,
          created_at: daysAgo(randomInt(30, 90)),
        });
      }
    }
  }

  const { data: levelsData, error: levelsError } = await supabase.from('levels').insert(levels).select();
  if (levelsError) {
    console.error('   ❌ Error seeding levels:', levelsError.message);
    return { levels: [], zones: [] };
  }

  const { data: zonesData, error: zonesError } = await supabase.from('zones').insert(zones).select();
  if (zonesError) {
    console.error('   ❌ Error seeding zones:', zonesError.message);
    return { levels: levelsData, zones: [] };
  }

  console.log(`   ✓ Created ${levelsData.length} levels and ${zonesData.length} zones\n`);
  return { levels: levelsData, zones: zonesData };
}

async function seedWorkersAndDevices(projects, zones) {
  console.log('👷 Seeding workers and devices...');
  
  // Get existing profiles from auth
  const { data: existingProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .limit(20);
    
  if (profilesError || !existingProfiles || existingProfiles.length === 0) {
    console.warn('   ⚠️  No existing user profiles found. Please sign up some users first.');
    console.warn('   Skipping worker and device seeding.\n');
    return { workers: [], devices: [] };
  }

  const devices = [];
  const workerStatuses = [];
  
  console.log(`   Found ${existingProfiles.length} existing users to work with`);
  
  for (const profile of existingProfiles) {
    const project = randomItem(projects);
    const zone = randomItem(zones.filter(z => z.project_id === project.id));
    const deviceId = randomUUID();
    
    const aiSession = randomItem(['active', 'active', 'idle', 'offline']); // More likely to be active
    const hasDevice = aiSession !== 'offline';
    
    if (hasDevice) {
      devices.push({
        id: deviceId,
        user_id: profile.id,
        name: randomItem(deviceNames),
        firmware: `v${randomInt(2, 4)}.${randomInt(0, 9)}.${randomInt(0, 20)}`,
        adapter: randomItem(adapters),
        is_simulated: false,
        battery_level: aiSession === 'active' ? randomInt(40, 95) : randomInt(10, 30),
        charging: randomBool(0.2),
        storage_used_gb: randomInt(5, 25),
        storage_total_gb: 32,
        connection_state: aiSession === 'active' ? 'connected' : aiSession === 'idle' ? 'idle' : 'disconnected',
        media_transport: aiSession === 'active' ? 'streaming' : 'stored',
        project_id: project.id,
        last_seen_at: aiSession === 'offline' ? hoursAgo(randomInt(2, 8)) : minutesAgo(randomInt(1, 15)),
        created_at: daysAgo(randomInt(30, 90)),
      });
    }
    
    workerStatuses.push({
      user_id: profile.id,
      project_id: project.id,
      zone_id: zone?.id || null,
      ai_session: aiSession,
      task: aiSession !== 'offline' ? randomItem(taskTitles) : null,
      hazard: randomBool(0.15) ? randomItem(['Missing PPE', 'Near hazard zone', null, null]) : null,
      hazard_severity: randomBool(0.15) ? randomItem(['LOW', 'MEDIUM', 'HIGH']) : null,
      last_active_at: aiSession === 'offline' ? hoursAgo(randomInt(2, 8)) : minutesAgo(randomInt(1, 30)),
    });
  }

  // Update existing profiles with site_role
  const profileUpdates = existingProfiles.map(p => ({
    id: p.id,
    site_role: randomItem(siteRoles),
  }));
  
  const { error: updateError } = await supabase.from('profiles').upsert(profileUpdates, { onConflict: 'id' });
  if (updateError) {
    console.warn('   ⚠️  Warning updating profiles:', updateError.message);
  }

  // Insert devices
  const { data: devicesData, error: devicesError } = await supabase.from('devices').insert(devices).select();
  if (devicesError) {
    console.error('   ❌ Error seeding devices:', devicesError.message);
  }

  // Insert worker statuses
  const { error: statusError } = await supabase.from('worker_status').insert(workerStatuses);
  if (statusError) {
    console.error('   ❌ Error seeding worker status:', statusError.message);
  }

  console.log(`   ✓ Updated ${existingProfiles.length} worker profiles, created ${devices.length} devices\n`);
  return { workers: existingProfiles, devices: devicesData || [] };
}

async function seedSiteEvents(projects, zones, workers) {
  console.log('⚠️  Seeding site events...');
  
  const events = [];
  
  // Create 20-30 events
  for (let i = 0; i < randomInt(20, 30); i++) {
    const project = randomItem(projects);
    const zone = randomItem(zones.filter(z => z.project_id === project.id));
    const hazard = randomBool(0.6) ? randomItem(hazardTypes) : null;
    const isOpen = randomBool(0.4);
    
    events.push({
      id: randomUUID(),
      project_id: project.id,
      zone_id: zone?.id || null,
      level_id: zone?.level_id || null,
      type: hazard?.type || 'OBSERVATION',
      severity: hazard?.severity || randomItem(['LOW', 'MEDIUM']),
      status: isOpen ? 'OPEN' : randomItem(['IN_PROGRESS', 'RESOLVED', 'DISMISSED']),
      title: hazard?.title || 'General site observation',
      description: hazard ? `${hazard.title} detected by AI safety system` : 'Routine site inspection note',
      created_by: randomBool(0.7) ? randomItem(workers).id : null,
      created_by_label: randomBool(0.3) ? 'Kaya AI' : null,
      ai_confidence: hazard ? randomInt(75, 98) / 100 : null,
      created_at: hoursAgo(randomInt(1, 48)),
    });
  }

  const { data, error } = await supabase.from('site_events').insert(events).select();
  
  if (error) {
    console.error('   ❌ Error seeding site events:', error.message);
    return [];
  }
  
  console.log(`   ✓ Created ${data.length} site events\n`);
  return data;
}

async function seedTasks(projects, zones, workers) {
  console.log('✅ Seeding tasks...');
  
  const tasks = [];
  
  // Create 15-20 tasks
  for (let i = 0; i < randomInt(15, 20); i++) {
    const project = randomItem(projects);
    const zone = randomItem(zones.filter(z => z.project_id === project.id));
    const status = randomItem(['todo', 'in_progress', 'in_progress', 'completed', 'blocked']);
    
    tasks.push({
      id: randomUUID(),
      project_id: project.id,
      zone_id: zone?.id || null,
      level_id: zone?.level_id || null,
      title: randomItem(taskTitles),
      description: `Complete ${randomItem(taskTitles).toLowerCase()} in ${zone?.name || 'assigned zone'}`,
      status,
      priority: randomItem(['low', 'medium', 'high', 'critical']),
      assigned_to: randomBool(0.8) ? randomItem(workers).id : null,
      due_date: status === 'completed' ? daysAgo(randomInt(1, 7)) : daysAgo(-randomInt(1, 14)),
      created_at: daysAgo(randomInt(7, 30)),
      updated_at: daysAgo(randomInt(0, 5)),
    });
  }

  const { data, error } = await supabase.from('tasks').insert(tasks).select();
  
  if (error) {
    console.error('   ❌ Error seeding tasks:', error.message);
    return [];
  }
  
  console.log(`   ✓ Created ${data.length} tasks\n`);
  return data;
}

async function seedBlueprints(projects, zones, workers) {
  console.log('📐 Seeding blueprints...');
  
  const blueprints = [];
  const disciplines = ['Architectural', 'Structural', 'MEP', 'Electrical', 'Plumbing'];
  
  // Create 10-15 blueprints
  for (let i = 0; i < randomInt(10, 15); i++) {
    const project = randomItem(projects);
    const zone = randomItem(zones.filter(z => z.project_id === project.id));
    const discipline = randomItem(disciplines);
    const approvalStatus = randomItem(['approved', 'approved', 'pending', 'rejected']);
    const uploader = randomItem(workers);
    
    blueprints.push({
      id: randomUUID(),
      project_id: project.id,
      level_id: zone?.level_id || null,
      name: `${discipline} - ${zone?.name || 'General'} Layout`,
      code: `${discipline.substring(0, 3).toUpperCase()}-${1000 + i}`,
      revision: `Rev ${randomInt(1, 5)}`,
      discipline,
      status: 'active',
      approval_status: approvalStatus,
      uploaded_by: uploader.id,
      approved_by: approvalStatus === 'approved' ? randomItem(workers).id : null,
      approved_at: approvalStatus === 'approved' ? daysAgo(randomInt(1, 7)) : null,
      ai_risk_summary: randomBool(0.5) ? `AI analysis: ${randomInt(0, 3)} potential conflicts detected` : null,
      created_at: daysAgo(randomInt(7, 30)),
    });
  }

  const { data, error } = await supabase.from('blueprints').insert(blueprints).select();
  
  if (error) {
    console.error('   ❌ Error seeding blueprints:', error.message);
    return [];
  }
  
  console.log(`   ✓ Created ${data.length} blueprints\n`);
  return data;
}

async function seedReports(projects) {
  console.log('📊 Seeding AI reports...');
  
  const reports = [];
  
  // Create 5-8 reports
  for (let i = 0; i < randomInt(5, 8); i++) {
    const project = randomItem(projects);
    const reportTypes = [
      { title: 'Daily Safety Summary', summary: 'Overview of safety incidents and compliance' },
      { title: 'Weekly Progress Report', summary: 'Construction progress and milestone tracking' },
      { title: 'Hazard Analysis Report', summary: 'Detailed analysis of identified hazards' },
      { title: 'Equipment Utilization Report', summary: 'AI glasses usage and battery health' },
      { title: 'Worker Activity Summary', summary: 'Worker presence and task completion rates' }
    ];
    
    const reportType = randomItem(reportTypes);
    
    reports.push({
      id: randomUUID(),
      project_id: project.id,
      title: `${project.name} - ${reportType.title}`,
      summary: reportType.summary,
      body: `# ${reportType.title}\n\n## Key Findings\n\n- Finding 1: Sample finding for ${project.name}\n- Finding 2: Additional observation\n- Finding 3: Recommendation for improvement\n\n## Conclusion\n\nOverall ${randomItem(['positive', 'satisfactory', 'needs attention'])} status.`,
      ai_provider: randomItem(['OpenAI GPT-4', 'Anthropic Claude', 'Google Gemini']),
      created_at: daysAgo(randomInt(1, 14)),
    });
  }

  const { data, error } = await supabase.from('reports').insert(reports).select();
  
  if (error) {
    console.error('   ❌ Error seeding reports:', error.message);
    return [];
  }
  
  console.log(`   ✓ Created ${data.length} AI reports\n`);
  return data;
}

async function seedMediaAssets(projects, workers) {
  console.log('📸 Seeding media assets...');
  
  const mediaAssets = [];
  
  // Create 20-30 media captures
  for (let i = 0; i < randomInt(20, 30); i++) {
    const project = randomItem(projects);
    const worker = randomItem(workers);
    const aiStatus = randomItem(['complete', 'complete', 'complete', 'processing', 'pending']);
    
    mediaAssets.push({
      id: randomUUID(),
      project_id: project.id,
      captured_by: worker.id,
      media_type: randomItem(['photo', 'video']),
      ai_status: aiStatus,
      ai_analysis: aiStatus === 'complete' ? JSON.stringify({
        detected_objects: randomInt(3, 12),
        hazards: randomBool(0.3) ? ['Missing PPE', 'Unsecured materials'] : [],
        confidence: randomInt(80, 98) / 100
      }) : null,
      created_at: hoursAgo(randomInt(1, 72)),
    });
  }

  const { data, error } = await supabase.from('media_assets').insert(mediaAssets).select();
  
  if (error) {
    console.error('   ❌ Error seeding media assets:', error.message);
    return [];
  }
  
  console.log(`   ✓ Created ${data.length} media assets\n`);
  return data;
}

async function main() {
  console.log('🌱 Starting database seed...\n');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}\n`);

  try {
    // Clear existing data
    await clearExistingData();

    // Seed in order (respecting foreign keys)
    const projects = await seedProjects();
    if (projects.length === 0) {
      console.error('❌ Failed to seed projects. Aborting.');
      process.exit(1);
    }

    const { levels, zones } = await seedLevelsAndZones(projects);
    const { workers, devices } = await seedWorkersAndDevices(projects, zones);
    
    await seedSiteEvents(projects, zones, workers);
    await seedTasks(projects, zones, workers);
    await seedBlueprints(projects, zones, workers);
    await seedReports(projects);
    await seedMediaAssets(projects, workers);

    console.log('✨ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • ${projects.length} projects`);
    console.log(`   • ${levels.length} levels`);
    console.log(`   • ${zones.length} zones`);
    console.log(`   • ${workers.length} workers`);
    console.log(`   • ${devices.length} devices`);
    console.log('\n🚀 Your dashboard should now display real-time data!\n');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
