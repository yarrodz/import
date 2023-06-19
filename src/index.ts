import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import 'reflect-metadata';

import ImportsRouter from './modules/imports/imports.router';
import ImportProcessesRouter from './modules/import-processes/import-processes.router';
import Websocket from './utils/websocket/websocket';
import ImportProcessesSocket from './modules/import-processes/import-processes.socket';

dotenv.config();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

const app = express();
app.use(cors());
app.use(express.json());
app.use('/imports', ImportsRouter);
app.use('/import-processes', ImportProcessesRouter);

const httpServer = createServer(app);
const io = Websocket.getInstance(httpServer);
io.initializeHandlers([
  { path: '/processes', handler: new ImportProcessesSocket() }
]);

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
