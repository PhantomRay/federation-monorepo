import { ApiPropertyOptional } from '@nestjs/swagger';

export class SecurityMeasure {
  @ApiPropertyOptional({
    type: String
  })
  code_challenge_method: string;

  @ApiPropertyOptional({
    type: String
  })
  code_challenge: string;

  @ApiPropertyOptional({
    type: String
  })
  captcha_token: string;
}
