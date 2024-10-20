import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commande } from 'src/Commande/Commande.entity';
import { Logger } from '@nestjs/common'; // Import Logger
import { Personnel } from './PersonneEntity.entity';

@Injectable()
export class PersonnelService {
  private readonly logger = new Logger(PersonnelService.name); // Instance de Logger

  constructor(
    @InjectRepository(Personnel)
    private personnelRepository: Repository<Personnel>,

    @InjectRepository(Commande)
    private commandesRepository: Repository<Commande>,
  ) {}

  // Retrieve all personnel with their commandes and coffres
  async findAll(): Promise<Personnel[]> {
    this.logger.log(
      'Retrieving all personnel with their commandes and coffres.',
    );
    try {
      const personnel = await this.personnelRepository.find({
        relations: ['commandes'], // Relations à récupérer
      });
      this.logger.debug(`Found ${personnel.length} personnel.`);
      return personnel;
    } catch (error) {
      this.logger.error('Error retrieving personnel.', error.stack);
      throw error;
    }
  }

  // Retrieve a personnel by ID with their commandes and coffres
  async findOne(id: number): Promise<Personnel> {
    this.logger.log(`Retrieving personnel with ID ${id}.`);
    try {
      const personnel = await this.personnelRepository.findOne({
        where: { id: Number(id) },
        relations: ['commandes'], // Relations associées
      });

      if (!personnel) {
        this.logger.warn(`Personnel with ID ${id} not found.`);
        throw new NotFoundException(`Personnel with ID ${id} not found`);
      }

      this.logger.debug(`Found personnel with ID ${id}.`);
      return personnel;
    } catch (error) {
      this.logger.error(
        `Error retrieving personnel with ID ${id}.`,
        error.stack,
      );
      throw error;
    }
  }

  // Create a new personnel with data validation
  // Create a new personnel with data validation

  // Retrieve all personnel with their associated commandes and coffre count
  async findAllWithCommandesAndCoffres(): Promise<Personnel[]> {
    return this.personnelRepository.find({
      relations: ['commandes'], // Assuming these relations exist in the entity
    });
  }
  async findAllPersonnelWithCommandes(): Promise<Personnel[]> {
    this.logger.log('Retrieving all personnel with their commandes.');
    try {
      const personnel = await this.personnelRepository.find({
        relations: ['commandes'], // Load related commandes
      });

      this.logger.debug(`Found ${personnel.length} personnel with commandes.`);
      return personnel;
    } catch (error) {
      this.logger.error(
        'Error retrieving personnel with commandes.',
        error.stack,
      );
      throw new NotFoundException(
        'Could not retrieve personnel with commandes.',
      );
    }
  }
  async create(personnelData: Partial<Personnel>): Promise<Personnel> {
    this.logger.log('Creating a new personnel.');
    try {
      const personnel = this.personnelRepository.create(personnelData);
      const savedPersonnel = await this.personnelRepository.save(personnel);
      this.logger.debug(`Created personnel with ID ${savedPersonnel.id}.`);
      return savedPersonnel;
    } catch (error) {
      this.logger.error('Error creating personnel.', error.stack);
      throw error;
    }
  }

  // Update personnel data with error handling
  async update(
    id: number,
    updatePersonnelData: Partial<Personnel>,
  ): Promise<Personnel> {
    this.logger.log(`Updating personnel with ID ${id}.`);
    try {
      const personnel = await this.personnelRepository.findOne({
        where: { id: Number(id) },
      });
      if (!personnel) {
        this.logger.warn(`Personnel with ID ${id} not found.`);
        throw new NotFoundException(`Personnel with ID ${id} not found`);
      }

      Object.assign(personnel, updatePersonnelData);
      const updatedPersonnel = await this.personnelRepository.save(personnel);
      this.logger.debug(`Updated personnel with ID ${id}.`);
      return updatedPersonnel;
    } catch (error) {
      this.logger.error(`Error updating personnel with ID ${id}.`, error.stack);
      throw error;
    }
  }

  // Delete a personnel and log the operation
  async remove(id: number): Promise<void> {
    this.logger.log(`Deleting personnel with ID ${id}.`);
    try {
      const personnel = await this.personnelRepository.findOne({
        where: { id: Number(id) },
      });
      if (!personnel) {
        this.logger.warn(`Personnel with ID ${id} not found.`);
        throw new NotFoundException(`Personnel with ID ${id} not found`);
      }
      await this.personnelRepository.remove(personnel);
      this.logger.debug(`Deleted personnel with ID ${id}.`);
    } catch (error) {
      this.logger.error(`Error deleting personnel with ID ${id}.`, error.stack);
      throw error;
    }
  }

  // Search personnel by name with enhanced logging
  async findByName(name: string): Promise<Personnel[]> {
    this.logger.log(`Searching for personnel with name like ${name}.`);
    try {
      const personnel = await this.personnelRepository
        .createQueryBuilder('personnel')
        .where('personnel.name LIKE :name', { name: `%${name}%` })
        .getMany();

      this.logger.debug(
        `Found ${personnel.length} personnel matching name ${name}.`,
      );
      return personnel;
    } catch (error) {
      this.logger.error('Error searching personnel by name.', error.stack);
      throw error;
    }
  }

  // Get all commandes related to a specific personnel
  // async findAllCommandesByPersonnel(id : number): Promise<Commande[]> {
  //   this.logger.log(`Retrieving all commandes for personnel with ID ${id}.`);
  //   try {
  //     const personnel = await this.personnelRepository.findOne({
  //       where: { id },
  //       relations: ['commandes'],
  //     });

  //     if (!personnel) {
  //       this.logger.warn(`Personnel with ID ${id} not found.`);
  //       throw new NotFoundException(`Personnel with ID ${id} not found`);
  //     }

  //     const commandes = await this.commandesRepository.find({
  //       where: { personnel: { id } }, // Assuming correct relation in Commande entity
  //       relations: ['client'], // Adjust relations as needed
  //     });

  //     this.logger.debug(
  //       `Found ${commandes.length} commandes for personnel with ID ${id}.`,
  //     );
  //     return commandes;
  //   } catch (error) {
  //     this.logger.error(
  //       `Error retrieving commandes for personnel with ID ${id}.`,
  //       error.stack,
  //     );
  //     throw error;
  //   }
  // }
}
