import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for specific frontend URLs
  app.enableCors({
    origin: ['http://localhost:3000'], // Frontend URL for React app
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SKO API Documentation')
    .setDescription('Documentation for SKO API')
    .setVersion('1.0')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/api-docs', app, swaggerDocument); // Changed path to /api-docs

  await app.listen(5000);
  console.log('Server is running on http://localhost:5000');
}

bootstrap();
