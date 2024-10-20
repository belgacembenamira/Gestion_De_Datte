// coffres.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coffre } from './coffre.entity';

@Injectable()
export class CoffresService {
  constructor(
    @InjectRepository(Coffre)
    private coffresRepository: Repository<Coffre>,
  ) {}

  // Récupérer tous les coffres
  async findAll(): Promise<Coffre[]> {
    return this.coffresRepository.find({ relations: ['client'] });
  }

  // Récupérer un coffre par ID
  async findOne(id: string): Promise<Coffre> {
    const coffre = await this.coffresRepository.findOne({
      where: { id: Number(id) },
      relations: ['client'], // Include relations here if needed
    });
    if (!coffre) {
      throw new NotFoundException(`Coffre with ID ${id} not found`);
    }
    return coffre;
  }

  // Créer un nouveau coffre
  async create(coffreData: Partial<Coffre>): Promise<Coffre> {
    const newCoffre = this.coffresRepository.create(coffreData); // Use create method to instantiate the entity
    return this.coffresRepository.save(newCoffre);
  }

  // Mettre à jour un coffre (PATCH)
  async update(id: string, updateCoffreData: Partial<Coffre>): Promise<Coffre> {
    const coffre = await this.findOne(id); // Reuse findOne method for error handling
    Object.assign(coffre, updateCoffreData);
    return this.coffresRepository.save(coffre);
  }

  // Supprimer un coffre
  async remove(id: string): Promise<void> {
    const coffre = await this.findOne(id); // Reuse findOne method for error handling
    await this.coffresRepository.remove(coffre);
  }
}
