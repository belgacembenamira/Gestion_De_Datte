import { Client } from 'src/Client/Client.entity';
import { TypeDeDatteQuantity } from 'src/Commande/type-de-datte-quantity.entity';
import { TypeDeDatteQuantityPersonnelle } from 'src/CommandePersonnelle/TypeDeDatteQuantityPersonnelle.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';

@Entity()
export class TypeDeDatte {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true }) // Make name nullable
  name: string;

  @Column({ type: 'numeric', nullable: true })
  prix: number;
  @OneToMany(
    () => TypeDeDatteQuantity,
    (typeDeDatteQuantity) => typeDeDatteQuantity.typeDeDatte,
  )
  @ManyToOne(() => Client, (client) => client.TypeDeDatte)
  client: Client;
  typeDeDatteQuantities: TypeDeDatteQuantity[]; // Ensure thi
  typeDeDatteQuantitiesPersonnelle: TypeDeDatteQuantityPersonnelle[]; // Ensure thi
  // @OneToMany(
  //   () => TypeDeDatteQuantity,
  //   (typeDeDatteQuantity) => typeDeDatteQuantity.typeDeDatte,
  // )
  // typeDeDatteQuantities: TypeDeDatteQuantity[];
}
