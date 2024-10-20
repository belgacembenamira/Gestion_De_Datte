import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Commande } from './Commande.entity';
import { TypeDeDatte } from 'src/TypeDeDatte/TypeDeDatte.entity';

@Entity()
export class TypeDeDatteQuantity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'numeric', precision: 15, scale: 0, nullable: true }) // Change as needed
  quantity: number;
  @Column({ type: 'numeric', nullable: true })
  numberDeCoffre: number;
  @Column({ nullable: true }) // Use this to store the name of TypeDeDatte
  typeDeDatteName: string;

  @Column({ nullable: true }) // Use this to store the name of TypeDeDatte
  date: string;
  @Column({ type: 'numeric', nullable: true })
  prixUnitaireDeDatte: number;
  @ManyToOne(() => Commande, (commande) => commande.typeDeDatteQuantities, {
    onDelete: 'CASCADE',
  }) // Add this option
  commande: Commande; // Correct reference to Commande
  @ManyToOne(
    () => TypeDeDatte,
    (typeDeDatte) => typeDeDatte.typeDeDatteQuantities,
  )
  typeDeDatte: TypeDeDatte; // Ensure this matches your database field
}
