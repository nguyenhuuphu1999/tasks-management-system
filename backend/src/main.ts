import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggerService } from './common/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = await app.resolve(LoggerService);
  Logger.overrideLogger(logger);
  Logger.log('Application starting...', 'Bootstrap');

  app.enableCors({
    origin: 'http://localhost:8080', // Thay bằng origin của frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Các phương thức HTTP được phép
    allowedHeaders: 'Content-Type, Authorization', // Các header được phép
    credentials: true, // Cho phép gửi cookie hoặc credentials (nếu cần)
  });

  app.useGlobalFilters(new HttpExceptionFilter(logger));

  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('API for task management system')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearerAuth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
  Logger.log(`Application is running on: ${await app.getUrl()}`, 'Bootstrap');

  process.on('SIGTERM', async () => {
    Logger.log('Received SIGTERM. Shutting down gracefully...', 'Bootstrap');
    await app.close();
    Logger.log('Application shut down successfully', 'Bootstrap');
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    Logger.log('Received SIGINT. Shutting down gracefully...', 'Bootstrap');
    await app.close();
    Logger.log('Application shut down successfully', 'Bootstrap');
    process.exit(0);
  });
}
bootstrap();