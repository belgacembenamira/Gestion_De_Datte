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
import { CommandeDataF } from './CommandeF.entity';
import { CommandeDataService } from './CommandeF.service';

@Controller('commandeF')
export class CommandeDataController {
  constructor(private readonly commandeDataService: CommandeDataService) {}

  @Post()
  async create(
    @Body() data: { commandeData: Partial<CommandeDataF>[] },
  ): Promise<CommandeDataF[]> {
    console.log('Received data for creating CommandeData:', data);
    return this.commandeDataService.create(data);
  }
  @Get()
  async findAll(): Promise<CommandeDataF[]> {
    return this.commandeDataService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<CommandeDataF> {
    return this.commandeDataService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() data: Partial<CommandeDataF>,
  ): Promise<CommandeDataF> {
    return this.commandeDataService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.commandeDataService.remove(id);
  }
}
