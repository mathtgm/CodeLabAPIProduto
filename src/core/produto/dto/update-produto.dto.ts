import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty } from 'class-validator';
import { EMensagem } from '../../../shared/enums/mensagem.enum';
import { CreateProdutoDto } from './create-produto.dto';

export class UpdateProdutoDto extends PartialType(CreateProdutoDto) {
  @IsNotEmpty({ message: `ID ${EMensagem.DeveSerInformado}` })
  id: number;
}
