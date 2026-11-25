import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CHANGED_BY_HEADER } from './common/constants/lead-lifecycle.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setGlobalPrefix('api/v1', {
    exclude: ['api/docs'],
  });
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('DealPlus Lead Service API')
    .setDescription(
      `Lead CRUD, qualification, history, and lifecycle APIs for DealPulse. ` +
        `Authenticated user identity is expected via the \`${CHANGED_BY_HEADER}\` header until the shared JWT module (libs/security) is integrated.`,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3002;
  await app.listen(port);
}

void bootstrap();