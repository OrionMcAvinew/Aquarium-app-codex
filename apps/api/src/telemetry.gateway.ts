import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/telemetry' })
export class TelemetryGateway {
  @WebSocketServer() server!: Server;
}
