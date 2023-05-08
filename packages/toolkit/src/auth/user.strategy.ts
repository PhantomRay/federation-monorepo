import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { isNumber } from 'lodash';
import { ExtractJwt, JwtPayload, Strategy } from 'passport-jwt';

export class JwtUserInfo {
  id: string;
  jti: string;
  role: string;
}

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET
    });
  }

  validate({ exp, sub, jti, role }: JwtPayload) {
    if (!isNumber(exp) || exp < Date.now() / 1000) {
      throw new UnauthorizedException('Access token expired');
    }

    if (role !== 'user') {
      throw new UnauthorizedException('Not user');
    }

    return {
      id: sub,
      jti,
      role
    };
  }
}
