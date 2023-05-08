import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshTokenDTO {
  @ApiProperty({
    type: String
  })
  @IsNotEmpty()
  refresh_token: string;
}
