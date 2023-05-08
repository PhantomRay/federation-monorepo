import { ErrorInterceptor } from '@incognito/toolkit/dist/error.interceptor';
import { EventInterceptor } from '@incognito/toolkit/dist/event.interceptor';
import { Controller, Get, HttpCode, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserService } from '@/domain/services/user';

@ApiTags('user')
@UseInterceptors(EventInterceptor, ErrorInterceptor)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get user detail' })
  @UseGuards(AuthGuard(['user']))
  @HttpCode(200)
  @Get('')
  async getUser(@Req() req): Promise<any> {
    // TODO: filter user data
    return await this.userService.getUserById(req.user.id);
  }
}
