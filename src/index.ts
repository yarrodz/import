import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import session from 'express-session';
import cors from 'cors';

import Websocket from './utils/websocket/websocket';
import dbClient from './utils/db-client/db-client';
import setupImport, { ISetupParams } from './setup';

dotenv.config();
const PORT = process.env.PORT;
// const IFRAME_SECRET_KEY = process.env.IFRAME_SECRET_KEY;

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

const setupParams: ISetupParams = {
  io,
  clientUri: 'http://localhost:4200/',
  oAuth2RedirectUri: 'http://localhost:3000/oauth-callback/'
};
const { synchronizationsRouter, transfersRouter, oAuth2Router } =
  setupImport(setupParams);

app.use('/synchronizations', synchronizationsRouter.router);
app.use('/transfers', transfersRouter.router);
app.use('', oAuth2Router.router);

async function start() {
  try {
    await dbClient.connect();
    httpServer.listen(PORT, () =>
      console.log(`Server listening on port: ${PORT}`)
    );
    // reloadPendingImportProcesses();
  } catch (error) {
    console.error(error);
  }
}

start();
