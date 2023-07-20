import { ErrorInterceptor } from '@incognito/toolkit/dist/error.interceptor';
import { EventInterceptor } from '@incognito/toolkit/dist/event.interceptor';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotImplementedException,
  Post,
  Redirect,
  Req,
  UseInterceptors
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';

import { AuthService } from '@/domain/services/auth';

import { EmailOtpCodeDTO, EmailOtpTokenDTO, RequestEmailOtpDTO } from './payload/otp.dto';

@ApiTags('email')
@UseInterceptors(EventInterceptor, ErrorInterceptor)
@Controller('email')
export class EmailController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'request OTP via email' })
  @HttpCode(200)
  @Post('otp')
  async sendOtp(@Req() req, @Body() body: RequestEmailOtpDTO) {
    const _data = await this.authService.generateEmailOtp({ email: body.email, type: body.type });

    if (_data?.code) {
      // TODO: send email
    }

    // always return empty object
    return {};
  }

  @ApiOperation({ summary: 'verify otp code/token' })
  @HttpCode(200)
  @Post('otp/verify')
  async verifyEmailOtp(@Body() body: EmailOtpCodeDTO | EmailOtpTokenDTO): Promise<void | {
    access_token: string;
    refresh_token: string;
  }> {
    if ((body as EmailOtpCodeDTO).code) {
      body = plainToClass(EmailOtpCodeDTO, body);
    } else {
      body = plainToClass(EmailOtpTokenDTO, body);
    }

    try {
      await validateOrReject(body);
    } catch (err) {
      throw new BadRequestException(err);
    }

    const { email, code, meta, type, redirect_to } = body as EmailOtpCodeDTO;
    const { token } = body as EmailOtpTokenDTO;

    const userId = await this.authService.verifyEmailOtp({ email, code, token, type });

    if (!userId) {
      throw new BadRequestException('Incorrect one-time code/token');
    }

    if (['signup', 'signin', 'invite', 'magiclink'].includes(type) || redirect_to) {
      const userToken = await this.authService.createUserToken({
        id: userId,
        meta
      });
      // TODO: place token etc in redirect url

      if (redirect_to) {
        const url =
          redirect_to + '#access_token=' + userToken.access_token + '&refresh_token=' + userToken.refresh_token;
        // redirect to url with token
        Redirect(url, 302);
      }

      return {
        access_token: userToken.access_token,
        refresh_token: userToken.refresh_token
      };
    }
  }

  @ApiOperation({ summary: 'Change email and send out verification email to new address for confirmation' })
  @HttpCode(200)
  @Post('change')
  async changeEmail() {
    throw new NotImplementedException();
  }

  @ApiOperation({ summary: 'Confirm email change' })
  @HttpCode(200)
  @Post('confirm_change')
  async confirmChange() {
    throw new NotImplementedException();
  }
}
