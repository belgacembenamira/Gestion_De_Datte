import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commande } from './Commande.entity';
import { CommandeController } from './Commande.controller';
import { Client } from 'src/Client/Client.entity';
import { Coffre } from 'src/Coffre/Coffre.entity';
import { TypeDeDatteQuantity } from './type-de-datte-quantity.entity';
import { CommandeService } from './Commande.service';
import { Personnel } from 'src/Personnel/PersonneEntity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Commande,
      Client,
      Coffre,
      TypeDeDatteQuantity,
      Personnel,
      // Uncomment if needed
    ]),
  ],
  controllers: [CommandeController],
  providers: [CommandeService], // Make sure this is included
})
export class CommandeModule {}
