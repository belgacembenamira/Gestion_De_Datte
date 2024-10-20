import { Coffre } from 'src/Coffre/Coffre.entity';
import { Commande } from 'src/Commande/Commande.entity';
import { TypeDeDatte } from 'src/TypeDeDatte/TypeDeDatte.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
  @OneToMany(() => Coffre, (coffre) => coffre.client) // Adjust as needed
  coffres: Coffre[];
  @OneToMany(() => Commande, (commande) => commande.client)
  commandes: Commande[];
  @OneToMany(() => TypeDeDatte, (TypeDeDatte) => TypeDeDatte.client)
  TypeDeDatte: TypeDeDatte[];
  @Column({ type: 'numeric', nullable: true }) // Add this line for the montant field
  montantDonner: number;
}
