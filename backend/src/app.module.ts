import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientModule } from './Client/Client.module';
import { CommandeModule } from './Commande/Commande.module';
import { TypeDeDatteModule } from './TypeDeDatte/TypeDeDatte.module';
import { CoffreModule } from './Coffre/Coffre.module';

// Charger les variables d'environnement
import { config } from 'dotenv';
import { Commande } from './Commande/Commande.entity';
import { Client } from './Client/Client.entity';
import { Coffre } from './Coffre/Coffre.entity';
import { TypeDeDatte } from './TypeDeDatte/TypeDeDatte.entity';

import { Personnel } from './Personnel/PersonneEntity.entity';
import { PersonnelModule } from './Personnel/Personnel.module';
import { TypeDeDatteQuantity } from './Commande/type-de-datte-quantity.entity';
import { CommandeTaherModule } from './CommandeTaher/CommandeTaher.module';
import { CommandeData } from './CommandeTaher/CommandeTaher.entity';
import { CommandePersonnelle } from './CommandePersonnelle/CommandePersonnelle.entity';
import { CommandePersonnelleModule } from './CommandePersonnelle/CommandePersonnelle.module';
import { CommandeFModule } from './CommandeF/CommandeF.module';
import { CommandeDataF } from './CommandeF/CommandeF.entity';
config(); // Charge le fichier .env

@Module({
  imports: [
    CommandeFModule,

    CommandePersonnelleModule,

    CommandeTaherModule,

    TypeOrmModule.forRoot({
      type: 'postgres', // Type de base de données
      host: process.env.DB_HOST || 'localhost', // Hôte
      port: parseInt(process.env.DB_PORT) || 5432, // Port
      username: process.env.DB_USERNAME || 'postgres', // Nom d'utilisateur
      password: process.env.DB_PASSWORD || '0000', // Mot de passe
      database: process.env.DB_DATABASE || 'datte', // Nom de la base de données
      synchronize: true, // Synchroniser automatiquement les entités (ne pas utiliser en production)
      logging: true, // Activer la journalisation des requêtes SQL
      entities: [
        Personnel,
        __dirname + '/**/*.entity{.ts,.js}',
        Commande,
        Client,
        Coffre,
        TypeDeDatte,
        TypeDeDatteQuantity,
        CommandeData,
        CommandePersonnelle,
        CommandeDataF,
      ], // Charger toutes les entités dans votre projet
    }),
    // Les modules de votre application
    ClientModule,
    CommandeModule,
    PersonnelModule,
    TypeDeDatteModule,
    CoffreModule,
    CommandeTaherModule,
    CommandePersonnelleModule,
    CommandeFModule,
  ],
  controllers: [AppController], // Contrôleurs
  providers: [AppService], // Services
})
export class AppModule {}
