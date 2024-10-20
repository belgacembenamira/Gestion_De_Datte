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
  findOne(@Param('id', new ParseUUIDPipe({ version: '7' })) id: number) {
    if (!this.isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    return this.personnelService.findOne(id);
  }

  private isUUID(id: number): boolean {
    // Regex to check if the ID is a valid UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id.toString());
  }

  // Create a new personnel
  @Post('/create')
  create(@Body() personnel: Partial<Personnel>): Promise<Personnel> {
    return this.personnelService.create(personnel);
  }

  // Update a personnel by ID
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() personnel: Partial<Personnel>,
  ): Promise<Personnel> {
    return this.personnelService.update(id, personnel);
  }

  // Delete a personnel by ID
  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.personnelService.remove(id);
  }

  // Search personnel by name
  @Get('search/:name')
  async searchPersonnelByName(@Param('name') name: string) {
    return this.personnelService.findByName(name);
  }

  // Get all orders for a specific personnel
  // @Get(':id/commandes')
  // findAllCommandesByPersonnel(@Param('id') id :number): Promise<Commande[]> {
  //   return this.personnelService.findAllCommandesByPersonnel(id);
  // }
  @Get('/with-commandes-and-coffres')
  async findAllWithCommandesAndCoffres() {
    return this.personnelService.findAllWithCommandesAndCoffres();
  }
  @Get('with-commandes')
  async getAllPersonnelWithCommandes(@Res() res) {
    try {
      const personnelWithCommandes =
        await this.personnelService.findAllPersonnelWithCommandes();
      return res.status(HttpStatus.OK).json(personnelWithCommandes);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Could not retrieve personnel with commandes',
      });
    }
  }
}
