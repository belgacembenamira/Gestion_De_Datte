import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './Client.entity';
import { ClientsService } from './Client.service';
import { ClientsController } from './Client.controller';
import { Coffre } from 'src/Coffre/Coffre.entity';
import { Commande } from 'src/Commande/Commande.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Coffre, Commande])],
  providers: [ClientsService],
  controllers: [ClientsController],
})
export class ClientModule {}
