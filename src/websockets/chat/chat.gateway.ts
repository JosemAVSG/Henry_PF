import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;

    afterInit(server: Server) {
        console.log('Chat gateway initialized');
    }

    handleConnection(client: Socket, ...args: any[]) { 
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('message')
    handleMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
        const {room, message} = payload;
        console.log(payload);
        this.server.to(`room-${room}`).emit('message', message);   
    }

    @SubscribeMessage('joinRoom')
    joinRoom(@ConnectedSocket() client: Socket, room: string): void {
        client.join(`room-${room}`);
        console.log(`Client ${client.id} joined room ${room}`);
    }

    @SubscribeMessage('leaveRoom')
    leaveRoom(client: Socket, room: string): void {
        client.leave(`room-${room}`);
        console.log(`Client ${client.id} left room ${room}`);
    }
}