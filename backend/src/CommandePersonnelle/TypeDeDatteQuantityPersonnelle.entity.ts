import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CommandePersonnelle } from './CommandePersonnelle.entity'; // Import the CommandePersonnelle entity
import { TypeDeDatte } from 'src/TypeDeDatte/TypeDeDatte.entity';

@Entity('TypeDeDatteQuantityPersonnelle')
export class TypeDeDatteQuantityPersonnelle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true }) // Decimal with scale 2
  quantitynet: number;

  @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true }) // Decimal with scale 2
  quantitybrut: number;

  @Column({ type: 'varchar', length: 255, nullable: true }) // Ensure it stores the string type for coffre number
  numberDeCoffre: string;

  @Column({ type: 'varchar', length: 255, nullable: true }) // Store the name of TypeDeDatte
  typeDeDatteName: string;

  @Column({ type: 'date', nullable: true }) // Store the date in a proper date format
  date: string;

  @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true }) // Decimal for unit price of dates
  prixUnitaireDeDatte: number;

  CommandePersonnelle: CommandePersonnelle;
  @ManyToOne(
    () => TypeDeDatte,
    (typeDeDatte) => typeDeDatte.typeDeDatteQuantitiesPersonnelle,
  )
  typeDeDatte: TypeDeDatte;
}
