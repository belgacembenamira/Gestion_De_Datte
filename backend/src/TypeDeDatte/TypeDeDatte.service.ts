// type-de-datte.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeDeDatte } from './TypeDeDatte.entity';

@Injectable()
export class TypeDeDatteService {
  constructor(
    @InjectRepository(TypeDeDatte)
    private typeDeDatteRepository: Repository<TypeDeDatte>,
  ) {}

  findAll(): Promise<TypeDeDatte[]> {
    return this.typeDeDatteRepository.find();
  }

  findOne(id: number): Promise<TypeDeDatte> {
    return this.typeDeDatteRepository.findOneOrFail({ where: { id } });
  }

  create(typeDeDatte: Partial<TypeDeDatte>): Promise<TypeDeDatte> {
    return this.typeDeDatteRepository.save(typeDeDatte);
  }

  async update(
    id: number,
    updateData: Partial<TypeDeDatte>,
  ): Promise<TypeDeDatte> {
    const typeDeDatte = await this.findOne(id);
    Object.assign(typeDeDatte, updateData);
    return this.typeDeDatteRepository.save(typeDeDatte);
  }

  async remove(id: number): Promise<void> {
    const typeDeDatte = await this.findOne(id);
    await this.typeDeDatteRepository.remove(typeDeDatte);
  }
}
