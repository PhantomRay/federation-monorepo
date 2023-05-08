import { pbkdf2Sync, randomBytes } from 'crypto';

import Dayjs from 'dayjs';

const generateSalt = () => {
  return randomBytes(16).toString('base64');
};

const hashPassword = (password: string, salt: string): string => {
  const saltBuffer = Buffer.from(salt, 'base64');
  return pbkdf2Sync(password, saltBuffer, 10000, 128, 'sha512').toString('base64');
};

const hashOtp = (otp: string, salt: string): string => {
  const saltBuffer = Buffer.from(salt, 'base64');
  return pbkdf2Sync(otp, saltBuffer, 10000, 32, 'sha512').toString('base64');
};

const isExpired = (timestamp) => {
  if (!timestamp) return false;
  if (!Dayjs(timestamp).isValid()) throw new Error(`Wrong timestamp: ${timestamp}`);

  return Dayjs().isAfter(timestamp);
};

const generateOtp = (length = 6): string => {
  if (process.env.OTP_MOCK) {
    return process.env.OTP_MOCK;
  }

  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

const parseSortBy = (query) => {
  if (typeof query === 'string') {
    query = query.trim();
    query = [query];
  }

  if (Array.isArray(query)) {
    try {
      const res = {};
      query
        .filter((i) => i)
        .map((i) => i.trim())
        .forEach((i) => {
          const sort = i.split(/,|:/g).filter((key) => key.trim());
          if (sort.length === 1) {
            res[sort[0]] = 1;
          } else if (sort.length === 2) {
            res[sort[0]] = sort[1] === 'asc' ? 1 : -1;
          }
        });

      return res;
    } catch (err) {
      return {};
    }
  }

  return {};
};

export { generateSalt, hashPassword, hashOtp, isExpired, generateOtp, parseSortBy };
