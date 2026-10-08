import { cleanEnv, str, port, num } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  PORT: port({ default: 5000 }),
  MONGODB_URI: str({ default: 'mongodb+srv://vyassagar43599_db_user:IHqrPsXPU7tdGPHA@cluster0.kim0rdb.mongodb.net/hrms_db' }),
  JWT_SECRET: str({ default: 'super_secret_jwt_key_for_hrms_system_2026' }),
  JWT_EXPIRES_IN: str({ default: '7d' }),
  JWT_REFRESH_SECRET: str({ default: 'super_secret_refresh_jwt_key_for_hrms_system_2026' }),
  JWT_REFRESH_EXPIRES_IN: str({ default: '30d' }),
  CORS_ORIGIN: str({ default: '*' }),
  RATE_LIMIT_WINDOW_MS: num({ default: 15 * 60 * 1000 }), // 15 mins
  RATE_LIMIT_MAX: num({ default: 100 }), // Max requests per window
});
