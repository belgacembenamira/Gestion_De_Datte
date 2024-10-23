import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { Commande } from './Commande.entity';
import { Client } from 'src/Client/Client.entity';
import { Personnel } from './../Personnel/PersonneEntity.entity';
import { TypeDeDatteQuantity } from './type-de-datte-quantity.entity';

@Injectable()
export class CommandeService {
  constructor(
    @InjectRepository(Commande)
    private readonly commandeRepository: Repository<Commande>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(TypeDeDatteQuantity)
    private readonly typeDeDatteQuantityRepository: Repository<TypeDeDatteQuantity>,
    @InjectRepository(Personnel)
    private readonly personnelRepository: Repository<Personnel>,
  ) {}

  async create(Commande: Commande): Promise<Commande> {
    const { client, coffres, TypeDeDatteQuantity, ...rest } = Commande;

    // Validate client ID presence
    if (!client || !client.id) {
      throw new Error('Client ID is required to create a Commande.');
    }

    // Find the client entity
    const clientEntity = await this.clientRepository.findOne({
      where: { id: client.id },
    });
    if (!clientEntity) {
      throw new Error(`Client not found with ID: ${client.id}`);
    }

    // Create Commande entity
    const commande = this.commandeRepository.create({
      ...rest,
      client: clientEntity,
      personnel: undefined,
      coffres,
    });

    // Save the Commande entity
    const savedCommande = await this.commandeRepository.save(commande);

    // Save TypeDeDatteQuantities if present
    if (Array.isArray(TypeDeDatteQuantity) && TypeDeDatteQuantity.length > 0) {
      for (const quantityData of TypeDeDatteQuantity) {
        if (
          quantityData.quantitybrut !== undefined &&
          quantityData.quantitybrut > 0
        ) {
          const typeDeDatteQuantityEntity =
            this.typeDeDatteQuantityRepository.create({
              quantitybrut: quantityData.quantitybrut,
              quantitynet: quantityData.quantitynet,
              typeDeDatteName: quantityData.typeDeDatteName || '',
              numberDeCoffre: quantityData.numberDeCoffre, // Keep as string
              prixUnitaireDeDatte: quantityData.prixUnitaireDeDatte ?? 0,
              date: quantityData.date
                ? new Date(quantityData.date).toISOString()
                : '',
              commande: savedCommande,
            });
          await this.typeDeDatteQuantityRepository.save(
            typeDeDatteQuantityEntity,
          );
        }
      }
    }

    return savedCommande;
  }
  async findOne(id: number): Promise<Commande> {
    const commande = await this.commandeRepository.findOne({
      where: { id },
      relations: ['client', 'coffres', 'typeDeDatteQuantities'],
    });
    if (!commande) {
      throw new NotFoundException(`Commande with ID ${id} not found`);
    }
    return commande;
  }

  async deleteById(id: number): Promise<void> {
    const result = await this.commandeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Commande with ID ${id} not found`);
    }
  }

  async deleteAll(): Promise<void> {
    const connection = getConnection();
    await connection.query('ALTER TABLE commande_coffre DISABLE TRIGGER ALL');
    await connection.query('TRUNCATE TABLE type_de_datte_quantity CASCADE');
    await connection.query('TRUNCATE TABLE commande CASCADE');
    await connection.query('ALTER TABLE commande_coffre ENABLE TRIGGER ALL');
  }

  async findAll(): Promise<Commande[]> {
    return await this.commandeRepository.find({
      relations: ['typeDeDatteQuantities', 'client', 'coffres'],
    });
  }

  async findAllPersonnel(): Promise<Commande[]> {
    return await this.commandeRepository.find({
      relations: ['typeDeDatteQuantities', 'personnel', 'coffres'],
    });
  }
}
