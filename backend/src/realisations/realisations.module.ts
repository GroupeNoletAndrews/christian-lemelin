import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RealisationsController } from './realisations.controller';
import { RealisationsService } from './realisations.service';

@Module({
  imports: [AuthModule],
  controllers: [RealisationsController],
  providers: [RealisationsService],
})
export class RealisationsModule {}
