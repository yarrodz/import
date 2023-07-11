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
    // origin: ['http://localhost:4200', 'http://info.cern.ch/', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true
  })
);
// app.use(cors());

app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
  })
);

app.get('/red/', (req, res) => {
  // res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  // res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  // res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  // res.header("Access-Control-Allow-Origin", "*");
  res.status(302).redirect('http://info.cern.ch/');
  // res.status(302).redirect('http://localhost:4200/');
});

const httpServer = createServer(app);
const io = Websocket.getInstance(httpServer);

const { importsRouter, importProcessesRouter, oAuthRouter } = setupImport(
  io,
  recordModel,
  datasetModel,
  5,
  5000,
  100
);

app.use('/imports', importsRouter.router);
app.use('/import-processes', importProcessesRouter.router);
app.use('', oAuthRouter.router);
app.post('/set-session', (req, res) => {
  req.session['myValue'] = 'Hello from session';
  res.send('Session value set');
});

app.get('/get-session', (req, res) => {
  const sessionValue = req.session['myValue'];
  res.send(sessionValue || 'no');
});


async function start() {
  try {
    await mongoose.connect(MONGO_URL);
    httpServer.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
  } catch (error) {
    console.error(error);
  }
}

start();
