
import { db } from '../supabaseClient';
import type { SignUpRequest, SignInRequest, ResetPasswordRequest, UserPayload, AuthResponse } from './types';

export class AuthService {
  /**
   * Sign up a new user
   */
  static async signUp(data: SignUpRequest): Promise<AuthResponse> {
    try {
      const { email, password, display_name, role, college_id } = data;

      const { data: authData, error: authError } = await db.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name,
            role,
            college_id,
          },
          emailRedirectTo: `${process.env.SITE_URL || 'http://localhost:3000'}/auth/callback`,
        },
      });

      if (authError) {
        console.error('Signup error:', authError);
        return {
          success: false,
          message: authError.message,
        };
      }

      if (!authData.user) {
        return {
          success: false,
          message: 'Failed to create user account',
        };
      }

      // Fetch the user data from our users table
      const { data: userData, error: userError } = await db
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error fetching user data:', userError);
      }

      const userPayload: UserPayload = {
        id: authData.user.id,
        email: authData.user.email!,
        display_name: userData?.display_name || display_name,
        role: userData?.role || role,
        college_id: userData?.college_id || college_id || null,
        is_verified: userData?.is_verified || false,
        created_at: authData.user.created_at,
      };

      return {
        success: true,
        message: 'Account created successfully. Please check your email to verify your account.',
        user: userPayload,
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
      };
    } catch (error) {
      console.error('Signup service error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during signup',
      };
    }
  }

  /**
   * Sign in an existing user
   */
  static async signIn(data: SignInRequest): Promise<AuthResponse> {
    try {
      const { email, password } = data;

      const { data: authData, error: authError } = await db.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Signin error:', authError);
        return {
          success: false,
          message: authError.message,
        };
      }

      if (!authData.user || !authData.session) {
        return {
          success: false,
          message: 'Failed to sign in',
        };
      }

      // Fetch user data from our users table
      const { data: userData, error: userError } = await db
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        return {
          success: false,
          message: 'Failed to load user profile',
        };
      }

      const userPayload: UserPayload = {
        id: authData.user.id,
        email: authData.user.email!,
        display_name: userData.display_name,
        role: userData.role,
        college_id: userData.college_id,
        is_verified: userData.is_verified,
        created_at: userData.created_at,
      };

      return {
        success: true,
        message: 'Signed in successfully',
        user: userPayload,
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
      };
    } catch (error) {
      console.error('Signin service error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during signin',
      };
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await db.auth.signOut();

      if (error) {
        console.error('Signout error:', error);
        return {
          success: false,
          message: error.message,
        };
      }

      return {
        success: true,
        message: 'Signed out successfully',
      };
    } catch (error) {
      console.error('Signout service error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during signout',
      };
    }
  }

  /**
   * Reset password for email
   */
  static async resetPassword(data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      const { email } = data;

      const { error } = await db.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
      });

      if (error) {
        console.error('Reset password error:', error);
        return {
          success: false,
          message: error.message,
        };
      }

      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.',
      };
    } catch (error) {
      console.error('Reset password service error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred while sending reset email',
      };
    }
  }

  /**
   * Get current user with enforced RLS
   */
  static async getCurrentUser(): Promise<UserPayload | null> {
    try {
      const { data: { user }, error: authError } = await db.auth.getUser();

      if (authError || !user) {
        return null;
      }

      // Fetch user data from our users table with RLS enforced
      const { data: userData, error: userError } = await db
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching current user:', userError);
        return null;
      }

      return {
        id: user.id,
        email: user.email!,
        display_name: userData.display_name,
        role: userData.role,
        college_id: userData.college_id,
        is_verified: userData.is_verified,
        created_at: userData.created_at,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
}
