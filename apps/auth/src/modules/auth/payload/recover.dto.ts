import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

/**
 * recover password
 */
export class RecoverDTO {
  @ApiProperty({
    type: String
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    type: String
  })
  code_challenge?: string;
  @ApiPropertyOptional({
    type: String
  })
  code_challenge_method?: string;
  @ApiPropertyOptional({
    type: String
  })
  captcha_token?: string;
}
