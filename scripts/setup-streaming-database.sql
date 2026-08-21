-- =====================================================
-- Live Streaming Database Setup
-- =====================================================
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gjlblcrmqkbxlrqxffaz/sql/new
-- =====================================================

-- Add streaming columns to devices table
ALTER TABLE devices ADD COLUMN IF NOT EXISTS stream_url TEXT;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS streaming BOOLEAN DEFAULT FALSE;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS stream_type VARCHAR(20) DEFAULT 'agora';
ALTER TABLE devices ADD COLUMN IF NOT EXISTS channel_name TEXT;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS stream_token TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_devices_streaming 
ON devices(streaming) 
WHERE streaming = TRUE;

CREATE INDEX IF NOT EXISTS idx_devices_channel_name 
ON devices(channel_name) 
WHERE channel_name IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN devices.stream_url IS 'Public URL for HLS/MP4 streams (if using Supabase Storage or CDN)';
COMMENT ON COLUMN devices.streaming IS 'Whether the device is currently streaming';
COMMENT ON COLUMN devices.stream_type IS 'Type of stream: agora, hls, mp4, webrtc';
COMMENT ON COLUMN devices.channel_name IS 'Agora channel name (for real-time streaming)';
COMMENT ON COLUMN devices.stream_token IS 'Temporary stream authentication token';

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify the columns were added:
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'devices'
  AND column_name IN ('stream_url', 'streaming', 'stream_type', 'channel_name', 'stream_token')
ORDER BY ordinal_position;

-- =====================================================
-- Test Data (Optional)
-- =====================================================
-- Uncomment to add test stream data to an existing device:

-- UPDATE devices 
-- SET 
--   stream_url = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
--   streaming = true,
--   stream_type = 'hls'
-- WHERE user_id = 'YOUR_TEST_USER_ID';

-- =====================================================
-- Storage Setup (For Simple Video Clips Option)
-- =====================================================
-- If using Supabase Storage for video clips:

-- 1. Create bucket via Dashboard or SQL:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('live-feeds', 'live-feeds', true);

-- 2. Set up access policies:
CREATE POLICY "Workers can upload their own live feeds"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'live-feeds' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view live feeds"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'live-feeds');

CREATE POLICY "Workers can update their own live feeds"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'live-feeds'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- Cleanup Query (Use with caution)
-- =====================================================
-- Uncomment to stop all active streams (useful for testing):

-- UPDATE devices 
-- SET 
--   streaming = false,
--   stream_url = NULL,
--   channel_name = NULL,
--   stream_token = NULL
-- WHERE streaming = true;

-- =====================================================
-- Success Message
-- =====================================================
-- If no errors appeared above, your database is ready! ✅
-- 
-- Next steps:
-- 1. Choose your streaming method (Agora or Simple Clips)
-- 2. Follow STREAMING_SETUP.md for configuration
-- 3. Integrate mobile app using MOBILE_APP_INTEGRATION.md
-- =====================================================
