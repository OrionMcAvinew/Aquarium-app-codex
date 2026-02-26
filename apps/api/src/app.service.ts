import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return {
      status: 'ok',
      service: 'reefops-api',
      ts: new Date().toISOString(),
      uptimeSec: Math.round(process.uptime()),
    };
  }

  metrics() {
    return {
      requests_total: 0,
      jobs_processed_total: 0,
      notifications_total: 0,
      websocket_connections: 0,
      correlation_id_enabled: true,
    };
  }
}
