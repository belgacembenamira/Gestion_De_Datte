import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CommandePersonnelleService } from './CommandePersonnelle.service'; // Ensure you have the service imported
import { CommandePersonnelle } from './CommandePersonnelle.entity'; // Ensure you have the entity imported

@Controller('commandePersonnelles') // Correct the route name to be meaningful and consistent
export class CommandePersonnelleController {
  constructor(
    private readonly commandePersonnelleService: CommandePersonnelleService, // Follow camel-case convention
  ) {}

  @Post()
  create(@Body() commandePersonnelle: CommandePersonnelle) {
    return this.commandePersonnelleService.create(commandePersonnelle);
  }

  @Delete(':id')
  async deleteCommandePersonnelle(@Param('id') id: number): Promise<void> {
    return this.commandePersonnelleService.deleteById(id);
  }

  @Delete()
  async deleteAllCommandePersonnelles(): Promise<void> {
    return this.commandePersonnelleService.deleteAll();
  }

  @Get()
  findAll() {
    return this.commandePersonnelleService.findAll();
  }

  @Get('findAllPersonnel')
  findAllPersonnel() {
    return this.commandePersonnelleService.findAllPersonnel();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.commandePersonnelleService.findOne(id);
  }
}
