require('../src/env');

import { HttpExceptionFilter } from '@incognito/toolkit/dist/http.exception.filter';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { EmailOtpCodeDTO } from '@/modules/auth/payload/otp.dto';

import { AppModule } from '../src/app.module';
import { EmailSignInDTO } from '../src/modules/auth/payload/signin.dto';
import { SignupDTO } from '../src/modules/auth/payload/signup.dto';

const META = {
  'x-make': 'Apple',
  'x-model': 'iPhone 11 Pro Max',
  'x-os': 'ios',
  'x-os_ver': '13.1.4',
  'x-app': 'myapp',
  'x-app_ver': '1.0.1',
  'x-uid': '00000000000000000000000000000000',
  'x-ip': '12.32.123.22'
};

describe('[Auth] Sign up/sign in', () => {
  let app: INestApplication;
  let _accessToken;
  let _refreshToken;
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
  });

  describe('Sign up', () => {
    it('should sign up', async () => {
      await request(app.getHttpServer())
        .post('/signup')
        .send({
          email: _login.email,
          password: _login.password
        } as SignupDTO)
        .expect(200);
    });

    it('should not signup with same email', async () => {
      const res = await request(app.getHttpServer())
        .post(`/signup`)
        .send({
          email: _login.email,
          password: _login.password
        } as SignupDTO)
        .expect(400);

      expect(res.body.message).toBe('User already exists.');
    });
  });

  describe('Sign in', () => {
    it('should not allow sign in if email not verified', async () => {
      await request(app.getHttpServer())
        .post(`/signin`)
        .send({
          email: _login.email,
          password: '12345678'
        } as EmailSignInDTO)
        .expect(307);
    });

    it('should sign in using auth code', async () => {
      // verify email
      await request(app.getHttpServer())
        .post(`/email/otp/verify`)
        .send({
          email: _login.email,
          code: '123456',
          type: 'signup'
        } as EmailOtpCodeDTO)
        .expect(200);

      const res = await request(app.getHttpServer())
        .post(`/signin`)
        .set(META)
        .send({
          email: _login.email,
          password: _login.password
        } as EmailSignInDTO)
        .expect(200);

      expect(res.body.access_token).toBeDefined();
      expect(res.body.refresh_token).toBeDefined();

      _accessToken = res.body.access_token;
      _refreshToken = res.body.refresh_token;
    });
  });

  describe('Refresh token', () => {
    it('should get refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post(`/token`)
        .set(META)
        .send({
          refresh_token: _refreshToken
        })
        .expect(200);

      expect(res.body.access_token.length).toBeGreaterThan(0);
      expect(res.body.refresh_token.length).toBeGreaterThan(0);

      _accessToken = res.body.access_token;
      _refreshToken = res.body.refresh_token;
    });
  });

  describe('Deactivate/re-activate', () => {
    it('should deactivate account', async () => {
      await request(app.getHttpServer())
        .post('/deactivate')
        .set('Authorization', `bearer ${_accessToken}`)
        .send({
          password: _login.password
        })
        .expect(200);

      const res = await request(app.getHttpServer())
        .post('/deactivate')
        .set('Authorization', `bearer ${_accessToken}`)
        .send({
          password: _login.password
        })
        .expect(400);

      expect(res.body.message).toBe('Account already deactivated');
    });

    it('should include "deactivated" field after sign in', async () => {
      const res = await request(app.getHttpServer())
        .post(`/signin`)
        .send({
          email: _login.email,
          password: _login.password
        } as EmailSignInDTO)
        .expect(200);

      expect(res.body.access_token).toBeDefined();
      // convert base64 payload to json
      const payload = JSON.parse(Buffer.from(res.body.access_token.split('.')[1], 'base64').toString());

      expect(payload.deactivated).toBe(true);
    });

    it('should re-activate account', async () => {
      await request(app.getHttpServer()).post('/reactivate').set('Authorization', `bearer ${_accessToken}`).expect(200);
    });

    it('should not re-activate if account is active', async () => {
      const res = await request(app.getHttpServer())
        .post('/reactivate')
        .set('Authorization', `bearer ${_accessToken}`)
        .expect(400);

      expect(res.body.message).toBe('User is not deactivated');
    });
  });

  describe('Sign out', () => {
    it('should sign out', async () => {
      await request(app.getHttpServer()).post('/signout').set('Authorization', `bearer ${_accessToken}`).expect(200);

      // refresh token should be invalidated
      await request(app.getHttpServer())
        .post(`/token`)
        .set(META)
        .send({
          refresh_token: _refreshToken
        })
        .expect(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
