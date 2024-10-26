import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandeData } from './CommandeTaher.entity';
import { CommandeDataController } from './CommandeTaher.controller';
import { CommandeDataService } from './CommandeTaher.service';

@Module({
  imports: [TypeOrmModule.forFeature([CommandeData])],
  providers: [CommandeDataService],
  controllers: [CommandeDataController],
})
export class CommandeTaherModule {}
