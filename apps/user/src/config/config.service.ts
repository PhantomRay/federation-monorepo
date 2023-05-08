import fs from 'fs';

import dotenv from 'dotenv';
import Joi from 'joi';

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  REDIS_HOST: string;
  REDIS_PORT: number;

  JWT_SECRET: string;
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
      NODE_ENV: Joi.string().valid('local', 'development', 'production', 'test').default('development'),

      PORT: Joi.number().default(3000),

      REDIS_HOST: Joi.string().default('localhost'),
      REDIS_PORT: Joi.number().default(6379),

      JWT_SECRET: Joi.string().min(32).max(512).required()
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
