import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DeactivateDTO {
  @ApiProperty({
    type: String
  })
  @IsNotEmpty()
  password: string;
}
