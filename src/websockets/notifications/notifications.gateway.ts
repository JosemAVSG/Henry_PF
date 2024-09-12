import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';

@WebSocketGateway()
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;

  constructor(private readonly notificationsService: NotificationsService) {}

  afterInit(server: Server) {
      console.log('Notifications gateway initialized');
  }

  handleConnection(client: Socket) {
      console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('notification')
  handleNotification(client: Socket, payload: any): void {
      // Emite la notificación de inmediato a todos los clientes
      this.server.emit('newNotification', payload);
  
      // Guarda la notificación en segundo plano sin bloquear la emisión
      // this.notificationsService.saveNotification(payload, client.id)
      //     .then(() => {
      //         console.log('Notification saved successfully');
      //     })
      //     .catch(err => {
      //         console.error('Failed to save notification:', err);
      //     });
  }
  
}
