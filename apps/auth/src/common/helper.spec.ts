import Dayjs from 'dayjs';

import { generateSalt, hashPassword, hashOtp, isExpired, generateOtp } from './helper';

describe('generateSalt', () => {
  it('should generate a salt of the specified length', () => {
    const salt = generateSalt();
    expect(salt).toHaveLength(24);
  });
});

describe('hashPassword', () => {
  it('should hash the password using PBKDF2', () => {
    const password = 'password';
    const salt = 'salt';
    const hash = hashPassword(password, salt);
    expect(hash.length).toBeGreaterThan(100);
  });
});

describe('hashOtp', () => {
  it('should hash the OTP using PBKDF2', () => {
    const otp = '123456';
    const salt = 'salt';
    const hash = hashOtp(otp, salt);
    expect(hash).toHaveLength(44);
  });
});

describe('isExpired', () => {
  it('should return false if the timestamp is undefined', () => {
    const timestamp = undefined;
    const result = isExpired(timestamp);
    expect(result).toBe(false);
  });

  it('should return true if the timestamp is in the past', () => {
    const timestamp = Dayjs().subtract(1, 'day').toISOString();
    const result = isExpired(timestamp);
    expect(result).toBe(true);
  });

  it('should return false if the timestamp is in the future', () => {
    const timestamp = Dayjs().add(1, 'day').toISOString();
    const result = isExpired(timestamp);
    expect(result).toBe(false);
  });

  it('should throw an error if the timestamp is invalid', () => {
    const timestamp = 'invalid';
    expect(() => isExpired(timestamp)).toThrow('Wrong timestamp: invalid');
  });
});

describe('generateOtp', () => {
  it('should generate an OTP of the specified length', () => {
    const otp = generateOtp(6);
    expect(otp).toHaveLength(6);
  });

  it('should generate a mock OTP if the OTP_MOCK environment variable is set', () => {
    process.env.OTP_MOCK = '123456';
    let otp = generateOtp(6);
    expect(otp).toBe('123456');
    delete process.env.OTP_MOCK;

    otp = generateOtp(6);
    expect(otp.length).toBe(6);
    expect(typeof otp).toBe('string');
  });
});
