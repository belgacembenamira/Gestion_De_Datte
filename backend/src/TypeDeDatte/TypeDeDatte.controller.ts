import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { TypeDeDatte } from './TypeDeDatte.entity';
import { TypeDeDatteService } from './TypeDeDatte.service';

@Controller('types-de-dattes')
export class TypeDeDatteController {
  constructor(private readonly typeDeDatteService: TypeDeDatteService) {}

  @Get()
  findAll(): Promise<TypeDeDatte[]> {
    return this.typeDeDatteService.findAll();
  }

  @Post()
  create(@Body() typeDeDatte: TypeDeDatte): Promise<TypeDeDatte> {
    return this.typeDeDatteService.create(typeDeDatte);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() typeDeDatte: Partial<TypeDeDatte>,
  ): Promise<TypeDeDatte> {
    return this.typeDeDatteService.update(id, typeDeDatte);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.typeDeDatteService.remove(id);
  }
}
