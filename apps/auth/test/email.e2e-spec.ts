require('../src/env');

import { HttpExceptionFilter } from '@incognito/toolkit/dist/http.exception.filter';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { EmailOtpCodeDTO, RequestEmailOtpDTO } from '@/modules/auth/payload/otp.dto';
import { SignupDTO } from '@/modules/auth/payload/signup.dto';

import { AppModule } from '../src/app.module';

describe('[Auth] Email', () => {
  let app: INestApplication;
  let _accessToken;
  const _login = {
    email: Date.now() + '@example.com',
    password: '12345678'
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    await request(app.getHttpServer())
      .post('/signup')
      .send({
        email: _login.email,
        password: _login.password
      } as SignupDTO)
      .expect(200);
  });

  describe('Otp', () => {
    it('should verify signup OTP', async () => {
      let res = await request(app.getHttpServer())
        .post('/email/otp/verify')
        .send({
          email: _login.email,
          code: 'wrong',
          type: 'signup'
        } as RequestEmailOtpDTO)
        .expect(400);

      expect(res.body.message).toBe('Invalid code');

      // get access token
      res = await request(app.getHttpServer())
        .post(`/email/otp/verify`)
        .send({
          email: _login.email,
          code: '123456',
          type: 'signup'
        } as EmailOtpCodeDTO)
        .expect(200);

      expect(res.body.access_token).toBeDefined();
      expect(res.body.refresh_token).toBeDefined();

      _accessToken = res.body.access_token;

      // get user detail
      res = await request(app.getHttpServer()).get('/user').set('Authorization', `Bearer ${_accessToken}`).expect(200);

      expect(res.body.email_verified).toBe(true);
      expect(res.body.email_verified_at).toBeDefined();
    });

    it('should return "{}" for non-existent user', async () => {
      const res = await request(app.getHttpServer())
        .post('/email/otp')
        .send({
          email: 'no-such-user@example.com',
          type: 'signin'
        } as RequestEmailOtpDTO)
        .expect(200);

      expect(res.body).toEqual({});
    });

    it('should request signin OTP', async () => {
      const res = await request(app.getHttpServer())
        .post('/email/otp')
        .send({
          email: _login.email,
          type: 'signin'
        } as RequestEmailOtpDTO)
        .expect(200);

      expect(res.body).toEqual({});
    });

    it('should verify signin OTP', async () => {
      let res = await request(app.getHttpServer())
        .post('/email/otp/verify')
        .send({
          email: _login.email,
          type: 'signin',
          code: '123456'
        } as RequestEmailOtpDTO)
        .expect(200);

      // get user detail
      res = await request(app.getHttpServer()).get('/user').set('Authorization', `Bearer ${_accessToken}`).expect(200);

      expect(res.body.email_verified).toBe(true);
      expect(res.body.email_verified_at).toBeDefined();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
