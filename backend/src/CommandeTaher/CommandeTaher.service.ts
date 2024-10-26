import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommandeData } from './CommandeTaher.entity';

@Injectable()
export class CommandeDataService {
  constructor(
    @InjectRepository(CommandeData)
    private readonly commandeDataRepository: Repository<CommandeData>,
  ) {}

  async create(data: {
    commandeData: Partial<CommandeData>[];
  }): Promise<CommandeData[]> {
    const createdEntities: CommandeData[] = [];

    for (const item of data.commandeData) {
      const mappedData: Partial<CommandeData> = {
        typeDeDatteName: item.typeDeDatteName,
        prix: item.prix + 0.2,
        nameDeCoffre: item.nameDeCoffre, // Assuming you want to use typeDeCoffre as coffreId
        quantiteCoffre: Number(item.quantiteCoffre), // Convert to number if necessary
        brut: item.brut,
        net: item.net,
      };

      console.log(
        'Creating new CommandeData with the following mapped data:',
        mappedData,
      );

      const newCommandeData = this.commandeDataRepository.create(mappedData);
      console.log('New CommandeData entity to be saved:', newCommandeData);

      const savedCommandeData =
        await this.commandeDataRepository.save(newCommandeData);
      console.log('Saved CommandeData:', savedCommandeData);

      createdEntities.push(savedCommandeData);
    }

    return createdEntities;
  }
  async findAll(): Promise<CommandeData[]> {
    return await this.commandeDataRepository.find();
  }

  async findOne(id: number): Promise<CommandeData> {
    return await this.commandeDataRepository.findOneBy({ id });
  }

  async update(id: number, data: Partial<CommandeData>): Promise<CommandeData> {
    await this.commandeDataRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.commandeDataRepository.delete(id);
  }
}
