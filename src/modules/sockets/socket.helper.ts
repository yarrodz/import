import { Server as IO } from 'socket.io';

export class SocketHelper {
  private io: IO;
 
  constructor(io: IO) {
    this.io = io;
  }

  emit(to: string, event: string, value: any) {
    this.io.to(to).emit(event, value);
  }
}