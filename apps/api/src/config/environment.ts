import { config } from 'dotenv';
import { z } from 'zod';
config({ path: '../../.env', quiet: true });
export const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.url().refine((value) => /^postgres(ql)?:/.test(value)),
  JWT_SECRET: z
    .string()
    .min(32)
    .refine(
      (value) => !value.startsWith('replace-'),
      'Generate a unique JWT secret',
    ),
  WEB_ORIGIN: z.url().default('http://localhost:5173'),
});
export const env = environmentSchema.parse(process.env);
