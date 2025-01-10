import express, { Express } from 'express';
import connectDB from '../src/config/db';
import dotenv from 'dotenv';
import routes from '../src/routes/index';
import userRoutes from './routes/userRoutes';
import creatorRoutes from './routes/creatorRoutes';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import globalErrorHandler from './middlewares/errorMiddleware';

dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

connectDB();

const port: string | undefined = process.env.PORT;

const app: Express = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(
  cors({
    origin: 'http://localhost:8000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(cookieParser());

app.use('/user', userRoutes);
app.use('/creator', creatorRoutes);
app.use('/', routes);

app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
