require('../src/env');

import { HttpExceptionFilter } from '@incognito/toolkit/dist/http.exception.filter';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { RequestMobileOtpDTO, MobileOtpCodeDTO, EmailOtpCodeDTO } from '@/modules/auth/payload/otp.dto';
import { SignupDTO } from '@/modules/auth/payload/signup.dto';

import { AppModule } from '../src/app.module';

describe('[Auth] Mobile', () => {
  let app: INestApplication;
  let _accessToken;
  const _login = {
    email: Date.now() + '@example.com',
    password: '12345678'
  };

  const _mobile = {
    countryCode: '852',
    mobile: Date.now().toString()
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

    // get access token
    const res = await request(app.getHttpServer())
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
  });

  describe('Otp', () => {
    it('should fail request OTP with wrong token', async () => {
      const res = await request(app.getHttpServer())
        .post('/mobile/otp')
        .set('Authorization', 'Bearer wrong_token')
        .send({
          country_code: _mobile.countryCode,
          mobile: _mobile.mobile,
          type: 'verify'
        } as RequestMobileOtpDTO)
        .expect(401);

      expect(res.body).toEqual({
        message: 'Unauthorized',
        statusCode: 401
      });
    });

    it('should request OTP', async () => {
      const res = await request(app.getHttpServer())
        .post('/mobile/otp')
        .set('Authorization', `Bearer ${_accessToken}`)
        .send({
          country_code: _mobile.countryCode,
          mobile: _mobile.mobile,
          type: 'verify'
        } as RequestMobileOtpDTO)
        .expect(200);

      expect(res.body).toEqual({});
    });

    it('should reject wrong otp code', async () => {
      const res = await request(app.getHttpServer())
        .post('/mobile/verify')
        .set('Authorization', `Bearer ${_accessToken}`)
        .send({
          type: 'verify',
          code: 'wrong'
        } as MobileOtpCodeDTO)
        .expect(400);

      expect(res.body.message).toBe('Invalid code');
    });

    it('should verify mobile', async () => {
      let res = await request(app.getHttpServer())
        .post('/mobile/verify')
        .set('Authorization', `Bearer ${_accessToken}`)
        .send({
          type: 'verify',
          code: '123456'
        } as MobileOtpCodeDTO)
        .expect(200);

      // get user detail
      res = await request(app.getHttpServer()).get('/user').set('Authorization', `Bearer ${_accessToken}`).expect(200);

      expect(res.body.mobile_verified).toBe(true);
      expect(res.body.mobile_verified_at).toBeDefined();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
