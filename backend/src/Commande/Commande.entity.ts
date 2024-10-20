import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { TypeDeDatteQuantity } from './type-de-datte-quantity.entity';
import { Client } from 'src/Client/Client.entity';
import { Coffre } from 'src/Coffre/Coffre.entity';
import { Personnel } from 'src/Personnel/PersonneEntity.entity';
import { Delete, Param } from '@nestjs/common';

@Entity()
export class Commande {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true }) // Made nullable
  date: string;

  @Column({ type: 'numeric', nullable: true }) // Change to 'numeric'
  qty: number;
  commandeService: any;

  @Column({ type: 'numeric', nullable: true })
  prix: number;
  // @Column({ nullable: true }) // Made nullable
  // typdedatte: string;
  // @Column({ nullable: true }) // Made nullable
  // prixTypeDeDatte: number;
  @ManyToOne(() => Client, (client) => client.commandes, {
    cascade: true,
    nullable: true,
  }) // Made nullable
  client: Client;

  @ManyToOne(() => Personnel, (personnel) => personnel.commandes, {
    cascade: true,
    nullable: true, // Made nullable
  })
  personnel: Personnel;

  @OneToMany(() => Coffre, (coffre) => coffre.commande)
  @JoinTable()
  coffres: Coffre[];

  @OneToMany(
    () => TypeDeDatteQuantity,
    (typeDeDatteQuantity) => typeDeDatteQuantity.commande,
    { cascade: true, nullable: true }, // Made nullable
  )
  @JoinTable()
  typeDeDatteQuantities: TypeDeDatteQuantity[];
}
