import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { CommandePersonnelle } from './CommandePersonnelle.entity'; // Import your Commande entity
import { Personnel } from 'src/Personnel/PersonneEntity.entity'; // Import Personnel entity
import { TypeDeDatteQuantityPersonnelle } from './TypeDeDatteQuantityPersonnelle.entity'; // Import the TypeDeDatteQuantityPersonnelle entity
import { Coffre } from 'src/Coffre/Coffre.entity'; // Import Coffre entity

@Injectable()
export class CommandePersonnelleService {
  constructor(
    @InjectRepository(CommandePersonnelle)
    private readonly commandeRepository: Repository<CommandePersonnelle>, // Repository for CommandePersonnelle

    @InjectRepository(Personnel)
    private readonly personnelRepository: Repository<Personnel>, // Repository for Personnel

    @InjectRepository(TypeDeDatteQuantityPersonnelle)
    private readonly TypeDeDatteQuantityPersonnelleRepository: Repository<TypeDeDatteQuantityPersonnelle>, // Repository for TypeDeDatteQuantityPersonnelle

    @InjectRepository(Coffre)
    private readonly coffreRepository: Repository<Coffre>, // Repository for Coffre
  ) {}

  // Create a new CommandePersonnelle
  async create(
    commandeData: CommandePersonnelle,
  ): Promise<CommandePersonnelle> {
    // Destructure relevant properties from the input data
    const {
      coffre,
      personnelsName,
      quantitybrut,
      quantitynet,
      numberDeCoffre,
      typeDeDatteName,
      prixUnitaireDeDatte,
      prix,
      date,
      ...rest
    } = commandeData;

    // Log the incoming commande data
    console.log('Received commandeData:', commandeData);

    // Create CommandePersonnelle entity with provided data
    const newCommandePersonnelle = this.commandeRepository.create({
      ...rest,
      personnelsName,
      quantitybrut,
      quantitynet,
      numberDeCoffre,
      typeDeDatteName,
      prixUnitaireDeDatte,
      prix,
      date,
    });

    console.log(
      'New CommandePersonnelle entity created:',
      newCommandePersonnelle,
    );

    // Save the CommandePersonnelle entity
    const savedCommandePersonnelle = await this.commandeRepository.save(
      newCommandePersonnelle,
    );

    console.log('Saved CommandePersonnelle entity:', savedCommandePersonnelle);

    // Handle related coffres if provided
    if (coffre && Array.isArray(coffre)) {
      console.log('Coffres to link:', coffre);
      for (const singleCoffre of coffre) {
        singleCoffre.CommandePersonnelle = savedCommandePersonnelle; // Link coffre to the CommandePersonnelle
        const savedCoffre = await this.coffreRepository.save(singleCoffre); // Save each coffre
        console.log('Saved Coffre:', savedCoffre); // Log each saved coffre
      }
    } else {
      console.log('No coffres to link.');
    }

    return savedCommandePersonnelle;
  }

  // Find a specific CommandePersonnelle by ID
  async findOne(id: number): Promise<CommandePersonnelle> {
    const commande = await this.commandeRepository.findOne({
      where: { id },
      relations: ['coffres'],
    });
    if (!commande) {
      throw new NotFoundException(
        `CommandePersonnelle with ID ${id} not found`,
      );
    }
    return commande;
  }

  // Delete a specific CommandePersonnelle by ID
  async deleteById(id: number): Promise<void> {
    const result = await this.commandeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `CommandePersonnelle with ID ${id} not found`,
      );
    }
  }

  // Delete all CommandePersonnelles
  async deleteAll(): Promise<void> {
    const connection = getConnection();
    await connection.query('ALTER TABLE commande_coffre DISABLE TRIGGER ALL');
    await connection.query(
      'TRUNCATE TABLE type_de_datte_quantity_personnelle CASCADE',
    );
    await connection.query('TRUNCATE TABLE commande_personnelle CASCADE');
    await connection.query('ALTER TABLE commande_coffre ENABLE TRIGGER ALL');
  }

  // Find all CommandePersonnelles
  async findAll(): Promise<CommandePersonnelle[]> {
    return await this.commandeRepository.find();
  }

  // Find all Personnel associated with CommandePersonnelles
  async findAllPersonnel(): Promise<CommandePersonnelle[]> {
    return await this.commandeRepository.find({
      relations: ['coffres'],
    });
  }
}
