import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Post()
  create(@Body() dto: CreateContactDto) {
    return this.contact.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  list() {
    return this.contact.list();
  }
}
