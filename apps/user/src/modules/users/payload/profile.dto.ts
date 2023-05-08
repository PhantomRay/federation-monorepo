import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ProfileUpdateDTO {
  @IsNotEmpty()
  @MaxLength(16)
  @IsString()
  name: string;

  @MaxLength(100)
  bio: string;
}
