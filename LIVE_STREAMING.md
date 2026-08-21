# Live Video Streaming Setup

This guide explains how to enable live video streaming from your mobile app to the dashboard.

## Architecture

```
Mobile App (Camera) → Stream URL → Supabase Database → Dashboard (Display)
```

## Step 1: Update Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Add streaming capability to devices table
ALTER TABLE devices ADD COLUMN IF NOT EXISTS stream_url TEXT;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS streaming BOOLEAN DEFAULT FALSE;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS stream_type VARCHAR(20) DEFAULT 'hls';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_devices_streaming ON devices(streaming) WHERE streaming = TRUE;
```

**How to run:**
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
2. Copy and paste the SQL above
3. Click "Run"

## Step 2: Mobile App Integration

### When Starting Camera Stream:

```javascript
import { supabase } from './supabaseClient';

// After you start streaming and get a URL
async function startStreaming(userId, streamUrl) {
  const { error } = await supabase
    .from('devices')
    .update({
      stream_url: streamUrl,
      streaming: true,
      stream_type: 'hls', // or 'mp4', 'webrtc', etc.
    })
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error updating stream URL:', error);
  }
}
```

### When Stopping Camera Stream:

```javascript
async function stopStreaming(userId) {
  const { error } = await supabase
    .from('devices')
    .update({
      stream_url: null,
      streaming: false,
    })
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error stopping stream:', error);
  }
}
```

## Step 3: Streaming Options

You have several options for getting a stream URL:

### Option A: Direct HLS Streaming (Recommended)

Use a service like:
- **AWS IVS** (Interactive Video Service)
- **Mux** (https://mux.com)
- **Cloudflare Stream**
- **Agora** (https://agora.io)

Example flow:
1. Mobile app connects to streaming service
2. Gets back an HLS URL (e.g., `https://stream.mux.com/abc123.m3u8`)
3. Stores URL in Supabase
4. Dashboard plays the HLS stream

### Option B: WebRTC (Real-time, Low Latency)

For ultra-low latency:
- **Agora WebRTC**
- **Twilio Video**
- **Daily.co**

More complex but provides < 1 second latency.

### Option C: Simple MP4 Chunks

For testing, you can:
1. Record short video clips
2. Upload to Supabase Storage
3. Store the public URL
4. Dashboard displays the video

```javascript
// Upload video to Supabase Storage
const { data, error } = await supabase.storage
  .from('live-feeds')
  .upload(`${userId}/${Date.now()}.mp4`, videoFile);

if (data) {
  const publicUrl = supabase.storage
    .from('live-feeds')
    .getPublicUrl(data.path).data.publicUrl;
    
  // Update device with video URL
  await supabase.from('devices').update({
    stream_url: publicUrl,
    streaming: true,
    stream_type: 'mp4'
  }).eq('user_id', userId);
}
```

## Step 4: Test the Integration

1. **Run the database migration** (Step 1)
2. **From your mobile app**, call:
   ```javascript
   await startStreaming(userId, 'https://test-stream-url.m3u8');
   ```
3. **Open the dashboard** → Navigate to "Monitoring" page
4. **Select the worker** - You should see the video stream

## Troubleshooting

### Stream Not Showing

1. **Check database**:
   ```sql
   SELECT user_id, streaming, stream_url FROM devices WHERE streaming = TRUE;
   ```

2. **Check browser console** for errors

3. **Verify stream URL** is publicly accessible:
   - Open the stream URL in a new browser tab
   - Should play or download

### Video Format Issues

The dashboard supports:
- **HLS** (.m3u8) - Best for HTTP streaming
- **MP4** (.mp4) - Simple video files
- **DASH** (.mpd) - Adaptive streaming

For other formats, you may need to add additional video libraries like `hls.js`:

```bash
npm install hls.js
```

## Production Recommendations

1. **Use HLS or DASH** for adaptive bitrate streaming
2. **Add authentication** to stream URLs (signed URLs)
3. **Monitor bandwidth** usage
4. **Implement retry logic** for connection failures
5. **Add stream health checks** (connection status, bitrate)
6. **Consider CDN** for global distribution

## Example: Complete Mobile App Integration

```typescript
// streaming.service.ts
import { supabase } from './supabase';

class StreamingService {
  private currentStreamUrl: string | null = null;
  
  async startCamera(userId: string) {
    try {
      // 1. Initialize your streaming service (e.g., Agora, Mux)
      const streamConfig = await yourStreamingService.createStream();
      
      // 2. Get the playback URL
      this.currentStreamUrl = streamConfig.playbackUrl;
      
      // 3. Update Supabase
      await supabase.from('devices').update({
        stream_url: this.currentStreamUrl,
        streaming: true,
        stream_type: 'hls',
        last_seen_at: new Date().toISOString()
      }).eq('user_id', userId);
      
      console.log('✅ Streaming started:', this.currentStreamUrl);
      
      // 4. Start capturing video
      await this.captureVideo();
      
    } catch (error) {
      console.error('❌ Failed to start streaming:', error);
      throw error;
    }
  }
  
  async stopCamera(userId: string) {
    try {
      // 1. Stop video capture
      await this.stopCapture();
      
      // 2. Update Supabase
      await supabase.from('devices').update({
        stream_url: null,
        streaming: false
      }).eq('user_id', userId);
      
      // 3. Clean up streaming service
      await yourStreamingService.destroyStream();
      
      console.log('✅ Streaming stopped');
      
    } catch (error) {
      console.error('❌ Failed to stop streaming:', error);
    }
  }
  
  private async captureVideo() {
    // Your video capture implementation
  }
  
  private async stopCapture() {
    // Your video stop implementation
  }
}

export default new StreamingService();
```

## Next Steps

1. ✅ Run the database migration
2. ✅ Choose a streaming service
3. ✅ Integrate in mobile app
4. ✅ Test end-to-end
5. ✅ Monitor and optimize

## Support

For issues or questions:
- Check Supabase logs
- Verify device `streaming` and `stream_url` columns
- Test stream URL independently
- Check browser console for playback errors
