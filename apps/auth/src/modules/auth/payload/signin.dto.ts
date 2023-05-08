import { MetaDTO } from '@incognito/toolkit/dist/types/meta.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';

export type SignInDTO = UsernameSignInDTO | EmailSignInDTO | MobileSignInDTO;

export class BaseSignInDTO {
  @ApiProperty({
    type: String
  })
  @IsNotEmpty()
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

export class UsernameSignInDTO extends BaseSignInDTO {
  @ApiProperty({
    type: String
  })
  @IsNotEmpty()
  username: string;
}

export class EmailSignInDTO extends BaseSignInDTO {
  @ApiProperty({
    type: String
  })
  @IsNotEmpty()
  email: string;
}

/**
 * Not in use for now
 */
export class MobileSignInDTO extends BaseSignInDTO {
  @ApiProperty({
    type: String
  })
  @IsNotEmpty()
  @Matches(/^\d{1,4}$/, {
    message: 'Invalid country code'
  })
  country_code: string;

  @ApiProperty({
    type: String
  })
  @IsNotEmpty()
  @Matches(/\d{8,}/, {
    message: 'Invalid mobile number'
  })
  mobile: string;
}
