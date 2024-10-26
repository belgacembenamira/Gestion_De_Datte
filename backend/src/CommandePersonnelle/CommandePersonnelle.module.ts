import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Personnel } from 'src/Personnel/PersonneEntity.entity';
import { TypeDeDatteQuantityPersonnelle } from './TypeDeDatteQuantityPersonnelle.entity';
import { CommandePersonnelle } from './CommandePersonnelle.entity';
import { Coffre } from 'src/Coffre/Coffre.entity';
import { Commande } from 'src/Commande/Commande.entity';
import { CommandePersonnelleController } from './CommandePersonnelle.controller';
import { CommandePersonnelleService } from './CommandePersonnelle.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommandePersonnelle,
      Personnel,
      Coffre,
      TypeDeDatteQuantityPersonnelle,
      // Uncomment if needed
      Personnel,
    ]),
  ],
  controllers: [CommandePersonnelleController],
  providers: [CommandePersonnelleService], // Make sure this is included
})
export class CommandePersonnelleModule {}
