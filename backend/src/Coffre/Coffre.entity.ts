import { Client } from 'src/Client/Client.entity';
import { Commande } from 'src/Commande/Commande.entity';
import { Personnel } from 'src/Personnel/PersonneEntity.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Coffre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true }) // Making the TypeCoffre column nullable
  TypeCoffre: string;

  @Column({ type: 'numeric', nullable: true })
  PoidsCoffre: number;

  @ManyToOne(() => Commande, (commande) => commande.coffres, {
    nullable: true, // Making the relationship nullable
    onDelete: 'CASCADE', // Ensure cascading delete is set
  })
  commande: Commande;

  @ManyToOne(() => Client, (client) => client.coffres, { nullable: true }) // Making the relationship nullable
  client: Client;
  @ManyToOne(() => Personnel, (Personnel) => Personnel.Coffres, {
    nullable: true,
  }) // Making the relationship nullable
  Personnel: Personnel;
}
