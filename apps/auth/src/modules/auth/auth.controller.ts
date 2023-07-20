import { getClientIP, parseHeaders } from '@incognito/toolkit/dist/utils';
import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Get,
  Post,
  Req,
  UseGuards,
  Query,
  NotImplementedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from '@/domain/services/auth';

import { DeactivateDTO } from './payload/deactivate.dto';
import { RecoverDTO } from './payload/recover.dto';
import { EmailSignInDTO } from './payload/signin.dto';
import { SignupDTO } from './payload/signup.dto';
import { VerifyLinkType } from './payload/verify.dto';

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Sign up using email/password' })
  @HttpCode(200)
  @Post('signup')
  async signup(
    @Req() req,
    @Body() body: SignupDTO
  ): Promise<{
    email: string;
    id: string;
  }> {
    const { email, password } = body;

    const user = await this.authService.signnup({ email, password });

    // TODO: send otp to email

    return {
      email: user.email,
      id: user.id
    };
  }

  @ApiOperation({ summary: 'Sign in using email/password' })
  @HttpCode(200)
  @Post('signin')
  async signin(@Req() req, @Body() body: EmailSignInDTO, @Headers() headers): Promise<any> {
    body.meta = parseHeaders(headers);
    body.meta.ip = getClientIP(req);

    const res: any = await this.authService.signin({
      email: body.email,
      password: body.password,
      meta: body.meta
    });

    return res;
  }

  @ApiOperation({ summary: 'User signs out' })
  @HttpCode(200)
  @Post('signout')
  @UseGuards(AuthGuard(['user'])) // TODO: use guard?
  async signout(@Req() req) {
    if (req.user && req.user.jti) this.authService.signout(req.user.jti); // async

    // always return success
  }

  @ApiOperation({ summary: 'Recover password via email' })
  @HttpCode(200)
  @Post('recover')
  async recover(@Req() _req, @Body() _body: RecoverDTO) {
    // TODO:
  }

  /**
   *
   * @param token
   * @param type
   * @param redirect_to
   * @returns https://example.com/#access_token=...&refresh_token=...&expires_in=...
   */
  @ApiOperation({
    summary: 'Verify one-time token through link',
    description: 'Returns https://example.com/#access_token=...&refresh_token=...&expires_in=...'
  })
  @HttpCode(302)
  @Get('verify')
  async verifyLink(@Query() _token: string, @Query() _type: VerifyLinkType, @Query() _redirect_to: string) {
    // TODO:
  }

  @ApiOperation({ description: 'Verify one-time token' })
  @Post('verify')
  async verifyOtt() {
    throw new NotImplementedException();
  }

  @Post('magiclink')
  async magicLink() {
    throw new NotImplementedException();
  }

  @ApiOperation({ summary: 'Deactivate account' })
  @UseGuards(AuthGuard(['user']))
  @HttpCode(200)
  @Post('deactivate')
  async deactivate(@Req() req, @Body() body: DeactivateDTO) {
    await this.authService.deactivateUser(req.user.id, body.password);
    return {};
  }

  @ApiOperation({ summary: 'Re-activate account during deactivation cooldown period' })
  @UseGuards(AuthGuard(['user']))
  @HttpCode(200)
  @Post('reactivate')
  async reactivate(@Req() req) {
    await this.authService.reactivateUser(req.user.id);
    return {};
  }
}
