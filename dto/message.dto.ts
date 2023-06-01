import { IsEmail, IsNotEmpty } from 'class-validator';

export class MessageDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  websiteId: number;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}
