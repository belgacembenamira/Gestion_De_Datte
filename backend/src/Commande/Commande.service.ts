import { Injectable, NotFoundException } from '@nestjs/common';
import { Personnel } from './../Personnel/PersonneEntity.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'src/Client/Client.entity';
import { getConnection, Repository } from 'typeorm';
import { Commande } from './Commande.entity';
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
    const { client, coffres, typeDeDatteQuantities, ...rest } = Commande;

    // Log received Commande data
    console.log('Received Commande data:', JSON.stringify(Commande, null, 2));

    // Validate client ID presence
    if (!client || !client.id) {
      console.error('Client ID is missing from the Commande:', client);
      throw new Error('Client ID is required to create a Commande.');
    }

    // Find the client entity
    const clientEntity = await this.clientRepository.findOneBy({
      id: client.id,
    });
    if (!clientEntity) {
      console.warn('Client not found with ID:', client.id);
      throw new Error(`Client not found with ID: ${client.id}`);
    }

    // Create Commande entity
    const commande = this.commandeRepository.create({
      ...rest,
      client: clientEntity,
      coffres,
    });

    // Save the Commande entity
    const savedCommande = await this.commandeRepository.save(commande);
    console.log('Saved Commande:', JSON.stringify(savedCommande, null, 2));

    // Save TypeDeDatteQuantities if present
    if (
      Array.isArray(typeDeDatteQuantities) &&
      typeDeDatteQuantities.length > 0
    ) {
      for (const quantityData of typeDeDatteQuantities) {
        if (quantityData.quantity !== undefined && quantityData.quantity > 0) {
          console.log('Valid TypeDeDatte quantity data:', quantityData);

          const typeDeDatteName = quantityData.typeDeDatteName || '';
          const numberDeCoffre = quantityData.numberDeCoffre ?? 0; // Use nullish coalescing for better clarity
          const prixUnitaireDeDatte = quantityData.prixUnitaireDeDatte ?? 0; // Same as above
          const date = quantityData.date
            ? new Date(quantityData.date).toISOString()
            : ''; // Ensure date is formatted correctly

          // Create and save TypeDeDatteQuantity entity
          const typeDeDatteQuantityEntity =
            await this.typeDeDatteQuantityRepository.save({
              quantity: quantityData.quantity,
              typeDeDatteName,
              numberDeCoffre,
              prixUnitaireDeDatte,
              date,
              commande: savedCommande,
            } as TypeDeDatteQuantity);

          console.log(
            'Saved TypeDeDatteQuantity:',
            JSON.stringify(typeDeDatteQuantityEntity, null, 2),
          );
        } else {
          console.error('Invalid quantity data:', quantityData);
        }
      }
    } else {
      console.warn('No TypeDeDatteQuantities provided or array is empty.');
    }

    console.log(
      'Returning saved Commande with related data:',
      JSON.stringify(savedCommande, null, 2),
    );
    return savedCommande;
  }

  async createPersonnel(Commande: Commande): Promise<Commande> {
    const { personnel, coffres, typeDeDatteQuantities, ...rest } = Commande;

    // Log received Commande data
    console.log('Received Commande data:', JSON.stringify(Commande, null, 2));

    // Validate personnel ID presence
    if (!personnel || !personnel.id) {
      console.error('Personnel ID is missing from the Commande:', personnel);
      throw new Error('Personnel ID is required to create a Commande.');
    }

    const personnelEntity = await this.personnelRepository.findOneBy({
      id: personnel.id,
    });
    if (!personnelEntity) {
      console.warn('Personnel not found with ID:', personnel.id);
      throw new Error(`Personnel not found with ID: ${personnel.id}`);
    }

    // Create Commande entity
    const commande = this.commandeRepository.create({
      ...rest,
      personnel: personnelEntity, // Use personnelEntity
      coffres,
    });

    // Save the Commande entity
    const savedCommande = await this.commandeRepository.save(commande);
    console.log('Saved Commande:', JSON.stringify(savedCommande, null, 2));

    // Save TypeDeDatteQuantities if present
    if (
      Array.isArray(typeDeDatteQuantities) &&
      typeDeDatteQuantities.length > 0
    ) {
      for (const quantityData of typeDeDatteQuantities) {
        if (quantityData.quantity !== undefined && quantityData.quantity > 0) {
          console.log(
            'Valid TypeDeDatte quantity data:',
            JSON.stringify(quantityData, null, 2),
          );

          const typeDeDatteName = quantityData.typeDeDatteName || '';
          const numberDeCoffre = quantityData.numberDeCoffre ?? 0; // Use nullish coalescing for better clarity
          const prixUnitaireDeDatte = quantityData.prixUnitaireDeDatte ?? 0; // Same as above
          const date = quantityData.date
            ? new Date(quantityData.date).toISOString()
            : ''; // Ensure date is formatted correctly

          // Create and save TypeDeDatteQuantity entity
          const typeDeDatteQuantityEntity =
            await this.typeDeDatteQuantityRepository.save({
              quantity: quantityData.quantity,
              typeDeDatteName,
              numberDeCoffre,
              prixUnitaireDeDatte,
              date,
              commande: savedCommande,
            } as TypeDeDatteQuantity);
          console.log(
            'Saved TypeDeDatteQuantity:',
            JSON.stringify(typeDeDatteQuantityEntity, null, 2),
          );
        } else {
          console.error(
            'Invalid quantity data:',
            JSON.stringify(quantityData, null, 2),
          );
        }
      }
    } else {
      console.warn('No TypeDeDatteQuantities provided or array is empty.');
    }

    console.log(
      'Returning saved Commande with related data:',
      JSON.stringify(savedCommande, null, 2),
    );
    return savedCommande as Commande;
  }

  async findOne(id: number): Promise<Commande> {
    return await this.commandeRepository.findOne({
      where: { id },
      relations: ['client', 'coffres', 'typeDeDatteQuantities'],
    });
  }
  async findOneSu(id: number): Promise<Commande> {
    return await this.commandeRepository.findOne({
      where: { id },
      relations: ['client', 'typeDeDatteQuantities'],
    });
  }
  async deleteById(id: number): Promise<void> {
    const result = await this.commandeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Commande with ID ${id} not found`);
    }
  }

  // Méthode pour supprimer toutes les commandes
  async deleteAll(): Promise<void> {
    const connection = getConnection();
    await connection.query('ALTER TABLE commande_coffre DISABLE TRIGGER ALL'); // Désactiver les contraintes
    await connection.query('TRUNCATE TABLE type_de_datte_quantity CASCADE');
    await connection.query('TRUNCATE TABLE commande CASCADE');
    await connection.query('ALTER TABLE commande_coffre ENABLE TRIGGER ALL'); // Réactiver les contraintes
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
  // async removeAll(): Promise<void> {
  //   // Remove all related TypeDeDatteQuantities
  //   await this.typeDeDatteQuantityRepository.clear();

  //   // Remove all Commandes
  //   await this.commandeRepository.clear();
  //   console.log('All Commandes removed');
  // }
}
