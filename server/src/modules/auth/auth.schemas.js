import { z } from 'zod';

const emailSchema = z.string().trim().email('Digite um e-mail válido.').max(254);
const passwordSchema = z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.').max(128, 'A senha deve ter no máximo 128 caracteres.');

export const registerSchema = z.object({
  displayName: z.string().trim().min(2, 'Digite seu nome.').max(60, 'O nome deve ter no máximo 60 caracteres.'),
  username: z.string().trim().min(3, 'O usuário precisa ter pelo menos 3 caracteres.')
    .max(24, 'O usuário deve ter no máximo 24 caracteres.')
    .regex(/^[a-zA-Z0-9._]+$/, 'Use apenas letras, números, ponto e underline.'),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Digite seu e-mail ou usuário.').max(254),
  password: z.string().min(1, 'Digite sua senha.').max(128),
});
