import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignupDTO {
  @IsNotEmpty()
  name: string;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  websiteId: number;
}

export class SigninDTO {
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
}
