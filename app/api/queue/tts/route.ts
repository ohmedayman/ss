import { NextRequest, NextResponse } from 'next/server';

// Server-side in-memory audio cache for common announcements to save ElevenLabs credits & achieve 0ms latency
const ttsCache = new Map<string, { buffer: Buffer; contentType: string }>();

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const trimmedText = text.trim();
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ELEVENLABS_API_KEY is not configured', fallback: true },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `${trimmedText}_${voiceId || 'default'}`;
    if (ttsCache.has(cacheKey)) {
      const cached = ttsCache.get(cacheKey)!;
      return new NextResponse(new Uint8Array(cached.buffer), {
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=86400, immutable',
          'X-TTS-Source': 'cache',
        },
      });
    }

    // Default ultra-realistic Arabic-capable voice ID (e.g. Rachel / Adam / custom Arabic voice)
    const selectedVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: trimmedText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.1,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('ElevenLabs API error:', response.status, errText);
      return NextResponse.json(
        { error: 'Failed to generate speech with ElevenLabs', details: errText, fallback: true },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'audio/mpeg';

    // Store in cache
    if (ttsCache.size < 500) {
      ttsCache.set(cacheKey, { buffer, contentType });
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
        'X-TTS-Source': 'elevenlabs',
      },
    });
  } catch (error: any) {
    console.error('TTS route error:', error);
    return NextResponse.json(
      { error: error.message || 'TTS generation failed', fallback: true },
      { status: 500 }
    );
  }
}
