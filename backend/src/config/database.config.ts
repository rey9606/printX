import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5433', 10),
  username: process.env.DATABASE_USER || 'printx',
  password: process.env.DATABASE_PASSWORD || 'printx123',
  database: process.env.DATABASE_NAME || 'printx',
}));