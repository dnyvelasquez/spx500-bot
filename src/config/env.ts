import dotenv from 'dotenv';

import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),

  TELEGRAM_BOT_TOKEN: z.string().min(1),
});

export const env = envSchema.parse(process.env);