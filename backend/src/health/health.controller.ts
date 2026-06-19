import { Controller, Get } from '@nestjs/common';

// Liveness probe used by the docker-compose healthcheck and the Playwright
// global setup. Intentionally does not touch the DB — the API only starts
// listening after migrations + seed, so a 200 here means the stack is ready.
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}
