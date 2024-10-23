import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from 'typeorm';
import { Coffre } from 'src/Coffre/Coffre.entity';
import { Commande } from 'src/Commande/Commande.entity';

@Entity()
export class Personnel {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', nullable: true })
  name: string;
  // Remove @Column() here and just keep @OneToMany
  @OneToMany(() => Commande, (commande) => commande.personnel, {
    nullable: true,
  })
  commandes: Commande[];

  @OneToMany(() => Coffre, (coffre) => coffre.Personnel, {
    nullable: true,
  })
  Coffres: Coffre[];
}
