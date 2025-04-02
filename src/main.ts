import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception/http-exception.filter';
import cookieParser from 'cookie-parser';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger))
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Automatically transform payloads to DTO instances
    whitelist: true, // Strip unknown properties
  }))
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(cookieParser())
  
  // Configure express to handle form data
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Serve static files from public directory
  app.use('/file', express.static('public/file'));
  
  await app.listen(app.get(ConfigService).getOrThrow('PORT'));
}
bootstrap();
