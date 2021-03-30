import { Module } from '@nestjs/common';
import { SocketIOClient } from './socket-io-client';
@Module({ providers: [SocketIOClient], exports: [SocketIOClient] })
export class SocketIoModule {}
