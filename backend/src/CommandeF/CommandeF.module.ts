import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandeDataF } from './CommandeF.entity';
import { CommandeDataController } from './CommandeF.controller';
import { CommandeDataService } from './CommandeF.service';

@Module({
  imports: [TypeOrmModule.forFeature([CommandeDataF])],
  providers: [CommandeDataService],
  controllers: [CommandeDataController],
})
export class CommandeFModule {}
