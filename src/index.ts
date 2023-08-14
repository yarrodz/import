import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import session from 'express-session';
import cors from 'cors';
import { iFrameDbClient } from 'iframe-ai';

import Websocket from './utils/websocket/websocket';
import setupImport, { ISetupParams } from './setup';

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

const setupParams: ISetupParams = {
  io,
  clientUri: 'http://localhost:4200/',
  oAuth2RedirectUri: 'http://localhost:3000/oauth-callback/'
};
const { connectionsRouter, importsRouter, transfersRouter, oAuth2Router } =
  setupImport(setupParams);

app.use('/connections', connectionsRouter.router);
app.use('/imports', importsRouter.router);
app.use('/transfers', transfersRouter.router);
app.use('', oAuth2Router.router);
app.get('/', (req,res) => res.send('ok'))

process.on('uncaughtException', function (err) {
  console.log(err);
});

let dbClient;
async function start() {
  try {
    dbClient = iFrameDbClient.getInstance(IFRAME_SECRET_KEY);
    await dbClient.connect();

    console.log('index dbClient: ', dbClient);

    httpServer.listen(PORT, () =>
      console.log(`Server listening on port: ${PORT}`)
    );
  } catch (error) {
    console.error(error);
  }
}

start();

export default dbClient;