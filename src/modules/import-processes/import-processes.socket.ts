import { NextFunction } from 'express';
import { Socket } from 'socket.io';

import ISocket from '../../utils/websocket/socket.interface';

class ImportProcessesSocket implements ISocket {
  handleConnection(socket: Socket) {
    socket.on('join', (processId: string) => {
      socket.join(processId.trim());
    });
  }

  middlewareImplementation(socket: Socket, next: NextFunction) {
    return next();
  }
}

export default ImportProcessesSocket;
