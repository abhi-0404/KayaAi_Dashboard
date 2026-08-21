# 🎥 Quick Start: Live Streaming Setup

Get live camera streaming from mobile app to dashboard in **15 minutes**.

---

## 📋 What You'll Get

✅ Real-time video from worker's mobile camera  
✅ Admin/supervisors can watch on dashboard  
✅ Automatic stream status updates  
✅ Support for multiple streaming methods

---

## 🚀 Choose Your Path

### **Path A: Agora (Real-Time)** ⚡
- **Latency:** < 1 second
- **Best for:** Live monitoring, safety-critical
- **Setup time:** 15 minutes
- **Cost:** $0.99 per 1,000 minutes (10k free/month)

### **Path B: Simple Clips (Near-Live)** 🎬
- **Latency:** 5-10 seconds  
- **Best for:** Testing, non-critical monitoring
- **Setup time:** 10 minutes
- **Cost:** Free (Supabase storage only)

---

## 🎯 Path A: Agora Setup (Recommended)

### Step 1: Database Setup (2 minutes)

1. Go to your Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/gjlblcrmqkbxlrqxffaz/sql/new
   ```

2. Copy and paste the contents of:
   ```
   scripts/setup-streaming-database.sql
   ```

3. Click **RUN** ✅

### Step 2: Get Agora Credentials (5 minutes)

1. **Sign up:** https://console.agora.io/
2. **Create project:**
   - Name: "Kaya AI Streaming"
   - Authentication: "Secured mode: APP ID + Token"
3. **Copy App ID** (looks like: `a1b2c3d4e5f6g7h8`)
4. **Enable & copy App Certificate**

### Step 3: Configure Dashboard (1 minute)

Add to your `.env.local`:

```bash
# Agora Streaming
VITE_AGORA_APP_ID=paste_your_app_id_here
AGORA_APP_ID=paste_your_app_id_here
AGORA_APP_CERTIFICATE=paste_your_certificate_here
```

### Step 4: Install Dashboard Dependencies (Already Done! ✅)

```bash
npm install agora-rtc-sdk-ng agora-access-token
```

**Status:** ✅ Already installed!

### Step 5: Integrate Mobile App (5 minutes)

Follow the complete code examples in:
```
MOBILE_APP_INTEGRATION.md
```

**Quick summary:**
```bash
# In your mobile app
npm install react-native-agora

# Copy StreamingService.ts code from MOBILE_APP_INTEGRATION.md
# Copy CameraScreen.tsx component
# Add to your app navigation
```

### Step 6: Test! (2 minutes)

1. **Mobile:** Open app → Start streaming
2. **Dashboard:** Open monitoring page → Select worker
3. **See live feed!** 🎉

---

## 🎬 Path B: Simple Clips (No Agora)

### Step 1: Database Setup

Same as Path A - run `scripts/setup-streaming-database.sql`

### Step 2: Create Storage Bucket

1. Go to: **Supabase Dashboard → Storage**
2. Click: **New Bucket**
   - Name: `live-feeds`
   - Public: ✅ Yes
3. **Policies:** Already included in SQL script ✅

### Step 3: Mobile App Integration

Follow **Option B** in `MOBILE_APP_INTEGRATION.md`:
- Uses Expo Camera
- Records 5-second clips
- Auto-uploads to Supabase Storage
- Dashboard auto-refreshes every 5 seconds

### Step 4: Test!

Same as Path A - mobile streams, dashboard shows!

---

## ✅ Dashboard Is Ready!

Your dashboard monitoring page (`src/routes/_authenticated/monitoring.tsx`) **already has all the code** to display live streams! 

It supports:
- ✅ Agora real-time streaming
- ✅ HLS video streams
- ✅ MP4 video files
- ✅ Automatic stream type detection
- ✅ Real-time status updates via Supabase Realtime

---

## 🧪 Test Without Mobile App

Want to test the dashboard first? Add test stream data:

```sql
-- In Supabase SQL Editor:
UPDATE devices 
SET 
  stream_url = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  streaming = true,
  stream_type = 'hls'
WHERE user_id = (SELECT id FROM auth.users LIMIT 1);
```

Then refresh the monitoring page - you'll see a test HLS stream!

---

## 📁 File Guide

| File | Purpose |
|------|---------|
| `STREAMING_SETUP.md` | Detailed technical guide |
| `MOBILE_APP_INTEGRATION.md` | Complete mobile app code |
| `scripts/setup-streaming-database.sql` | Database migration |
| `src/routes/_authenticated/monitoring.tsx` | Dashboard player (✅ ready!) |

---

## 🐛 Troubleshooting

### "No live stream available"

Check database:
```sql
SELECT user_id, streaming, stream_url, channel_name 
FROM devices 
WHERE streaming = true;
```

If empty → Mobile app hasn't started streaming yet

### Mobile app can't connect

- ✅ Check camera/mic permissions
- ✅ Verify internet connection
- ✅ Check Agora App ID matches
- ✅ Verify Supabase URL in mobile app

### Dashboard won't play video

- ✅ Open browser console (F12) - check for errors
- ✅ Verify VITE_AGORA_APP_ID in .env.local
- ✅ Test stream URL directly in browser
- ✅ Check firewall/network settings

### Agora errors

- ❌ "Invalid App ID" → Copy App ID again from Agora Console
- ❌ "Token expired" → Check token generation API
- ❌ "Channel not found" → Mobile app may not have joined yet

---

## 💰 Cost Breakdown

### Agora (Path A):
- **Free tier:** 10,000 minutes/month
- **Paid:** $0.99 per 1,000 minutes
- **Example:** 10 workers × 8 hrs/day = ~$71/month

### Simple Clips (Path B):
- **Storage:** Supabase free tier = 1GB (enough for ~100 hours)
- **Bandwidth:** Supabase free tier = 2GB/month
- **Paid:** ~$0.021 per GB storage

---

## 🎯 Production Checklist

Before going live:

- [ ] Database migration completed
- [ ] Streaming credentials configured
- [ ] Mobile app tested with real device
- [ ] Dashboard tested with multiple concurrent streams
- [ ] Error handling tested (network drops, etc.)
- [ ] Stream cleanup on mobile app close
- [ ] Monitor Agora/Supabase usage
- [ ] Set up alerts for high usage
- [ ] Document for team

---

## 🆘 Need Help?

1. **Check the guides:**
   - `STREAMING_SETUP.md` - Detailed technical info
   - `MOBILE_APP_INTEGRATION.md` - Mobile code examples

2. **Verify each step:**
   - Database columns added?
   - Credentials configured?
   - Mobile app permissions granted?

3. **Test incrementally:**
   - Database ✅
   - Test stream URL ✅
   - Mobile app ✅
   - Dashboard ✅

---

## 🎉 You're All Set!

**Current Status:**
- ✅ Dashboard monitoring page updated with Agora support
- ✅ npm packages installed (`agora-rtc-sdk-ng`, `agora-access-token`)
- ✅ Database migration script ready
- ✅ Mobile app integration guides created
- ✅ Real-time sync via Supabase Realtime

**Next Step:**
1. Run the database SQL script
2. Get Agora credentials (or skip for Simple Clips)
3. Integrate mobile app
4. Go Live! 🚀

---

**Questions?** Check the detailed guides or test with the sample HLS stream first!
