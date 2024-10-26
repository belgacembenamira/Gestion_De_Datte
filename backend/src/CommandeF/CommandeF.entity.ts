import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('CommandeDataF')
export class CommandeDataF {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  typeDeDatteName: string;
  @Column({ type: 'varchar', length: 255, nullable: true })
  clientName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  prix: number;

  @Column({ type: 'varchar', nullable: true }) // Assuming coffreId is a string type
  nameDeCoffre: string;

  @Column({ type: 'int', nullable: true })
  quantiteCoffre: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  brut: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  net: number;
}
