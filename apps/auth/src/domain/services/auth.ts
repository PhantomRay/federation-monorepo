import { randomBytes } from 'crypto';

import { generateSnowflakeId } from '@incognito/toolkit';
import {
  HttpError307,
  HttpError400,
  HttpError401,
  HttpError403,
  HttpError429
} from '@incognito/toolkit/dist/http.response';
import { MetaDTO } from '@incognito/toolkit/dist/types/meta.dto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import Dayjs from 'dayjs';
import _ from 'lodash';
import ms from 'ms';
import { v4 } from 'uuid';

import { Prisma, User, UserStatus } from '@/.prisma/client';
import { generateOtp, generateSalt, hashOtp, hashPassword } from '@/common/helper';
import { ConfigService } from '@/config/config.service';
import { PrismaService } from '@/services/prisma.service';
import { EmailOtpType, MobileOtpType } from '@/types/types';

export type JWT = {
  sub: string;
  iat: number;
  jti: string;
  exp: number;
  /** user, admin */
  role: string;
  scope?: string;
  deactivated?: boolean;
};

export type UserTokenPayload = {
  access_token: string;
  refresh_token: string;
  sub: string;
  jti: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {}
  async signnup(opts: { email: string; password: string }): Promise<{
    id: string;
    email: string;
    otp: string;
  }> {
    const email = opts.email.trim().toLowerCase();

    let user = await this.prisma.user.findFirst({
      where: {
        email
      }
    });

    if (user) {
      throw new HttpError400('User already exists.');
    }

    // create user
    const salt = generateSalt();
    user = await this.prisma.user.create({
      data: {
        id: generateSnowflakeId(),
        email,
        password_hash: hashPassword(opts.password, salt),
        salt,
        type: 'USER'
      }
    });

    // create otp
    const otp = generateOtp();
    const otpSalt = generateSalt();

    await this.prisma.otp.create({
      data: {
        token: hashOtp(otp, otpSalt),
        salt: otpSalt,
        method: 'EMAIL',
        type: 'signup',
        expire_at: Dayjs().add(this.configService.config.OTP_EXPIRE_IN, 'm').toISOString(),
        user: {
          connect: {
            id: user.id
          }
        }
      }
    });

    return {
      id: user.id,
      email: user.email,
      otp
    };
  }

  /**
   * sign in using email/username with password
   */
  async signin(opts: { email: string; password: string; meta?: MetaDTO }): Promise<any> {
    const { email, password, meta } = opts;

    const user = await this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim()
      }
    });

    if (!AuthService.userExists(user)) {
      throw new HttpError400('Invalid sign in details.');
    }

    if (AuthService.userUsable(user)) {
      throw new HttpError400('Account suspended.');
    }

    if (!user.email_verified) {
      throw new HttpError307('Please verify email first');
    }

    // check failed_count
    if (user.lockout_at) {
      if (Dayjs().diff(user.lockout_at, 'minute') < this.configService.config.PASSWORD_LOCKOUT_WINDOW) {
        throw new HttpError400('Too many invalid password attempts. Please retry later.');
      } else {
        await this.prisma.user.update({
          where: {
            id: user.id
          },
          data: {
            lockout_at: null,
            login_failed_count: 0
          }
        });
      }
    }

    if (!(user.password_hash === hashPassword(password, user.salt))) {
      // update failed count
      const failedCount = user.login_failed_count + 1;

      if (user.login_failed_count >= this.configService.config.PASSWORD_RETRY) {
        user.lockout_at = new Date();
      }

      await this.prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          lockout_at: user.login_failed_count >= this.configService.config.PASSWORD_RETRY ? new Date() : null,
          login_failed_count: failedCount
        }
      });

      throw new HttpError400('Invalid sign in details.');
    }

    const token = await this.createUserToken({
      id: user.id,
      meta
    });

    await this.prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        active_at: new Date()
      }
    });

    return token;
  }

  /**
   * verify email using 6-digit otp or token
   * @param options
   * @returns user id
   */
  async verifyEmailOtp(opts: { email: string; code: string; token: string; type: EmailOtpType }): Promise<string> {
    const defaultError = new HttpError400('Invalid code');
    const retryError = new HttpError400('Invalid code,请重新获取.');

    const { email, code, token, type } = opts;
    const user = await this.prisma.user.findFirst({
      where: {
        email: email.trim().toLowerCase()
      }
    });

    // user does not exist
    if (!AuthService.userExists(user)) {
      throw defaultError;
    }

    // user is suspended
    if (AuthService.userUsable(user)) {
      throw defaultError;
    }

    const otpInfo = await this.prisma.otp.findFirst({
      where: {
        user: {
          id: user.id
        },
        method: 'EMAIL',
        type
      }
    });

    // no otp info
    if (!otpInfo) {
      throw retryError;
    }

    // too many failed attempts
    if (otpInfo.failed >= this.configService.config.OTP_RETRY) {
      // DO NOT DELETE
      throw retryError;
    }

    // check expired
    if (Dayjs().diff(otpInfo.expire_at, 'second') > 0) {
      // remove otp
      await this.prisma.otp.delete({
        where: {
          id: otpInfo.id
        }
      });

      // throw error
      throw retryError;
    }

    const validToken = code ? hashOtp(code, otpInfo.salt) === otpInfo.token : otpInfo.token === token;
    if (!validToken) {
      otpInfo.failed++;

      await this.prisma.otp.update({
        where: {
          id: otpInfo.id
        },
        data: {
          failed: otpInfo.failed
        }
      });

      throw otpInfo.failed === this.configService.config.OTP_RETRY ? retryError : defaultError;
    }

    // otp is valid
    const toUpdate: any = {};
    if (type === 'signup') {
      toUpdate.email_verified_at = new Date();
      toUpdate.email_verified = true;
    } else if (type === 'signin') {
      if (!user.email_verified) {
        toUpdate.email_verified_at = new Date();
        toUpdate.email_verified = true;
      }
    } else if (type === 'email_change') {
      if (user.new_email) {
        toUpdate.email = user.new_email;
        toUpdate.email_verified = true;
        toUpdate.email_verified_at = new Date();
        toUpdate.new_email = null;
      } else {
        throw new HttpError400('Email already verified');
      }
    } else if (type === 'password_reset') {
      // TODO:
    } else if (type === 'invite') {
      // TODO:
    }

    await this.prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        ...toUpdate,
        active_at: new Date()
      }
    });

    // remove otp record
    await this.prisma.otp.delete({
      where: {
        id: otpInfo.id
      }
    });

    return user.id;
  }

  async verifyMobileOtp(opts: { userId: string; code: string; type: MobileOtpType }): Promise<string> {
    const defaultError = new HttpError400('Invalid code');
    const retryError = new HttpError400('Invalid code, please retry.');

    const { userId, code, type } = opts;
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId
      }
    });

    // user does not exist
    if (!AuthService.userExists(user)) {
      throw defaultError;
    }

    // user is suspended
    if (AuthService.userUsable(user)) {
      throw defaultError;
    }

    const otpInfo = await this.prisma.otp.findFirst({
      where: {
        user: {
          id: userId
        },
        method: 'SMS',
        type
      }
    });

    // no otp info
    if (!otpInfo) {
      throw retryError;
    }

    // too many failed attempts
    if (otpInfo.failed >= this.configService.config.OTP_RETRY) {
      // DO NOT DELETE
      throw retryError;
    }

    // check expired
    if (Dayjs().diff(otpInfo.expire_at, 'second') > 0) {
      // remove otp
      await this.prisma.otp.delete({
        where: {
          id: otpInfo.id
        }
      });

      // throw error
      throw retryError;
    }

    const validToken = hashOtp(code, otpInfo.salt) === otpInfo.token;
    if (!validToken) {
      otpInfo.failed++;

      await this.prisma.otp.update({
        where: {
          id: otpInfo.id
        },
        data: {
          failed: otpInfo.failed
        }
      });

      throw otpInfo.failed === this.configService.config.OTP_RETRY ? retryError : defaultError;
    }

    // otp is valid
    const toUpdate: any = {};
    if (type === 'verify') {
      toUpdate.mobile_verified = true;
      toUpdate.mobile_verified_at = new Date();
    } else if (type === 'mobile_change') {
      if (user.new_mobile) {
        toUpdate.mobile = user.new_mobile;
        toUpdate.mobile_verified = true;
        toUpdate.mobile_verified_at = new Date();
        toUpdate.new_mobile = null;
      } else {
        throw new HttpError400('Mobile already verified');
      }
    }

    await this.prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        ...toUpdate,
        active_at: new Date()
      }
    });

    // remove otp record
    await this.prisma.otp.delete({
      where: {
        id: otpInfo.id
      }
    });

    return user.id;
  }

  /**
   * create user access/refresh tokens
   */
  async createUserToken(opts: { id: string; meta?: MetaDTO }): Promise<UserTokenPayload> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: opts.id
      }
    });

    const payload: JWT = {
      sub: opts.id,
      iat: Math.floor(Date.now() / 1000),
      jti: v4()
    } as any;

    payload.role = user.type.toLowerCase();
    payload.exp = Date.now() + ms(this.configService.config.JWT_AT_EXPIRES_IN);
    payload.exp = parseInt((payload.exp / 1000).toString());

    if (user.status === 'DEACTIVATED') {
      payload.deactivated = true;
    }

    if (!['ACTIVE', 'DEACTIVATED'].includes(user.status)) {
      throw new HttpError403('User not active'); // assert 403
    }

    // save to database
    const token = await this.prisma.token.create({
      data: {
        id: payload.jti,
        token: AuthService.generateRefreshToken(),
        expire_at: new Date(Date.now() + ms(this.configService.config.JWT_RT_EXPIRES_IN)),
        // exclude ip and uid from meta
        meta: opts.meta ? (AuthService.cleanupMeta(opts.meta) as Prisma.JsonObject) : Prisma.JsonNull,
        ip: opts.meta?.ip,
        uid: opts.meta?.uid,
        user: {
          connect: {
            id: payload.sub
          }
        }
      }
    });

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: token.token,
      sub: opts.id,
      jti: payload.jti
    };
  }

  async generateEmailOtp(opts: { email: string; type: EmailOtpType }): Promise<{
    code: string;
    token: string;
  } | null> {
    const email = opts.email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        email
      }
    });
    const { type } = opts;

    if (!AuthService.userExists(user)) {
      return null;
    }

    if (AuthService.userUsable(user)) {
      throw new HttpError403('Account suspended.');
    }

    if (user.email_verified && type === 'signup') {
      throw new HttpError400('Account already verified. Please sign in.');
    }

    if (
      user.lockout_at &&
      Dayjs().diff(user.lockout_at, 'minute') < this.configService.config.PASSWORD_LOCKOUT_WINDOW
    ) {
      throw new HttpError400('Account locked. Please retry later.');
    }

    // does OTP exist?
    const otpInfo = await this.prisma.otp.findFirst({
      where: {
        user: {
          id: user.id
        },
        method: 'EMAIL',
        type
      }
    });

    if (otpInfo) {
      // expired?
      if (Dayjs().diff(otpInfo.expire_at, 'second') > 0) {
        // remove otp
        await this.prisma.otp.delete({
          where: {
            id: otpInfo.id
          }
        });
      }

      // too frequent
      if (Dayjs().diff(otpInfo.created_at, 'minute') < this.configService.config.OTP_EMAIL_INTERVAL) {
        // always return empty code
        return { code: '', token: '' };
      }
    }

    const code = generateOtp();
    const salt = generateSalt();
    const token = hashOtp(code, salt);

    await this.prisma.otp.upsert({
      where: {
        user_id_method_type: {
          userId: user.id,
          type,
          method: 'EMAIL'
        }
      },
      create: {
        salt,
        token,
        expire_at: Dayjs().add(this.configService.config.OTP_EXPIRE_IN, 'minute').toISOString(),
        created_at: new Date(),
        user: {
          connect: {
            id: user.id
          }
        },
        type,
        method: 'EMAIL'
      },
      update: {
        salt,
        token,
        failed: 0,
        expire_at: Dayjs().add(this.configService.config.OTP_EXPIRE_IN, 'minute').toISOString(),
        created_at: new Date()
      }
    });

    return { code, token };
  }

  async generateMobileOtp(opts: {
    userId: string;
    countryCode: string;
    mobile: string;
    type: MobileOtpType;
  }): Promise<string> {
    let { type } = opts;
    const { userId, countryCode, mobile } = opts;
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId
      }
    });

    if (!AuthService.userExists(user)) {
      return null;
    }

    if (AuthService.userUsable(user)) {
      throw new HttpError403('Account suspended.');
    }

    if (user.mobile_verified && type === 'verify') {
      throw new HttpError400('Mobile already verified. Please sign in.');
    }

    if (type === 'mobile_change' && !user.mobile_verified) {
      type = 'verify';
    }

    if (type === 'mobile_change' && user.country_code === countryCode && user.mobile === mobile) {
      throw new HttpError400('Mobile already verified. Please sign in.');
    }

    if (type === 'verify') {
      // does mobile exist?
      const exists = await this.prisma.user.findFirst({
        where: {
          country_code: countryCode,
          mobile,
          id: {
            not: userId
          }
        }
      });

      if (exists) {
        throw new HttpError400('Mobile has been used');
      }
    }

    if (
      user.lockout_at &&
      Dayjs().diff(user.lockout_at, 'minute') < this.configService.config.PASSWORD_LOCKOUT_WINDOW
    ) {
      throw new HttpError400('Account locked. Please retry later.');
    }

    // TODO: validate countryCode/mobile

    // does OTP exist?
    const otpInfo = await this.prisma.otp.findFirst({
      where: {
        user: {
          id: userId
        },
        method: 'SMS',
        type
      }
    });

    if (otpInfo) {
      // expired?
      if (Dayjs().diff(otpInfo.expire_at, 'second') > 0) {
        // remove otp
        await this.prisma.otp.delete({
          where: {
            id: otpInfo.id
          }
        });
      }

      // 获取验证码太频繁
      if (Dayjs().diff(otpInfo.created_at, 'minute') < this.configService.config.OTP_MOBILE_INTERVAL) {
        throw new HttpError429('Too many retries. Please retry later.');
      }
    }

    const code = generateOtp();
    const salt = generateSalt();
    const token = hashOtp(code, salt);

    await this.prisma.otp.upsert({
      where: {
        user_id_method_type: {
          userId,
          type,
          method: 'SMS'
        }
      },
      create: {
        salt,
        token,
        expire_at: Dayjs().add(this.configService.config.OTP_EXPIRE_IN, 'minute').toISOString(),
        created_at: new Date(),
        user: {
          connect: {
            id: userId
          }
        },
        type,
        method: 'SMS'
      },
      update: {
        salt,
        token,
        failed: 0,
        expire_at: Dayjs().add(this.configService.config.OTP_EXPIRE_IN, 'minute').toISOString(),
        created_at: new Date()
      }
    });

    const toUpdate: any = {};
    if (type === 'verify') {
      toUpdate.country_code = countryCode;
      toUpdate.mobile = mobile;
    } else if (type === 'mobile_change') {
      toUpdate.new_country_code = countryCode;
      toUpdate.new_mobile = mobile;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: toUpdate
    });

    return code;
  }

  async refreshAccessToken(
    refreshToken: string,
    meta?: MetaDTO
  ): Promise<{ access_token: string; refresh_token: string }> {
    let token = await this.prisma.token.findFirst({
      where: { token: refreshToken }
    });

    // validate refresh token
    if (!token || token.revoked || Dayjs().isAfter(Dayjs(token.expire_at))) {
      throw new HttpError401('Invalid token');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: token.userId }
    });

    if (!AuthService.userExists(user)) {
      throw new HttpError401('Invalid token');
    }

    if (!['ACTIVE', 'DEACTIVATED'].includes(user.status)) {
      throw new HttpError401('Account not active'); // 401, let client logout
    }

    // create new access token
    token = await this.prisma.token.update({
      where: { id: token.id },
      data: {
        updated_at: new Date(),
        expire_at: new Date(Date.now() + ms(this.configService.config.JWT_RT_EXPIRES_IN)),
        token: AuthService.generateRefreshToken(),
        ip: meta?.ip,
        meta: meta ? (AuthService.cleanupMeta(meta) as Prisma.JsonObject) : Prisma.JsonNull
      }
    });

    const payload: JWT = {
      jti: token.id,
      iat: parseInt((Date.now() / 1000).toString()),
      sub: token.userId,
      role: user.type.toLowerCase(),
      exp: 0
    };

    payload.role = user.type.toLowerCase();
    payload.exp = Date.now() + ms(this.configService.config.JWT_AT_EXPIRES_IN);
    payload.exp = parseInt((payload.exp / 1000).toString());

    if (user.deactivated_at) {
      payload.deactivated = true;
    }

    // async
    this.prisma.user.update({
      where: { id: user.id },
      data: {
        active_at: new Date()
      }
    });

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: token.token
    };
  }

  async deactivateUser(userId: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId
      }
    });

    if (!AuthService.userExists(user)) {
      throw new HttpError400('User does not exist');
    }

    if (user.status === UserStatus.DEACTIVATED) {
      throw new HttpError400('Account already deactivated');
    }

    if (!(user.password_hash === hashPassword(password, user.salt))) {
      throw new HttpError400('Incorrect password');
    }

    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        status: UserStatus.DEACTIVATED,
        deactivated_at: new Date()
      }
    });
  }

  async reactivateUser(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId
      }
    });

    if (!AuthService.userExists(user)) {
      throw new HttpError400('User does not exist');
    }

    if (user.status !== UserStatus.DEACTIVATED) {
      throw new HttpError400('User is not deactivated');
    }

    if (Dayjs().diff(Dayjs(user.deactivated_at), 'day') > this.configService.config.DEACTIVATE_COOLDOWN) {
      throw new HttpError400('Account already deactivated');
    }

    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        status: UserStatus.ACTIVE,
        deactivated_at: null
      }
    });
  }

  async signout(tokenId) {
    await this.prisma.token.update({
      where: { id: tokenId },
      data: {
        revoked: true,
        updated_at: new Date()
      }
    });
  }

  /** logout user from all sessions */
  async signoutAllSessions(userId: string) {
    await this.prisma.token.updateMany({
      where: {
        userId
      },
      data: {
        revoked: true,
        updated_at: new Date()
      }
    });
  }

  async listTokens(userId: string) {
    return await this.prisma.token.findMany({
      where: {
        userId
      }
    });
  }

  static generateRefreshToken(length = 32): string {
    return randomBytes(length).toString('base64');
  }

  static userExists(user: User) {
    return user && user.status !== 'DELETED';
  }

  static userUsable(user: User) {
    return ['SUSPENDED', 'BANNED'].includes(user?.status);
  }

  static cleanupMeta(meta: MetaDTO): MetaDTO {
    return _.omit(meta, ['ip', 'uid']);
  }
}
