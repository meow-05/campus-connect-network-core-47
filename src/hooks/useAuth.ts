
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthUser {
  id: string;
  email: string;
  display_name: string | null;
  avatar_path?: string | null;
  role: 'student' | 'faculty' | 'mentor' | 'platform_admin';
  college_id: string | null;
  is_verified: boolean | null;
}

interface SignUpData {
  email: string;
  password: string;
  display_name: string;
  role: 'student' | 'faculty' | 'mentor' | 'platform_admin';
  college_id?: string;
}

interface SignInData {
  email: string;
  password: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user profile data with retry logic for new users
  const fetchUserProfile = useCallback(async (userId: string, retryCount = 0): Promise<AuthUser | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // If user not found and we haven't retried much, wait a bit and retry
        if (error.code === 'PGRST116' && retryCount < 3) {
          console.log(`User not found, retrying in ${(retryCount + 1) * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
          return fetchUserProfile(userId, retryCount + 1);
        }
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        display_name: data.display_name,
        avatar_path: data.avatar_path,
        role: data.role,
        college_id: data.college_id,
        is_verified: data.is_verified,
      } as AuthUser;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer the profile fetch to avoid blocking the auth state change
          setTimeout(async () => {
            if (!mounted) return;
            const profile = await fetchUserProfile(session.user.id);
            if (mounted) {
              setAuthUser(profile);
            }
          }, 100);
        } else {
          setAuthUser(null);
        }

        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('Initial session:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserProfile(session.user.id).then(profile => {
          if (mounted) {
            setAuthUser(profile);
          }
        });
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signUp = async (data: SignUpData) => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.display_name,
            role: data.role,
            college_id: data.college_id,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      toast.success('Account created successfully! Please check your email to verify your account.');
      return { success: true, user: authData.user };
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (data: SignInData) => {
    setIsLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      toast.success('Signed in successfully!');
      return { success: true, user: authData.user };
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      // Clear local state
      setUser(null);
      setSession(null);
      setAuthUser(null);

      toast.success('Signed out successfully!');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/auth/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      toast.success('Password reset email sent! Please check your inbox.');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      toast.success('Password updated successfully!');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    session,
    authUser,
    loading,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user,
  };
}
