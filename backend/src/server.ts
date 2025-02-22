import path from 'path';
import express, { Express } from 'express';
import connectDB from '../src/config/db';
import dotenv from 'dotenv';
import routes from '../src/routes/index';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import globalErrorHandler from './middlewares/errorMiddleware';
import http from 'http';
import socketConfig from './socketConfig';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

connectDB();

const port: string | undefined = process.env.PORT;

const app: Express = express();
const server = http.createServer(app);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(cookieParser());

app.use('/', routes);

app.use(globalErrorHandler);

socketConfig.initializeSocket(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
