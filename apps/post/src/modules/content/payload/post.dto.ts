import { IsNotEmpty, IsString } from 'class-validator';

export class PostCreateDTO {
  @IsString()
  title?: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
