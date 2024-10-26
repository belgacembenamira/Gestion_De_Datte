// src/commande/dto/create-commande.dto.ts

import { IsNumber, IsString } from 'class-validator';

export class CreateCommandeDto {
  @IsNumber()
  typeDeDatteId: number;

  @IsString()
  typeDeDatteName: string;

  @IsNumber()
  qty: number;

  @IsNumber()
  prix: number;

  @IsString()
  coffreId: string;

  @IsNumber()
  quantiteCoffre: number;

  @IsNumber()
  brut: number;
}
