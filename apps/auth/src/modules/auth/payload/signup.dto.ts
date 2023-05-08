import { MetaDTO } from '@incognito/toolkit/dist/types/meta.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class SignupDTO {
  @ApiProperty({
    type: String
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String
  })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(64)
  password: string;

  @ApiPropertyOptional({
    type: MetaDTO
  })
  meta?: MetaDTO;
  @ApiPropertyOptional({
    type: String
  })
  captcha_token?: string;
}
