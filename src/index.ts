import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
// import Websocket from './utils/websocket/websocket';

import DatasetsRouter from './modules/datasets/datasets.router';
import ImportsRouter from './modules/imports/imports.router';
// import ImportProcessesRouter from './modules/import-processes/import-processes.router';

const app = express();
app.use(express.json());

app.use('/datasets', DatasetsRouter);
app.use('/imports', ImportsRouter);
// app.use('/import-processes', ImportProcessesRouter);

// const httpServer = createServer(app);
// Websocket.getInstance(httpServer);

dotenv.config();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

async function start() {
  try {
    await mongoose.connect(MONGO_URL);
    app.listen(PORT, () =>
      console.log(`Server listening on port: ${PORT}`)
    );
  } catch (error) {
    console.error(error);
  }
}
 
start();