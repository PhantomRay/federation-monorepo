import fs from 'fs';

import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'local';

const envFile = `./.env.${process.env.NODE_ENV}`;

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
}
