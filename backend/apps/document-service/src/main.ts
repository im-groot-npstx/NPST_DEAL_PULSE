import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
async function bootstrap() {
 const app = await NestFactory.create(AppModule);
 app.setGlobalPrefix('api/v1');
 app.useGlobalPipes(
   new ValidationPipe({
     whitelist: true,
     forbidNonWhitelisted: true,
     transform: true,
     transformOptions: { enableImplicitConversion: true },
   }),
 );
 app.enableCors();
 const config = new DocumentBuilder()
   .setTitle('DealPlus Document Service API')
   .setDescription('API documentation for DealPlus Document Service')
   .setVersion('1.0')
   .addBearerAuth()
   .build();
 const document = SwaggerModule.createDocument(app, config);
 SwaggerModule.setup('api/docs', app, document);
 await app.listen(3005);
}
bootstrap();