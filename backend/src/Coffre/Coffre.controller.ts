// coffres.controller.ts

import {
  Controller,
  Get,
  Param,
  Body,
  Patch,
  Post,
  Delete,
} from '@nestjs/common';
import { Coffre } from './coffre.entity';
import { CoffresService } from './Coffre.service';

@Controller('coffres')
export class CoffresController {
  constructor(private readonly coffresService: CoffresService) {}

  // Récupérer tous les coffres
  @Get()
  findAll(): Promise<Coffre[]> {
    return this.coffresService.findAll();
  }

  // Récupérer un coffre par ID
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Coffre> {
    return this.coffresService.findOne(id);
  }

  // Créer un nouveau coffre
  @Post()
  create(@Body() coffre: Partial<Coffre>): Promise<Coffre> {
    return this.coffresService.create(coffre);
  }

  // Mettre à jour un coffre (PATCH)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() coffre: Partial<Coffre>,
  ): Promise<Coffre> {
    return this.coffresService.update(id, coffre);
  }

  // Supprimer un coffre
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.coffresService.remove(id);
  }
}
