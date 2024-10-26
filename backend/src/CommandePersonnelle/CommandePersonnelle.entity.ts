import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Coffre } from 'src/Coffre/Coffre.entity';

@Entity('CommandePersonnelle')
export class CommandePersonnelle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', nullable: true })
  date: string;

  @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true })
  prix: number;

  @Column({ nullable: true })
  personnelsName: string;

  @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true })
  quantitynet: number;

  @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true })
  quantitybrut: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  numberDeCoffre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  typeDeDatteName: string;

  @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true })
  prixUnitaireDeDatte: number;

  @ManyToOne(() => Coffre, (coffre) => coffre.CommandePersonnelle, {
    nullable: true,
  })
  coffre: Coffre; // Updated to ManyToOne relation
}
