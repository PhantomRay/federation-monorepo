/**
 * help persist dat between jest tests
 */

import fs from 'fs';

import jwt from 'jsonwebtoken';

import { generateSnowflakeId } from './utils';

export class TestHelper {
  private path;
  constructor() {
    this.path = 'temp.json';
  }

  static mongoId() {
    const objectId = (m = Math, d = Date, h = 16, s = (str) => m.floor(str).toString(h)) =>
      s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));

    return objectId();
  }

  save(key, value) {
    const data = this.getData();
    data[key] = value;

    fs.writeFileSync(this.path, JSON.stringify(data));
  }
  getValue(key) {
    const data = this.getData();
    return data[key];
  }

  getData() {
    try {
      if (!fs.existsSync(this.path)) {
        return {};
      }

      const content = fs.readFileSync(this.path, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      console.error(err);
      return {};
    }
  }

  static createAccessToken(role: 'user' | 'admin' = 'user'): {
    token: string;
    userId: string;
  } {
    const payload: Jwt = {
      sub: generateSnowflakeId(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      jti: generateSnowflakeId(),
      role
    };

    return {
      token: jwt.sign(payload, process.env.JWT_SECRET),
      userId: payload.sub
    };
  }

  cleanup() {
    if (fs.existsSync(this.path)) {
      fs.unlinkSync(this.path);
    }
  }
}

export type Jwt = {
  sub: string;
  iat: number;
  jti: string;
  exp: number;
  /** user, admin */
  role: string;
  scope?: string;
};
