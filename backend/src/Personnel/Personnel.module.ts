import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonnelService } from './personnel.service';
import { PersonnelController } from './Personnel.controller';
import { CommandeModule } from 'src/Commande/Commande.module'; // Make sure CommandeModule is imported if needed
import { Commande } from 'src/Commande/Commande.entity';
import { Coffre } from 'src/Coffre/Coffre.entity';
import { Personnel } from './PersonneEntity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Personnel, Commande, Coffre])],
  providers: [PersonnelService],
  controllers: [PersonnelController],
})
export class PersonnelModule {}
