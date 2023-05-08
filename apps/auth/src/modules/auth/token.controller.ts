import { ErrorInterceptor } from '@incognito/toolkit/dist/error.interceptor';
import { EventInterceptor } from '@incognito/toolkit/dist/event.interceptor';
import { getClientIP, parseHeaders } from '@incognito/toolkit/dist/utils';
import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  NotImplementedException,
  Post,
  Req,
  UseInterceptors
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';

import { AuthService } from '@/domain/services/auth';

import { RefreshTokenDTO } from './payload/token.dto';

@ApiTags('auth')
@UseInterceptors(EventInterceptor, ErrorInterceptor)
@Controller()
export class TokenController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Get acess token using refresh token' })
  @HttpCode(200)
  @Post('token')
  async refreshAccessToken(@Req() req, @Body() body: RefreshTokenDTO, @Headers() headers): Promise<any> {
    body = plainToClass(RefreshTokenDTO, body);

    try {
      await validateOrReject(body);
    } catch (err) {
      throw new BadRequestException(err);
    }

    const meta = parseHeaders(headers);
    meta.ip = getClientIP(req);

    return this.authService.refreshAccessToken(body.refresh_token, meta);
  }

  @ApiOperation({ summary: 'used only for webview with limited permissions (scopes)' })
  @HttpCode(200)
  @Post('web_token')
  async webviewToken(@Req() req, @Body() body: RefreshTokenDTO, @Headers() headers): Promise<any> {
    body = plainToClass(RefreshTokenDTO, body);

    try {
      await validateOrReject(body);
    } catch (err) {
      throw new BadRequestException(err);
    }
    const meta = parseHeaders(headers);
    meta.ip = getClientIP(req);

    throw new NotImplementedException();
  }
}
