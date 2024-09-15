import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from '../../modules/notifications/notifications.service';

@WebSocketGateway()
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;

  constructor(private readonly notificationsService: NotificationsService) {}

  afterInit(server: Server) {
      console.log('Notifications gateway initialized');
  }

  handleConnection(client: Socket) {
    const userId = this.getUserIdFromClient(client); // Obtén el userId de alguna manera (ej. de los datos de conexión)
    if (userId) {
      // Asigna al cliente a una sala basada en su userId
      client.join(`user_${userId}`);
      console.log(`Client ${client.id} joined room: user_${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
  }


  emitNotificationToUser(userId: string | string[] | number[], payload: any): void {
    console.log(`Emitting notification to user ${userId}:`, payload);
    
    this.server.to(`user_${userId}`).emit('newNotification', payload);

  }

  // emitNotificationToUserAdmin(userId: string | string[] | number[], payload: any): void {
  //   console.log(`Emitting notification to user ${userId}:`, payload);
  //   this.server.to('Admin').except(userId as string).emit('newNotification', payload);

  // }

  private getUserIdFromClient(client: Socket): string | string[] {
    // Supongamos que envías el userId cuando el cliente se conecta
    return client.handshake.query.userId;
  }
}
