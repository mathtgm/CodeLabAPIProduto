import { IsDefined, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EnviarEmailDto {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @IsEmail()
  to: string | string[];

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @IsEmail()
  subject: string;

  @IsNotEmpty()
  @IsDefined()
  context: any;

  @IsNotEmpty()
  @IsDefined()
  template: string;
}
