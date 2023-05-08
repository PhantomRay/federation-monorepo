import { IsNotEmpty, Matches } from 'class-validator';

export class ChangeMobileDTO {
  @IsNotEmpty()
  @Matches(/^\d{1,4}$/, {
    message: 'Invalid country code'
  })
  country_code: string;

  @IsNotEmpty()
  @Matches(/\d{8,}/, {
    message: 'Invalid mobile'
  })
  mobile: string;

  password: string;
}
