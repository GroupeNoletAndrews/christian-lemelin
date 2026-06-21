import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JobsModule } from './jobs/jobs.module';
import { RealisationsModule } from './realisations/realisations.module';
import { ApplicationsModule } from './applications/applications.module';
import { ContactModule } from './contact/contact.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    JobsModule,
    RealisationsModule,
    ApplicationsModule,
    ContactModule,
    WebhooksModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
