import { generateSnowflakeId } from '@incognito/toolkit';
import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { generateSalt, hashPassword } from '@/common/helper';
import { PrismaService } from '@/services/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(id: string) {
    return this.prisma.user.findFirst({
      where: { id },
      select: {
        id: true,
        email: true,
        new_email: true,
        email_verified: true,
        email_verified_at: true,
        country_code: true,
        mobile: true,
        new_mobile: true,
        new_country_code: true,
        mobile_verified: true,
        mobile_verified_at: true,
        status: true,
        type: true,
        lockout_at: true,
        created_at: true,
        updated_at: true,
        active_at: true,
        channel: true,
        password_hash: false,
        salt: false
      }
    });
  }

  async createAdminUser(opts: { email: string; password?: string; update?: boolean }) {
    if (opts.password && opts.password.length < 8)
      throw new Error('Password should be at least 8 characters in length');

    if (!opts.password) opts.password = v4().substring(0, 8);

    let user = await this.prisma.user.findFirst({
      where: {
        email: opts.email,
        type: 'ADMIN'
      }
    });

    if (user && opts.update) {
      const salt = generateSalt();
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password_hash: hashPassword(opts.password, salt),
          salt
        }
      });
    } else if (!user) {
      const salt = generateSalt();
      user = await this.prisma.user.create({
        data: {
          id: generateSnowflakeId(),
          email: opts.email,
          mobile_verified: false,
          type: 'ADMIN',
          status: 'ACTIVE',
          salt,
          password_hash: hashPassword(opts.password, salt)
        }
      });
    } else {
      throw new Error('User already exists');
    }

    return { ...opts, id: user.id.toString() };
  }
}
