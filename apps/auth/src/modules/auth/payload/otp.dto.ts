import { MetaDTO } from '@incognito/toolkit/dist/types/meta.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsIn, IsNotEmpty, Matches } from 'class-validator';

import { EmailOtpType, MobileOtpType } from '@/types/types';

import { SecurityMeasure } from './security.dto';

/**
 * otp code for verification
 */
export class EmailOtpCodeDTO {
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
  code: string;

  @ApiProperty({
    type: String
  })
  @IsNotEmpty()
  type: EmailOtpType;

  @ApiPropertyOptional({
    type: String
  })
  redirect_to?: string;

  @ApiPropertyOptional({
    type: MetaDTO
  })
  meta?: MetaDTO;
}

/**
 * otp token for verification
 */
export class EmailOtpTokenDTO {
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
  token: string;

  @ApiProperty({
    type: String
  })
  @IsNotEmpty()
  type: EmailOtpType;

  @ApiPropertyOptional({
    type: String
  })
  redirect_to?: string;

  @ApiPropertyOptional({
    type: MetaDTO
  })
  meta?: MetaDTO;
}

/**
 * request otp via email
 */
export class RequestEmailOtpDTO {
  @ApiProperty({
    type: String
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String
  })
  @IsIn(['signup', 'signin', 'invite', 'magiclink', 'email_change'])
  type: EmailOtpType;

  @ApiPropertyOptional({
    type: SecurityMeasure
  })
  @Type(() => SecurityMeasure)
  security?: SecurityMeasure;
}

/**
 * request otp via email
 */
export class RequestMobileOtpDTO {
  @ApiProperty({
    type: String
  })
  @IsNotEmpty()
  @Matches(/^\d{1,4}$/, {
    message: '国家区号代码为数字'
  })
  country_code: string;

  @ApiProperty({
    type: String
  })
  @IsNotEmpty()
  @Matches(/\d{8,}/, {
    message: '错误的手机号码' // TODO: 根据国家区号验证
  })
  mobile: string;

  @ApiProperty({
    type: String
  })
  @IsIn(['verify', 'mobile_change'])
  type: MobileOtpType;

  @ApiPropertyOptional({
    type: SecurityMeasure
  })
  @Type(() => SecurityMeasure)
  security?: SecurityMeasure;
}

/**
 * otp code for verification
 */
export class MobileOtpCodeDTO {
  @ApiProperty({
    type: String
  })
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    type: String
  })
  @IsIn(['verify', 'mobile_change'])
  type: MobileOtpType;

  @ApiPropertyOptional({
    type: SecurityMeasure
  })
  @Type(() => SecurityMeasure)
  security?: SecurityMeasure;
}
