import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { io, Socket } from 'socket.io-client';
import { MonitorEvents } from '../events/monitor.event';
@Injectable()
export class SocketIOClient implements OnModuleInit {
  private readonly logger = new Logger(SocketIOClient.name);
  private socket: Socket;
  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const address = this.config?.get('WS_ENDPOINT', '128.199.228.52:9320');
    const endPoint = `ws://${address}`;
    this.socket = io(endPoint);
    await new Promise<void>((res, rej) => {
      this.socket
        .on('connect', () => {
          this.logger.debug(this.socket.id);
          res();
        })
        .on('connect_error', e => {
          rej(e);
        });
    });
  }
  emit(event: MonitorEvents, ...args: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, ...args);
    } else {
      throw new Error('Socket not Connected');
    }
  }
  on(event: MonitorEvents, cb: (args: any) => void) {
    if (this.socket?.connected) {
      this.socket.on(event, cb);
    } else {
      throw new Error('Socket not Connected');
    }
  }
}
