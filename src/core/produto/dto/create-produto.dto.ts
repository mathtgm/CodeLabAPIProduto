import { Type } from 'class-transformer';
import { IsArray, IsBase64, IsNotEmpty, MaxLength } from 'class-validator';
import { EMensagem } from '../../../shared/enums/mensagem.enum';

export class CreateProdutoDto {
  @IsNotEmpty({ message: `descricao ${EMensagem.NaoPodeSerVazio}` })
  @MaxLength(100, {
    message: `descricao  ${EMensagem.MaisCaracteresPermitido}`,
  })
  descricao: string;

  @IsNotEmpty({ message: `precoCusto ${EMensagem.NaoPodeSerVazio}` })
  precoCusto: string;

  @IsNotEmpty({ message: `precoVenda ${EMensagem.NaoPodeSerVazio}` })
  precoVenda: string;

  @IsBase64()
  imagem: string | null | undefined;

  @IsNotEmpty({ message: `ativo ${EMensagem.NaoPodeSerVazio}` })
  ativo: boolean;

  @IsArray({ message: `codigoBarras ${EMensagem.NaoValido}` })
  @Type(() => Number)
  codigoBarras: string[];
}
