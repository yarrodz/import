import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Websocket from './utils/websocket/websocket';
import setupImport from './setup';
import { recordModel } from './record.schema';
import { datasetModel } from './dataset.schema';

dotenv.config();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

const app = express();
app.use(express.json());

const httpServer = createServer(app);
const io = Websocket.getInstance(httpServer);

const { importsRouter, importProcessesRouter } = setupImport(
  io,
  recordModel,
  datasetModel,
  5,
  5000,
  100
);

app.use('/imports', importsRouter.router);
app.use('/import-processes', importProcessesRouter.router);

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
