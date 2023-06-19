import { NextFunction } from 'express';
import { Socket } from 'socket.io';

interface ISocket {
  handleConnection(socket: Socket): void;
  middlewareImplementation?(soccket: Socket, next: NextFunction): void;
}

export default ISocket;
