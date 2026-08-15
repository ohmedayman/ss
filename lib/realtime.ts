import { EventEmitter } from 'events';

// Global Event Hub for Real-time push to players & dashboards
class RealtimeHub extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(200);
  }

  // Notify a specific screen about content updates or commands
  public notifyScreen(screenId: string, event: string, data: any) {
    this.emit(`screen:${screenId}`, { event, data, timestamp: Date.now() });
    this.emit(`screen:all`, { screenId, event, data, timestamp: Date.now() });
  }

  // Notify dashboard of screen status changes (online/offline/screenshot)
  public notifyDashboard(orgId: string, event: string, data: any) {
    this.emit(`org:${orgId}`, { event, data, timestamp: Date.now() });
  }
}

declare global {
  var __screenflow_realtime: RealtimeHub | undefined;
}

export const realtime = global.__screenflow_realtime || new RealtimeHub();
if (process.env.NODE_ENV !== 'production') {
  global.__screenflow_realtime = realtime;
}
