import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeDeDatteController } from './TypeDeDatte.controller';
import { TypeDeDatteService } from './TypeDeDatte.service';
import { TypeDeDatte } from './TypeDeDatte.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TypeDeDatte])],
  providers: [TypeDeDatteService],
  controllers: [TypeDeDatteController],
})
export class TypeDeDatteModule {}
