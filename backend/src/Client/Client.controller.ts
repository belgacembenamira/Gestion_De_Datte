import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { Client } from './client.entity';
import { ClientsService } from './Client.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  // Fetch all clients
  @Get()
  findAll(): Promise<Client[]> {
    return this.clientsService.findAll();
  }

  // Fetch a single client by ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Client | null> {
    // Utilisation de ParseIntPipe pour s'assurer que l'ID est un nombre
    return this.clientsService.findOne(id.toString());
  }

  // Create a new client
  @Post()
  create(@Body() createClientDto: Client): Promise<Client> {
    // Validation du DTO devrait être effectuée ici
    return this.clientsService.create(createClientDto);
  }

  // Update a client
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: Partial<Client>,
  ): Promise<Client> {
    // Utilisation de Partial<Client> pour permettre la mise à jour partielle des champs
    return this.clientsService.update(id.toString(), updateClientDto);
  }

  // Delete a client
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // Suppression d'un client en utilisant son ID
    return this.clientsService.remove(id.toString());
  }

  @Get(':clientId/orders')
  async getClientOrders(@Param('clientId') clientId: string) {
    try {
      const clientOrders = await this.clientsService.findClientOrders(clientId);
      return clientOrders;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Client not found');
      }
      throw error; // Handle other possible errors
    }
  } // Fetch a client by name
  @Get('name/:name')
  findByName(@Param('name') name: string): Promise<Client> {
    // Recherche d'un client par son nom
    return this.clientsService.findByName(name);
  }
}
