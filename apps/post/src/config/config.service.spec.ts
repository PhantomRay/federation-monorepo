import { fail } from 'assert';
import fs from 'fs';

import { ConfigService } from './config.service';

describe('config service', () => {
  let service: ConfigService;
  beforeAll(async () => {
    service = new ConfigService();
  });

  it('should throw validation error', () => {
    try {
      jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
      jest
        .spyOn(fs, 'readFileSync')
        .mockImplementation(() => 'REDIS_PORT=WRONG_PORT\nJWT_SECRET=1234567890123456789012345678901234567890');

      new ConfigService();
      fail('Did not throw error');
    } catch (err) {
      expect(err.message).toMatch(/REDIS_PORT.+must be a number/);
    }
  });

  it('should validate payload when creating subscription ', () => {
    expect(service.config.REDIS_HOST).toBe('localhost');
    expect(service.config.REDIS_PORT).toBe(6379);
  });
});
