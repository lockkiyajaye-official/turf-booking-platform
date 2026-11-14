import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';



const server = express();
server.use(express.json({ limit: '50mb' }));
server.use(express.urlencoded({ extended: true, limit: '50mb' }));

export const createServer = async () => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
    { bodyParser: false },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  await app.init();
  return server;
};

let cachedServer: any;

export default async (req: any, res: any) => {
  if (!cachedServer) {
    cachedServer = await createServer();
  }
  return cachedServer(req, res);
};
