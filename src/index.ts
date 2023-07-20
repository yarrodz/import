import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import session from 'express-session';
import cors from 'cors';

import Websocket from './utils/websocket/websocket';
import setupImport, { ISetupParams } from './setup';
import { recordModel } from './record.schema';
import { datasetModel } from './dataset.schema';

dotenv.config();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

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
  recordModel,
  datasetModel,
  maxAttempts: 3,
  attemptDelayTime: 1000,
  oAuth2RedirectUri: 'http://localhost:3000/oauth-callback/',
  clientUri: 'http://localhost:4200/'
};
const {
  importsRouter,
  importProcessesRouter,
  oAuth2Router,
  reloadPendingImportProcesses
} = setupImport(setupParams);

app.use('/imports', importsRouter.router);
app.use('/import-processes', importProcessesRouter.router);
app.use('', oAuth2Router.router);

async function start() {
  try {
    await mongoose.connect(MONGO_URL);
    httpServer.listen(PORT, () =>
      console.log(`Server listening on port: ${PORT}`)
    );
    reloadPendingImportProcesses();
  } catch (error) {
    console.error(error);
  }
}

start();
