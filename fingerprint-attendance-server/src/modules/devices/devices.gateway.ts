import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AttendanceLogResponseDto } from '../attendance-logs/dto/attendance-log-response.dto';

@WebSocketGateway({ cors: true, namespace: '/devices' })
export class DevicesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(DevicesGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitDeviceStatusUpdate(deviceId: string, status: string, isOnline: boolean) {
    this.server.emit('device:status', {
      deviceId,
      status,
      isOnline,
      timestamp: new Date(),
    });
  }

  emitDeviceAdded(device: any) {
    this.server.emit('device:added', device);
  }

  emitDeviceUpdated(device: any) {
    this.server.emit('device:updated', device);
  }

  emitDeviceDeleted(deviceId: string) {
    this.server.emit('device:deleted', { deviceId });
  }

  emitSyncProgress(deviceId: string, progress: number, message: string) {
    this.server.emit('device:sync:progress', {
      deviceId,
      progress,
      message,
    });
  }

  emitSyncStarted(deviceId: string, syncType: string, timestamp: Date) {
    this.server.emit('sync:started', { deviceId, syncType, timestamp });
  }

  emitSyncCompleted(
    deviceId: string,
    syncType: string,
    recordsCount: number,
    timestamp: Date,
  ) {
    this.server.emit('sync:completed', {
      deviceId,
      syncType,
      recordsCount,
      timestamp,
    });
  }

  emitSyncFailed(
    deviceId: string,
    syncType: string,
    error: string,
    timestamp: Date,
  ) {
    this.server.emit('sync:failed', { deviceId, syncType, error, timestamp });
  }

  emitSyncQueueUpdate(queueStatus: any) {
    this.server.emit('sync:queue:update', queueStatus);
  }

  emitAttendanceLog(log: AttendanceLogResponseDto) {
    this.server.emit('attendance:new', {
      log,
      timestamp: new Date(),
    });
  }
}
