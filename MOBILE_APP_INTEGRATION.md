# Mobile App Integration Guide

Complete code examples for integrating live streaming from your mobile app.

---

## Option A: Agora Real-Time Streaming (Recommended)

### 1. Install Dependencies

```bash
# For React Native
npm install react-native-agora

# For Expo (if using Expo)
npx expo install react-native-agora
```

### 2. Request Permissions (iOS/Android)

**iOS - Info.plist:**
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access for live streaming</string>
<key>NSMicrophoneUsageDescription</key>
<string>We need microphone access for live streaming</string>
```

**Android - AndroidManifest.xml:**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
```

### 3. Streaming Service

Create: `mobile-app/src/services/StreamingService.ts`

```typescript
import { createAgoraRtcEngine, ChannelProfileType, ClientRoleType } from 'react-native-agora';
import { supabase } from './supabaseClient';

class StreamingService {
  private engine: any = null;
  private channelName: string = '';
  private isStreaming: boolean = false;

  constructor() {
    // Initialize Agora engine
    this.initEngine();
  }

  async initEngine() {
    try {
      this.engine = createAgoraRtcEngine();
      await this.engine.initialize({
        appId: 'YOUR_AGORA_APP_ID', // Get from Agora Console
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      });

      // Enable video
      await this.engine.enableVideo();
      
      // Set broadcaster role (so dashboard can watch)
      await this.engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);

      console.log('✅ Agora engine initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Agora:', error);
    }
  }

  async startStreaming(userId: string, workerName: string) {
    if (this.isStreaming) {
      console.warn('⚠️ Already streaming');
      return;
    }

    try {
      // Generate unique channel name
      this.channelName = `worker_${userId}_${Date.now()}`;

      // Get Agora token from your backend
      const token = await this.getAgoraToken(userId, this.channelName);

      // Update Supabase database - dashboard will detect this
      const { error: dbError } = await supabase
        .from('devices')
        .update({
          streaming: true,
          stream_type: 'agora',
          channel_name: this.channelName,
          stream_token: token,
          last_seen_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (dbError) throw dbError;

      // Join Agora channel
      await this.engine.joinChannel(token, this.channelName, 0, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });

      // Start camera preview (local rendering)
      await this.engine.startPreview();

      this.isStreaming = true;
      console.log(`✅ Streaming started - Channel: ${this.channelName}`);
      console.log(`📺 Dashboard can now see ${workerName}'s live feed`);

    } catch (error) {
      console.error('❌ Failed to start streaming:', error);
      throw error;
    }
  }

  async stopStreaming(userId: string) {
    if (!this.isStreaming) return;

    try {
      // Leave Agora channel
      await this.engine.leaveChannel();
      await this.engine.stopPreview();

      // Update Supabase - streaming stopped
      await supabase
        .from('devices')
        .update({
          streaming: false,
          channel_name: null,
          stream_token: null,
        })
        .eq('user_id', userId);

      this.isStreaming = false;
      this.channelName = '';
      console.log('✅ Streaming stopped');

    } catch (error) {
      console.error('❌ Failed to stop streaming:', error);
    }
  }

  async getAgoraToken(userId: string, channelName: string): Promise<string> {
    try {
      // Call your backend API to generate token
      const response = await fetch('https://your-dashboard.com/api/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelName,
          userId,
          role: 'publisher',
        }),
      });

      const data = await response.json();
      return data.token;

    } catch (error) {
      console.error('❌ Failed to get token:', error);
      // For testing without token auth (NOT for production):
      return '';
    }
  }

  isCurrentlyStreaming(): boolean {
    return this.isStreaming;
  }

  destroy() {
    this.engine?.release();
  }
}

export default new StreamingService();
```

### 4. Camera Screen Component

Create: `mobile-app/src/screens/CameraScreen.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RtcSurfaceView } from 'react-native-agora';
import StreamingService from '../services/StreamingService';
import { useAuth } from '../contexts/AuthContext'; // Your auth context

export default function CameraScreen() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // Get current logged-in worker

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (isStreaming) {
        StreamingService.stopStreaming(user.id);
      }
    };
  }, [isStreaming, user.id]);

  const handleToggleStreaming = async () => {
    setLoading(true);

    try {
      if (isStreaming) {
        // Stop streaming
        await StreamingService.stopStreaming(user.id);
        setIsStreaming(false);
        Alert.alert('✅ Success', 'Live streaming stopped');
      } else {
        // Start streaming
        await StreamingService.startStreaming(user.id, user.name);
        setIsStreaming(true);
        Alert.alert(
          '✅ Success', 
          'You are now LIVE! Admin and supervisors can see your view on the dashboard.'
        );
      }
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to toggle streaming: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        {isStreaming ? (
          <RtcSurfaceView
            style={styles.camera}
            canvas={{ uid: 0 }}
            zOrderMediaOverlay={true}
          />
        ) : (
          <View style={styles.placeholderCamera}>
            <Text style={styles.placeholderText}>Camera Off</Text>
            <Text style={styles.placeholderSubtext}>
              Tap "Go Live" to start streaming
            </Text>
          </View>
        )}
      </View>

      {/* Status Badge */}
      {isStreaming && (
        <View style={styles.liveBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.button,
            isStreaming ? styles.stopButton : styles.startButton,
          ]}
          onPress={handleToggleStreaming}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : isStreaming ? 'Stop Streaming' : 'Go Live'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.infoText}>
          {isStreaming
            ? '📺 Dashboard viewers can see your live feed'
            : '💡 Start streaming to share your view with admin/supervisors'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  camera: {
    flex: 1,
  },
  placeholderCamera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholderSubtext: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
  },
  liveBadge: {
    position: 'absolute',
    top: 50,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  liveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  controls: {
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#10b981', // Green
  },
  stopButton: {
    backgroundColor: '#ef4444', // Red
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoText: {
    color: '#888',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
});
```

---

## Option B: Simple Video Clips (No Agora Needed)

This approach uploads short video clips to Supabase Storage, giving a "near-live" experience.

### 1. Setup Supabase Storage Bucket

Go to: **Supabase Dashboard → Storage → Create Bucket**
- Name: `live-feeds`
- Public: ✅ Yes

### 2. Storage Policies

Run this SQL in Supabase:

```sql
-- Allow authenticated users to upload their own feeds
CREATE POLICY "Workers can upload their feeds"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'live-feeds' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access
CREATE POLICY "Anyone can view feeds"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'live-feeds');
```

### 3. Simple Streaming Service

```typescript
// mobile-app/src/services/SimpleStreamingService.ts
import { Camera } from 'expo-camera';
import { supabase } from './supabaseClient';
import * as FileSystem from 'expo-file-system';

class SimpleStreamingService {
  private intervalId: NodeJS.Timeout | null = null;
  private cameraRef: any = null;

  setCameraRef(ref: any) {
    this.cameraRef = ref;
  }

  async startStreaming(userId: string) {
    // Record and upload every 5 seconds
    this.intervalId = setInterval(() => {
      this.recordAndUpload(userId);
    }, 5000);

    // First upload immediately
    await this.recordAndUpload(userId);
    
    console.log('✅ Near-live streaming started (5-second clips)');
  }

  async recordAndUpload(userId: string) {
    if (!this.cameraRef) return;

    try {
      // Record 5-second clip
      const video = await this.cameraRef.recordAsync({
        maxDuration: 5,
        quality: Camera.Constants.VideoQuality['720p'],
      });

      // Read video file
      const base64 = await FileSystem.readAsStringAsync(video.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert to blob
      const blob = this.base64ToBlob(base64, 'video/mp4');
      
      // Upload to Supabase Storage
      const fileName = `${userId}/latest.mp4`; // Always overwrite "latest"
      const { error: uploadError } = await supabase.storage
        .from('live-feeds')
        .upload(fileName, blob, {
          contentType: 'video/mp4',
          upsert: true, // Overwrite existing
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('live-feeds')
        .getPublicUrl(fileName);

      // Update devices table
      await supabase.from('devices').update({
        stream_url: urlData.publicUrl + '?t=' + Date.now(), // Cache buster
        streaming: true,
        stream_type: 'mp4',
        last_seen_at: new Date().toISOString(),
      }).eq('user_id', userId);

      console.log('📹 Uploaded clip:', urlData.publicUrl);

    } catch (error) {
      console.error('❌ Failed to record/upload:', error);
    }
  }

  stopStreaming(userId: string) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.cameraRef?.stopRecording();

    supabase.from('devices').update({
      streaming: false,
      stream_url: null,
    }).eq('user_id', userId);

    console.log('✅ Streaming stopped');
  }

  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeType });
  }
}

export default new SimpleStreamingService();
```

---

## Quick Start Checklist

### For Agora (Real-time):
- [ ] Sign up at https://console.agora.io/
- [ ] Get App ID and Certificate
- [ ] Add to `.env.local` (dashboard)
- [ ] Run: `npm install agora-rtc-sdk-ng` (dashboard)
- [ ] Run: `npm install react-native-agora` (mobile)
- [ ] Add streaming columns to database (see STREAMING_SETUP.md)
- [ ] Integrate mobile app code above
- [ ] Test: Start stream on mobile → View on dashboard

### For Simple Clips (Near-live):
- [ ] Create `live-feeds` bucket in Supabase Storage
- [ ] Set up storage policies
- [ ] Run: `npm install expo-camera expo-file-system` (mobile)
- [ ] Add streaming columns to database
- [ ] Integrate SimpleStreamingService code
- [ ] Test: Start stream on mobile → View on dashboard (5-10s delay)

---

## Testing

1. **Start mobile app** → Login as a worker
2. **Open Camera screen** → Tap "Go Live"
3. **Open dashboard** → Navigate to Monitoring
4. **Select the worker** → Should see live feed!

---

## Troubleshooting

**Mobile can't connect:**
- Check camera/microphone permissions
- Verify internet connection
- Check Supabase URL in mobile app config

**Dashboard shows "No stream":**
- Check database: `SELECT * FROM devices WHERE streaming = true;`
- Verify `stream_url` or `channel_name` is set
- Check browser console for errors

**Agora connection fails:**
- Verify App ID is correct
- Check if token is expired (regenerate)
- Ensure firewall allows Agora ports

Need help? Check the STREAMING_SETUP.md file!
