import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  // Récupérer tous les clients
  findAll(): Promise<Client[]> {
    return this.clientsRepository.find({ relations: ['coffres', 'commandes'] });
  }

  // Récupérer un client par ID
  async findOne(id: string): Promise<Client> {
    const client = await this.clientsRepository.findOne({
      where: { id: Number(id) },
      relations: ['coffres', 'commandes'],
    });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  // Créer un nouveau client
  create(client: Client): Promise<Client> {
    return this.clientsRepository.save(client);
  }

  // Mettre à jour un client (PATCH)
  async update(id: string, updateClientData: Partial<Client>): Promise<Client> {
    const client = await this.clientsRepository.findOne({
      where: { id: Number(id) },
    });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    Object.assign(client, updateClientData);
    return this.clientsRepository.save(client);
  }

  // Supprimer un client
  async remove(id: string): Promise<void> {
    const client = await this.clientsRepository.findOne({
      where: { id: Number(id) },
    });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    await this.clientsRepository.remove(client);
  }
  async findClientOrders(clientId: string): Promise<any> {
    const client = await this.clientsRepository.findOne({
      where: { id: Number(clientId) },
      relations: [
        'commandes',
        'commandes.typeDeDatteQuantities',
        'commandes.typeDeDatteQuantities.typeDeDatte',
        'commandes.coffres',
      ],
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Structure the response to include client name and their orders
    const clientOrdersResponse = {
      name: client.name,
      commandes: client.commandes.map((commande) => ({
        id: commande.id,
        date: commande.date,
        qty: commande.qty,
        prix: commande.prix,
        typeDeDatteQuantities: commande.typeDeDatteQuantities.map(
          (typeDeDatteQuantity) => ({
            id: typeDeDatteQuantity.id,
            quantity: typeDeDatteQuantity.quantity,
            typeDeDatteName: typeDeDatteQuantity.typeDeDatteName,
            numberDeCoffre: typeDeDatteQuantity.numberDeCoffre,
          }),
        ),
        coffres: commande.coffres.map((coffre) => ({
          id: coffre.id,
          TypeCoffre: coffre.TypeCoffre,
          PoidsCoffre: coffre.PoidsCoffre,
        })),
      })),
    };

    return clientOrdersResponse;
  }

  findByName(name: string): Promise<Client> {
    return this.clientsRepository.findOne({ where: { name } });
  }
  async findClientByName(name: string): Promise<Client | null> {
    return await this.clientsRepository.findOne({ where: { name } });
  }
}
