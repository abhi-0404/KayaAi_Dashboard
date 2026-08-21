# Live Streaming Setup Guide

## Complete End-to-End Live Streaming Implementation

This guide shows you how to enable real-time video streaming from your mobile app to the dashboard.

---

## Architecture Overview

```
Mobile App (Camera) → Agora Cloud → Dashboard (Live View)
                    ↓
              Supabase (Stream Metadata)
```

---

## Step 1: Database Setup (5 minutes)

### 1.1 Add Streaming Columns to Database

Go to your Supabase SQL Editor:
**https://supabase.com/dashboard/project/gjlblcrmqkbxlrqxffaz/sql/new**

Run this SQL:

```sql
-- Add streaming capability to devices table
ALTER TABLE devices ADD COLUMN IF NOT EXISTS stream_url TEXT;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS streaming BOOLEAN DEFAULT FALSE;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS stream_type VARCHAR(20) DEFAULT 'agora';
ALTER TABLE devices ADD COLUMN IF NOT EXISTS channel_name TEXT;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS stream_token TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_devices_streaming ON devices(streaming) WHERE streaming = TRUE;
```

✅ **Done!** Your database is ready.

---

## Step 2: Get Agora Credentials (10 minutes)

### 2.1 Sign up for Agora

1. Go to: https://console.agora.io/
2. Sign up (free tier gives you 10,000 minutes/month)
3. Create a new project:
   - Name: "Kaya AI Live Streaming"
   - Use case: "Video calling"
   - Authentication: "Secured mode - APP ID + Token"

### 2.2 Get Your App ID

1. In Agora Console → Projects
2. Copy your **App ID** (looks like: `a1b2c3d4e5f6g7h8i9j0`)
3. Enable **Token Authentication**

### 2.3 Get Your App Certificate

1. Click your project
2. Under "App Certificate" → Click "Enable"
3. Copy the **App Certificate** (keep it secret!)

### 2.4 Add to Your Environment

Add these to your `.env.local`:

```bash
# Agora Streaming
VITE_AGORA_APP_ID=your_app_id_here
AGORA_APP_ID=your_app_id_here
AGORA_APP_CERTIFICATE=your_app_certificate_here
```

---

## Step 3: Install Dashboard Dependencies

```bash
npm install agora-rtc-sdk-ng
```

---

## Step 4: Mobile App Integration

### For React Native / Expo:

```bash
npm install react-native-agora agora-react-native-rtm
```

### Mobile App Code Example:

```typescript
// mobile-app/src/services/streaming.service.ts
import RtcEngine, { ChannelProfileType } from 'react-native-agora';
import { supabase } from './supabase';

class StreamingService {
  private engine: RtcEngine | null = null;
  private channelName: string = '';

  async initialize(appId: string) {
    this.engine = await RtcEngine.create(appId);
    await this.engine.enableVideo();
    await this.engine.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
    await this.engine.setClientRole(1); // Broadcaster
  }

  async startStreaming(userId: string, token: string) {
    if (!this.engine) throw new Error('Engine not initialized');

    // Generate unique channel name
    this.channelName = `worker_${userId}_${Date.now()}`;

    // Update Supabase with channel info
    await supabase.from('devices').update({
      streaming: true,
      stream_type: 'agora',
      channel_name: this.channelName,
      stream_token: token,
      last_seen_at: new Date().toISOString()
    }).eq('user_id', userId);

    // Join Agora channel
    await this.engine.joinChannel(token, this.channelName, null, 0);

    console.log('✅ Streaming started on channel:', this.channelName);
  }

  async stopStreaming(userId: string) {
    if (!this.engine) return;

    await this.engine.leaveChannel();

    await supabase.from('devices').update({
      streaming: false,
      channel_name: null,
      stream_token: null
    }).eq('user_id', userId);

    console.log('✅ Streaming stopped');
  }

  destroy() {
    this.engine?.destroy();
  }
}

export default new StreamingService();
```

### Mobile App Button Integration:

```typescript
// mobile-app/screens/CameraScreen.tsx
import { useState } from 'react';
import StreamingService from '../services/streaming.service';

export default function CameraScreen() {
  const [isStreaming, setIsStreaming] = useState(false);
  const userId = 'current-worker-user-id'; // Get from auth

  const toggleStreaming = async () => {
    if (isStreaming) {
      await StreamingService.stopStreaming(userId);
      setIsStreaming(false);
    } else {
      // Get token from your backend (see Step 5)
      const token = await generateAgoraToken(userId);
      await StreamingService.startStreaming(userId, token);
      setIsStreaming(true);
    }
  };

  return (
    <View>
      <Camera />
      <Button 
        onPress={toggleStreaming}
        title={isStreaming ? 'Stop Streaming' : 'Start Live Stream'}
      />
    </View>
  );
}
```

---

## Step 5: Token Generation API (Security)

You need a server endpoint to generate Agora tokens securely.

### Install Token Generator:

```bash
npm install agora-access-token
```

### Create API Route:

```typescript
// src/routes/api/generate-token.ts
import { defineHandler } from '@tanstack/react-start';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export default defineHandler({
  method: 'POST',
  handler: async ({ request }) => {
    const { channelName, userId, role } = await request.json();

    const appId = process.env.AGORA_APP_ID!;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE!;
    const uid = 0; // 0 means any user
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER,
      privilegeExpiredTs
    );

    return { token, channelName };
  }
});
```

---

## Step 6: Update Dashboard Monitoring Component

The dashboard already has most of the code! We just need to add Agora player:

```bash
npm install agora-rtc-sdk-ng
```

I'll update the monitoring component for you in the next step.

---

## Alternative: Simple Option (For Testing)

If you want to **test quickly without Agora**, you can use **Supabase Storage** for video clips:

### Mobile App (Record & Upload):

```typescript
// Record 10-second clips and upload
const recordClip = async (userId: string) => {
  // Record video to file
  const videoFile = await camera.recordAsync({ maxDuration: 10 });
  
  // Upload to Supabase Storage
  const fileName = `${userId}/${Date.now()}.mp4`;
  const { data, error } = await supabase.storage
    .from('live-feeds')
    .upload(fileName, {
      uri: videoFile.uri,
      type: 'video/mp4',
      name: fileName
    });

  if (data) {
    const { data: urlData } = supabase.storage
      .from('live-feeds')
      .getPublicUrl(data.path);
    
    // Update device with video URL
    await supabase.from('devices').update({
      stream_url: urlData.publicUrl,
      streaming: true,
      stream_type: 'mp4'
    }).eq('user_id', userId);
  }
};

// Call every 10 seconds while "streaming"
setInterval(() => recordClip(userId), 10000);
```

This gives you a "near-live" feed with ~10 second delay, but **no additional setup needed**!

---

## Step 7: Test Everything

1. ✅ Run database migration (Step 1)
2. ✅ Add Agora credentials to `.env.local` (Step 2)
3. ✅ Install dashboard dependencies (Step 3)
4. ✅ Integrate mobile app (Step 4)
5. ✅ Create token API (Step 5)
6. ✅ Test from mobile → should see live feed on dashboard!

---

## Troubleshooting

### Dashboard shows "No live stream available"

1. Check database:
   ```sql
   SELECT user_id, streaming, channel_name FROM devices WHERE streaming = TRUE;
   ```

2. Verify mobile app updated the database
3. Check browser console for errors

### Video won't play

- Check Agora App ID is correct
- Verify token is not expired
- Check network/firewall settings

### Mobile app can't connect

- Verify App ID and token
- Check mobile app has camera permissions
- Ensure internet connection

---

## Production Checklist

- [ ] Enable Agora token authentication (already done)
- [ ] Set up auto-disconnect when mobile app closes
- [ ] Add bandwidth monitoring
- [ ] Implement reconnection logic
- [ ] Add "stream health" indicators
- [ ] Monitor Agora usage/costs
- [ ] Set up CDN if needed for global users

---

## Cost Estimate

**Agora Free Tier:**
- 10,000 minutes/month FREE
- For 10 workers streaming 8 hours/day = ~2,400 minutes/day
- You'll need paid plan: ~$0.99 per 1,000 minutes

**Monthly cost for 10 workers:**
- 2,400 min/day × 30 days = 72,000 minutes
- 72,000 × $0.99/1,000 = **~$71/month**

---

## Next Steps

Which approach do you want?

**A) Full Agora Setup** (real-time, professional)
- I'll update the dashboard component with Agora player
- You integrate the mobile app code

**B) Simple Supabase Storage** (near-live, no extra setup)
- I'll show you the complete mobile integration
- Works with current dashboard code immediately

**C) Different Service** (Mux, AWS IVS, etc.)
- Tell me which one you prefer

Let me know and I'll implement it for you!
