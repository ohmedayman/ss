import { realtime } from '@/lib/realtime';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const screenId = searchParams.get('screenId');
  const code = searchParams.get('code');
  const orgId = searchParams.get('orgId');

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', time: Date.now() })}\n\n`));

      const handleScreenEvent = (payload: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch (err) {
          // Stream might be closed
        }
      };

      const handleOrgEvent = (payload: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch (err) {
          // Stream might be closed
        }
      };

      if (screenId) {
        realtime.on(`screen:${screenId}`, handleScreenEvent);
      }
      if (code) {
        realtime.on(`screen:${code.toUpperCase()}`, handleScreenEvent);
      }
      if (orgId) {
        realtime.on(`org:${orgId}`, handleOrgEvent);
      }
      realtime.on(`screen:all`, handleScreenEvent);

      // Ping every 25 seconds to keep connection alive
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch (e) {
          clearInterval(interval);
        }
      }, 25000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        if (screenId) realtime.off(`screen:${screenId}`, handleScreenEvent);
        if (code) realtime.off(`screen:${code.toUpperCase()}`, handleScreenEvent);
        if (orgId) realtime.off(`org:${orgId}`, handleOrgEvent);
        realtime.off(`screen:all`, handleScreenEvent);
        try {
          controller.close();
        } catch (e) {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
