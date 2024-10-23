import {
  Controller,
  Get,
  Param,
  Body,
  Patch,
  Post,
  Delete,
  HttpStatus,
  Res,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PersonnelService } from './personnel.service';
import { Commande } from 'src/Commande/Commande.entity';
import { Personnel } from './PersonneEntity.entity';

@Controller('personnels')
export class PersonnelController {
  constructor(private readonly personnelService: PersonnelService) {}

  // Retrieve all personnel
  @Get()
  findAll(): Promise<Personnel[]> {
    return this.personnelService.findAll();
  }

  // Retrieve a personnel by ID
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.personnelService.findOne(id);
  }

  // Create a new personnel
  @Post('/create')
  create(@Body() personnel: Personnel): Promise<Personnel> {
    return this.personnelService.create(personnel);
  }

  // Update a personnel by ID
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() personnel: Partial<Personnel>,
  ): Promise<Personnel> {
    return this.personnelService.update(id, personnel);
  }

  // Delete a personnel by ID
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.personnelService.remove(id);
  }

  // Search personnel by name
  @Get('search/:name')
  async searchPersonnelByName(@Param('name') name: string) {
    return this.personnelService.findByName(name);
  }


  // Get all personnel with commandes
  @Get('/with-commandes')
  async getAllPersonnelWithCommandes(@Res() res) {
    try {
      const personnelWithCommandes = await this.personnelService.findAllWithCommandes();
      return res.status(HttpStatus.OK).json(personnelWithCommandes);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Could not retrieve personnel with commandes',
      });
    }
  }
}
