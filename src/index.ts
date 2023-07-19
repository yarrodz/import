import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import session from 'express-session';
import cors from 'cors';

import Websocket from './utils/websocket/websocket';
import setupImport from './setup';
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

const { importsRouter, importProcessesRouter, oAuthRouter } = setupImport(
  io,
  recordModel,
  datasetModel
);

app.use('/imports', importsRouter.router);
app.use('/import-processes', importProcessesRouter.router);
app.use('', oAuthRouter.router);

async function start() {
  try {
    await mongoose.connect(MONGO_URL);
    httpServer.listen(PORT, () =>
      console.log(`Server listening on port: ${PORT}`)
    );
  } catch (error) {
    console.error(error);
  }
}

start();
