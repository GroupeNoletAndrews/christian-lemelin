import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateRealisationDto,
  ReorderRealisationsDto,
  UpdateRealisationDto,
} from './dto/realisation.dto';
import { RealisationsService } from './realisations.service';

@Controller('realisations')
export class RealisationsController {
  constructor(private readonly realisations: RealisationsService) {}

  @Get()
  list() {
    return this.realisations.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.realisations.get(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateRealisationDto) {
    return this.realisations.create(dto);
  }

  // Distinct one-segment path — does not collide with ':id' or ':id/pin'.
  @UseGuards(JwtAuthGuard)
  @Patch('reorder')
  reorder(@Body() dto: ReorderRealisationsDto) {
    return this.realisations.reorder(dto.ids);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRealisationDto) {
    return this.realisations.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/pin')
  togglePin(@Param('id') id: string) {
    return this.realisations.togglePin(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.realisations.remove(id);
  }
}
