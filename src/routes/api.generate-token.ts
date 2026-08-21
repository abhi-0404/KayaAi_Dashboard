/**
 * Agora Token Generation API
 * 
 * Generates temporary RTC tokens for Agora video streaming.
 * Tokens expire after 1 hour for security.
 * 
 * POST /api/generate-token
 * Body: { channelName: string, userId: string, role: 'publisher' | 'subscriber' }
 * Returns: { token: string, channelName: string }
 */

import { defineHandler } from '@tanstack/react-start';
import { RtcTokenBuilder, RtcRole } from 'agora-token';

export default defineHandler({
  method: 'POST',
  handler: async ({ request }) => {
    try {
      const body = await request.json();
      const { channelName, userId, role } = body;

      // Validate required fields
      if (!channelName || !userId || !role) {
        return Response.json(
          { error: 'Missing required fields: channelName, userId, role' },
          { status: 400 }
        );
      }

      // Get Agora credentials from environment
      const appId = process.env.AGORA_APP_ID;
      const appCertificate = process.env.AGORA_APP_CERTIFICATE;

      if (!appId || !appCertificate) {
        console.error('❌ Agora credentials not configured');
        return Response.json(
          { error: 'Agora not configured. Add AGORA_APP_ID and AGORA_APP_CERTIFICATE to .env.local' },
          { status: 500 }
        );
      }

      // Token configuration
      const uid = 0; // 0 means any user can join with this token
      const expirationTimeInSeconds = 3600; // 1 hour
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      // Determine role
      const agoraRole = role === 'publisher' 
        ? RtcRole.PUBLISHER 
        : RtcRole.SUBSCRIBER;

      // Generate token
      const token = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        uid,
        agoraRole,
        privilegeExpiredTs,
        privilegeExpiredTs
      );

      console.log(`✅ Generated Agora token for ${role} on channel: ${channelName}`);

      return Response.json({
        token,
        channelName,
        expiresAt: new Date(privilegeExpiredTs * 1000).toISOString(),
      });

    } catch (error) {
      console.error('❌ Token generation failed:', error);
      return Response.json(
        { error: 'Failed to generate token', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }
});
