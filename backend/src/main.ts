import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody: true exposes req.rawBody (a Buffer) alongside the parsed body — the
  // Resend/Svix webhook signature is computed over the exact raw payload.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Allowlisted origins (comma-separated). In prod set CORS_ORIGIN to the real
  // frontend URL(s). When CORS_ALLOW_LOCALHOST=true (set in the dev compose) we
  // also accept any localhost port — `next dev` may not get :3000 (e.g. the
  // Docker frontend already holds it). Note: the container runs
  // NODE_ENV=production even in dev, so this is a dedicated flag, not NODE_ENV.
  const allowlist = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const allowLocalhost = process.env.CORS_ALLOW_LOCALHOST === 'true';
  const localhostOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
  app.enableCors({
    origin: (
      origin: string | undefined,
      cb: (err: Error | null, allow?: boolean) => void,
    ) => {
      // No Origin header = non-browser client (curl, server-to-server).
      if (!origin) return cb(null, true);
      if (allowlist.includes(origin)) return cb(null, true);
      if (allowLocalhost && localhostOrigin.test(origin)) return cb(null, true);
      // Deny cleanly (no 500): the response just lacks the ACAO header and the
      // browser blocks it.
      return cb(null, false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }),
  );

  // Réalisation images are sent as data URLs — raise the JSON body limit.
  const limit = process.env.JSON_BODY_LIMIT ?? '25mb';
  app.useBodyParser('json', { limit });
  app.useBodyParser('urlencoded', { limit, extended: true });

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`Backend listening on :${port}`);
}

void bootstrap();
