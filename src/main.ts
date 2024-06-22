import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseExceptionsFilter } from './shared/filters/response-exception.filter';
import { ResponseTransformInterceptor } from './shared/interceptors/response-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1'); // Add this line
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  ); // Add this line
  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  app.useGlobalFilters(new ResponseExceptionsFilter());

  app.enableCors(); // Add this line

  setupOpenApi(app);

  await app.listen(3003);

  Logger.log(
    `Application is running on: ${await app.getUrl()}`,
    'CodeLabAPIProduto',
  );
}

bootstrap();

function setupOpenApi(app: INestApplication): void {
  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder().setTitle('CodeLabAPIProduto').build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, { useGlobalPrefix: true });

    Logger.log(`Swagger UI is running on path /docs`, 'CodeLabAPIProduto');
  }
}
