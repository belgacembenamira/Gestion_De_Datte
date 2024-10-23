import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commande } from 'src/Commande/Commande.entity';
import { Logger } from '@nestjs/common';
import { Personnel } from './PersonneEntity.entity';

@Injectable()
export class PersonnelService {
  private readonly logger = new Logger(PersonnelService.name);

  constructor(
    @InjectRepository(Personnel)
    private personnelRepository: Repository<Personnel>,

    @InjectRepository(Commande)
    private commandesRepository: Repository<Commande>,
  ) {}

  // Retrieve all personnel
  async findAll(): Promise<Personnel[]> {
    this.logger.log('Retrieving all personnel.');
    try {
      const personnel: Personnel[] = await this.personnelRepository.find();
      this.logger.debug(`Found ${personnel.length} personnel.`);
      return personnel;
    } catch (error) {
      this.logger.error('Error retrieving personnel.', error.stack);
      throw new Error('Could not retrieve personnel. Please try again later.');
    }
  }

  // Retrieve a personnel by ID
  async findOne(id: string): Promise<Personnel> {
    this.logger.log(`Retrieving personnel with ID ${id}.`);
    try {
      const personnel = await this.personnelRepository.findOne({
        where: { id: Number(id) },
        relations: ['commandes'], // Load related commandes
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

  // Create a new personnel
  async create(personnelData: Personnel): Promise<Personnel> {
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

  // Update personnel data
  async update(
    id: string,
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

  // Delete a personnel
  async remove(id: string): Promise<void> {
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

  // Search personnel by name
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

  // Retrieve all personnel with their associated commandes
  async findAllWithCommandes(): Promise<Personnel[]> {
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

  // Add this method if it exists in your controller
  async findAllWithCommandesAndCoffres(): Promise<Personnel[]> {
    this.logger.log('Retrieving all personnel with commandes and coffres.');
    // Logic to retrieve personnel with commandes and coffres goes here
    return this.findAllWithCommandes(); // Placeholder, replace with actual logic
  }

  // Add other methods as needed...
}
