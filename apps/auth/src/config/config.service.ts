import fs from 'fs';

import dotenv from 'dotenv';
import Joi from 'joi';

interface EnvConfig {
  APP_NAME: string;

  NODE_ENV: string;
  PORT: number;
  REDIS_HOST: string;
  REDIS_PORT: number;

  /** in seconds */
  MICROSERVICE_TIMEOUT: number;

  JWT_SECRET: string;
  JWT_AT_EXPIRES_IN: string; // access token expiry
  JWT_RT_EXPIRES_IN: string; // refresh token expiry

  PASSWORD_RETRY: number;

  PASSWORD_LOCKOUT_WINDOW: number;

  OTP_MOCK: string;

  OTP_RETRY: number;
  /** expires in minutes */
  OTP_EXPIRE_IN: number;
  /** OTP email interval in minutes */
  OTP_EMAIL_INTERVAL: number;
  /** OTP mobile interval in minutes */
  OTP_MOBILE_INTERVAL: number;

  /** deactivate cooldown in days */
  DEACTIVATE_COOLDOWN: number;
}

export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor() {
    let envVariables = {};
    let localVariables = {};

    if (['local', 'development', 'production', 'test'].includes(process.env.NODE_ENV)) {
      const file = `./.env.${process.env.NODE_ENV}`;
      if (fs.existsSync(file)) {
        envVariables = dotenv.parse(fs.readFileSync(file));
      }
    }

    // local
    if (process.env.NODE_ENV !== 'test' && fs.existsSync('./.env.local')) {
      localVariables = dotenv.parse(fs.readFileSync('./.env.local'));
    }

    const config = { ...envVariables, ...localVariables, ...process.env };

    this.envConfig = this.validateInput(config as any);
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      APP_NAME: Joi.string().default('myapp'),
      NODE_ENV: Joi.string().valid('local', 'development', 'production', 'test').default('development'),

      PORT: Joi.number().default(3000),

      REDIS_HOST: Joi.string().default('localhost'),
      REDIS_PORT: Joi.number().default(6379),

      JWT_SECRET: Joi.string().min(32).max(512).required(),
      JWT_AT_EXPIRES_IN: Joi.string().default('2h'),
      JWT_RT_EXPIRES_IN: Joi.string().default('180d'),

      PASSWORD_RETRY: Joi.number().min(5).max(60).default(5),
      PASSWORD_LOCKOUT_WINDOW: Joi.number().min(5).max(1440).default(10), // min: 5m, max: 1d

      OTP_MOCK: Joi.string(),
      OTP_RETRY: Joi.number().min(3).max(10).default(3),
      OTP_EXPIRE_IN: Joi.number().min(5).max(1440).default(120), // min: 5m, max: 1d
      OTP_EMAIL_INTERVAL: Joi.number().min(1).max(30).default(2),
      OTP_MOBILE_INTERVAL: Joi.number().min(1).max(30).default(5),

      DEACTIVATE_COOLDOWN: Joi.number().min(1).max(30).default(14) // min: 1d, max: 30d
    });

    const { error, value: validatedEnvConfig } = envVarsSchema.validate(envConfig, { allowUnknown: true });

    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    return validatedEnvConfig;
  }

  public get config(): EnvConfig {
    return this.envConfig;
  }
}
