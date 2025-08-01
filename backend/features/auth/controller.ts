
import { AuthService } from './service';
import { SignUpSchema, SignInSchema, ResetPasswordSchema } from './types';

export class AuthController {
  /**
   * Handle user signup
   */
  static async signup(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      
      // Validate input
      const validationResult = SignUpSchema.safeParse(body);
      if (!validationResult.success) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Invalid input data',
            errors: validationResult.error.errors,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const result = await AuthService.signUp(validationResult.data);

      return new Response(JSON.stringify(result), {
        status: result.success ? 201 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Signup controller error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Internal server error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  /**
   * Handle user signin
   */
  static async signin(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      
      // Validate input
      const validationResult = SignInSchema.safeParse(body);
      if (!validationResult.success) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Invalid input data',
            errors: validationResult.error.errors,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const result = await AuthService.signIn(validationResult.data);

      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 401,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Signin controller error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Internal server error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  /**
   * Handle user signout
   */
  static async signout(): Promise<Response> {
    try {
      const result = await AuthService.signOut();

      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Signout controller error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Internal server error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  /**
   * Handle password reset request
   */
  static async resetPassword(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      
      // Validate input
      const validationResult = ResetPasswordSchema.safeParse(body);
      if (!validationResult.success) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Invalid email address',
            errors: validationResult.error.errors,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const result = await AuthService.resetPassword(validationResult.data);

      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Reset password controller error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Internal server error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<Response> {
    try {
      const user = await AuthService.getCurrentUser();

      if (!user) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Not authenticated',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          user,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Get current user controller error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Internal server error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
}
