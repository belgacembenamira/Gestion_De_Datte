import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Patch,
} from '@nestjs/common';
import { CommandeData } from './CommandeTaher.entity';
import { CommandeDataService } from './CommandeTaher.service';

@Controller('commande-data')
export class CommandeDataController {
  constructor(private readonly commandeDataService: CommandeDataService) {}

  @Post()
  async create(
    @Body() data: { commandeData: Partial<CommandeData>[] },
  ): Promise<CommandeData[]> {
    console.log('Received data for creating CommandeData:', data);
    return this.commandeDataService.create(data);
  }
  @Get()
  async findAll(): Promise<CommandeData[]> {
    return this.commandeDataService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<CommandeData> {
    return this.commandeDataService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() data: Partial<CommandeData>,
  ): Promise<CommandeData> {
    return this.commandeDataService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.commandeDataService.remove(id);
  }
}
