
import { z } from 'zod';

// Zod validation schemas
export const SignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  display_name: z.string().min(2, 'Display name must be at least 2 characters'),
  role: z.enum(['student', 'faculty', 'mentor', 'platform_admin']),
  college_id: z.string().uuid('Invalid college ID').optional(),
});

export const SignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const UpdatePasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// TypeScript types
export type SignUpRequest = z.infer<typeof SignUpSchema>;
export type SignInRequest = z.infer<typeof SignInSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordSchema>;
export type UpdatePasswordRequest = z.infer<typeof UpdatePasswordSchema>;

export interface UserPayload {
  id: string;
  email: string;
  display_name: string | null;
  role: 'student' | 'faculty' | 'mentor' | 'platform_admin';
  college_id: string | null;
  is_verified: boolean | null;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserPayload;
  access_token?: string;
  refresh_token?: string;
}

export interface AuthError {
  success: false;
  message: string;
  code?: string;
}
