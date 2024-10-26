import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommandeDataF } from './CommandeF.entity';

@Injectable()
export class CommandeDataService {
  constructor(
    @InjectRepository(CommandeDataF)
    private readonly commandeDataRepository: Repository<CommandeDataF>,
  ) {}

  async create(data: {
    commandeData: Partial<CommandeDataF>[];
  }): Promise<CommandeDataF[]> {
    const createdEntities: CommandeDataF[] = [];

    for (const item of data.commandeData) {
      const mappedData: Partial<CommandeDataF> = {
        typeDeDatteName: item.typeDeDatteName,
        prix: item.prix + 0.2, // Assuming this is the intended logic
        nameDeCoffre: item.nameDeCoffre,
        quantiteCoffre: Number(item.quantiteCoffre),
        brut: item.brut,
        net: item.net,
        clientName: item.clientName, // Ensure clientName is set from the request
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
  async findAll(): Promise<CommandeDataF[]> {
    return await this.commandeDataRepository.find();
  }

  async findOne(id: number): Promise<CommandeDataF> {
    return await this.commandeDataRepository.findOneBy({ id });
  }

  async update(
    id: number,
    data: Partial<CommandeDataF>,
  ): Promise<CommandeDataF> {
    await this.commandeDataRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.commandeDataRepository.delete(id);
  }
}
