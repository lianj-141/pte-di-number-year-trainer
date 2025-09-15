import crypto from 'crypto';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Parse request body
    const body = await request.json();
    const { text, voice = '1001', speed = 0 } = body;

    // Validate input
    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (text.length > 150) {
      return new Response(JSON.stringify({ error: 'Text too long (max 150 characters)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Environment variables check
    const secretId = env.TENCENT_SECRET_ID;
    const secretKey = env.TENCENT_SECRET_KEY;
    const region = env.TENCENT_REGION || 'ap-guangzhou';

    if (!secretId || !secretKey) {
      return new Response(JSON.stringify({ error: 'TTS service not configured' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Tencent Cloud TTS API call
    const ttsResponse = await callTencentTTS(text, voice, speed, secretId, secretKey, region);
    
    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('TTS API error:', errorText);
      return new Response(JSON.stringify({ error: 'TTS service unavailable' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Return audio data
    const audioBuffer = await ttsResponse.arrayBuffer();
    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      }
    });

  } catch (error) {
    console.error('TTS proxy error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function callTencentTTS(text, voiceType, speed, secretId, secretKey, region) {
  const service = 'tts';
  const version = '2019-08-23';
  const action = 'TextToVoice';
  const timestamp = Math.floor(Date.now() / 1000);
  const date = new Date(timestamp * 1000).toISOString().substring(0, 10);

  // Request payload
  const payload = {
    Text: text,
    SessionId: `cf-${Date.now()}`,
    VoiceType: parseInt(voiceType),
    Volume: 5,
    Speed: parseInt(speed),
    Codec: 'mp3'
  };

  const payloadStr = JSON.stringify(payload);

  // Build canonical request
  const algorithm = 'TC3-HMAC-SHA256';
  const canonicalHeaders = [
    'content-type:application/json; charset=utf-8',
    `host:${service}.tencentcloudapi.com`,
    `x-tc-action:${action.toLowerCase()}`,
    `x-tc-timestamp:${timestamp}`,
    `x-tc-version:${version}`
  ].join('\n') + '\n';

  const signedHeaders = 'content-type;host;x-tc-action;x-tc-timestamp;x-tc-version';
  const hashedPayload = sha256(payloadStr);
  
  const canonicalRequest = [
    'POST',
    '/',
    '',
    canonicalHeaders,
    signedHeaders,
    hashedPayload
  ].join('\n');

  // Build string to sign
  const credentialScope = `${date}/${service}/tc3_request`;
  const hashedCanonicalRequest = sha256(canonicalRequest);
  const stringToSign = [
    algorithm,
    timestamp,
    credentialScope,
    hashedCanonicalRequest
  ].join('\n');

  // Calculate signature
  const secretDate = hmacSha256(secretKey, date);
  const secretService = hmacSha256(secretDate, service);
  const secretSigning = hmacSha256(secretService, 'tc3_request');
  const signature = hmacSha256(secretSigning, stringToSign, 'hex');

  // Build authorization header
  const authorization = `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  // Make API request
  const url = `https://${service}.tencentcloudapi.com/`;
  const headers = {
    'Authorization': authorization,
    'Content-Type': 'application/json; charset=utf-8',
    'Host': `${service}.tencentcloudapi.com`,
    'X-TC-Action': action,
    'X-TC-Timestamp': timestamp.toString(),
    'X-TC-Version': version,
    'X-TC-Region': region
  };

  return fetch(url, {
    method: 'POST',
    headers: headers,
    body: payloadStr
  });
}

function sha256(message) {
  return crypto.createHash('sha256').update(message, 'utf8').digest('hex');
}

function hmacSha256(key, message, encoding = 'buffer') {
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(message, 'utf8');
  return encoding === 'hex' ? hmac.digest('hex') : hmac.digest();
}