import { ErrorInterceptor } from '@incognito/toolkit/dist/error.interceptor';
import { EventInterceptor } from '@incognito/toolkit/dist/event.interceptor';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotImplementedException,
  Post,
  Req,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ConfigService } from '@/config/config.service';
import { AuthService } from '@/domain/services/auth';

import { ChangeMobileDTO } from './payload/mobile.dto';
import { MobileOtpCodeDTO, RequestMobileOtpDTO } from './payload/otp.dto';

@ApiTags('mobile')
@UseInterceptors(EventInterceptor, ErrorInterceptor)
@Controller('mobile')
export class MobileController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @ApiOperation({ summary: 'Request OTP for mobile verification, not for sign in' })
  @UseGuards(AuthGuard(['user']))
  @HttpCode(200)
  @Post('otp')
  async sendOtp(@Req() req, @Body() body: RequestMobileOtpDTO) {
    const code = await this.authService.generateMobileOtp({
      userId: req.user.id,
      mobile: body.mobile,
      countryCode: body.country_code,
      type: body.type
    });

    await this.sendSms(body.country_code, body.mobile, `Your code ${code}`);

    return {};
  }

  @ApiOperation({ summary: 'Verify mobile using OTP' })
  @UseGuards(AuthGuard(['user']))
  @HttpCode(200)
  @Post('verify')
  async verify(@Req() req, @Body() body: MobileOtpCodeDTO) {
    const { type, code } = body;

    const userId = await this.authService.verifyMobileOtp({ userId: req.user.id, code, type });

    if (!userId) {
      throw new BadRequestException('Incorrect one-time code');
    }

    return {};
  }

  @ApiOperation({ summary: 'Change mobile and send OTP for verification' })
  @HttpCode(200)
  @Post('change')
  async changeMobile(@Body() _body: ChangeMobileDTO) {
    throw new NotImplementedException();
  }

  @ApiOperation({ summary: 'Confirm mobile change' })
  @HttpCode(200)
  @Post('confirm_change')
  async confirmChange() {
    throw new NotImplementedException();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async sendSms(countryCode: string, mobile: string, message: string) {
    // TODO:
  }
}
