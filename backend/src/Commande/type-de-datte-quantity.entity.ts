import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Commande } from './Commande.entity';
import { TypeDeDatte } from 'src/TypeDeDatte/TypeDeDatte.entity';

@Entity()
export class TypeDeDatteQuantity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true }) // Changed to scale 2 for decimal
  quantitynet: number;

  @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true }) // Changed to scale 2 for decimal
  quantitybrut: number;

  @Column({ type: 'varchar', nullable: true }) // Changed to varchar to match the string type
  numberDeCoffre: string;

  @Column({ nullable: true }) // Use this to store the name of TypeDeDatte
  typeDeDatteName: string;

  @Column({ nullable: true }) // Store the date
  date: string;

  @Column({ type: 'numeric', nullable: true })
  prixUnitaireDeDatte: number;

  @ManyToOne(() => Commande, (commande) => commande.typeDeDatteQuantities, {
    onDelete: 'CASCADE',
  })
  commande: Commande;

  @ManyToOne(
    () => TypeDeDatte,
    (typeDeDatte) => typeDeDatte.typeDeDatteQuantities,
  )
  typeDeDatte: TypeDeDatte;
}
