import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

const WEBSOCKET_CORS = {
  origin: '*',
  methods: ['GET', 'POST']
};

class Websocket extends Server {
  private static io: Websocket;

  constructor(httpServer: HttpServer) {
    super(httpServer, {
      cors: WEBSOCKET_CORS
    });
  }

  static getInstance(httpServer?: HttpServer): Websocket {
    if (!Websocket.io) {
      Websocket.io = new Websocket(httpServer);
    }
    return Websocket.io;
  }

  initializeHandlers(socketHandlers: Array<any>) {
    socketHandlers.forEach((element) => {
      let namespace = Websocket.io.of(element.path, (socket: Socket) => {
        element.handler.handleConnection(socket);
      });

      if (element.handler.middlewareImplementation) {
        namespace.use(element.handler.middlewareImplementation);
      }
    });
  }
}

export default Websocket;
