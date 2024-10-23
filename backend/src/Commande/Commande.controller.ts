import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CommandeService } from './Commande.service';
import { Commande } from './Commande.entity';

@Controller('commandes')
export class CommandeController {
  constructor(private readonly commandeService: CommandeService) {} // Ensure this is correct

  @Post()
  create(@Body() commande: Commande) {
    return this.commandeService.create(commande);
  }
  // @Post('createP')
  // createPersonnel(@Body() commande: Commande) {
  //   return this.commandeService.createPersonnel(commande);
  // }
  @Delete(':id')
  async deleteCommande(@Param('id') id: number): Promise<void> {
    return this.commandeService.deleteById(id);
  }

  @Delete()
  async deleteAllCommandes(): Promise<void> {
    return this.commandeService.deleteAll();
  }
  @Get()
  findAll() {
    return this.commandeService.findAll();
  }
  @Get('findAllPersonnel')
  findAllPersonnel() {
    return this.commandeService.findAllPersonnel();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.commandeService.findOne(id);
  }

  // Endpoint to retrieve a specific Commande by ID

  // Endpoint to remove a specific Commande by ID
  // @Delete(':id')
  // async remove(@Param('id') id: number): Promise<void> {
  //   await this.commandeService.(id);
  // }

  // Endpoint to remove all Commandes
  // @Delete()
  // async removeAll(): Promise<void> {
  //   await this.commandeService.removeAll();
  // }
}
