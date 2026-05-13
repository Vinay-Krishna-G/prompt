import { z } from 'zod';

export const registerBodySchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(120),
    email: z
      .string()
      .trim()
      .email('Invalid email address')
      .max(254)
      .transform((val) => val.toLowerCase()),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    avatar: z.string().trim().max(8).optional(),
  })
  .strict();

export const loginBodySchema = z
  .object({
    email: z
      .string()
      .trim()
      .email('Invalid email address')
      .max(254)
      .transform((val) => val.toLowerCase()),
    password: z.string().min(1, 'Password is required').max(128),
  })
  .strict();
