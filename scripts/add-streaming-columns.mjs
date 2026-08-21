#!/usr/bin/env node
/**
 * Adds streaming capability columns to devices table
 * This allows mobile apps to store their stream URLs for dashboard playback
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

async function main() {
  console.log('📹 Adding live streaming support to devices table...\n');

  // Note: Supabase client doesn't support ALTER TABLE directly
  // You need to run this SQL in Supabase SQL Editor:
  
  console.log('⚠️  Please run the following SQL in your Supabase SQL Editor:\n');
  console.log('-- Add streaming capability to devices');
  console.log('ALTER TABLE devices ADD COLUMN IF NOT EXISTS stream_url TEXT;');
  console.log('ALTER TABLE devices ADD COLUMN IF NOT EXISTS streaming BOOLEAN DEFAULT FALSE;');
  console.log('ALTER TABLE devices ADD COLUMN IF NOT EXISTS stream_type VARCHAR(20) DEFAULT \'hls\';');
  console.log('\n-- Add index for faster queries');
  console.log('CREATE INDEX IF NOT EXISTS idx_devices_streaming ON devices(streaming) WHERE streaming = TRUE;');
  console.log('\n');
  console.log('📝 Instructions:');
  console.log('1. Go to: https://supabase.com/dashboard/project/' + SUPABASE_URL.split('//')[1].split('.')[0] + '/sql/new');
  console.log('2. Copy and paste the SQL above');
  console.log('3. Click "Run"');
  console.log('4. Come back and run: npm run generate:types (if available)');
  console.log('\nAfter running the SQL, your mobile app can store stream URLs like:');
  console.log('');
  console.log('await supabase.from("devices").update({');
  console.log('  stream_url: "https://your-stream-url.m3u8",');
  console.log('  streaming: true,');
  console.log('  stream_type: "hls"');
  console.log('}).eq("user_id", userId);');
  console.log('');
}

main().catch(console.error);
