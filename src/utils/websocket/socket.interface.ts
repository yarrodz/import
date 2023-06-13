import { NextFunction } from 'express';
import { Socket } from 'socket.io';

interface ISocket {
  handleConnection(socket: Socket);
  middlewareImplementation?(soccket: Socket, next: NextFunction);
}

export default ISocket;
