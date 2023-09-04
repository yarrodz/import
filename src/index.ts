import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import session from 'express-session';
import cors from 'cors';
import { iFrameDbClient } from 'iframe-ai';

import Websocket from './utils/websocket/websocket';
import initImports, { InitParams } from './init';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
dotenv.config();
const PORT = process.env.PORT;
const IFRAME_SECRET_KEY = process.env.IFRAME_SECRET_KEY;

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:4200'],
    credentials: true
  })
);
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
  })
);

const httpServer = createServer(app);
const io = Websocket.getInstance(httpServer);

async function start() {
  try {
    const dbClient = iFrameDbClient.getInstance(IFRAME_SECRET_KEY);
    await dbClient.connect();

    const initParams: InitParams = {
      io,
      dbClient,
      clientUri: 'http://localhost:4200/',
      oAuth2RedirectUri: 'http://localhost:3000/oauth-callback/'
    };

    const {
      connectionsRouter,
      importsRouter,
      transfersRouter,
      schedulersRouter,
      oAuth2Router,
      schedulersCron
    } = initImports(initParams);

    app.use('/connections', connectionsRouter.router);
    app.use('/imports', importsRouter.router);
    app.use('/schedulers', schedulersRouter.router);
    app.use('/transfers', transfersRouter.router);
    app.use('', oAuth2Router.router);

    httpServer.listen(PORT, () =>
      console.log(`Server listening on port: ${PORT}`)
    );

    schedulersCron.start();
  } catch (error) {
    console.error(error);
  }
}

start();
