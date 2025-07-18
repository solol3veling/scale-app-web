import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check for existing session first
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('🔍 useAuth - Initial session check:', session);
        console.log('🔍 useAuth - Initial access token:', session?.access_token);
        console.log('🔍 useAuth - Error:', error);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('🔍 useAuth - Session initialization error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 useAuth - Auth state change:', event, session);
        console.log('🔄 useAuth - Access token:', session?.access_token);
        console.log('🔄 useAuth - Refresh token:', session?.refresh_token);
        console.log('🔄 useAuth - Provider token:', session?.provider_token);
        
        if (mounted) {
          // Only update state if we have a session or if explicitly signing out
          if (session || event === 'SIGNED_OUT') {
            setSession(session);
            setUser(session?.user ?? null);
          }
          setIsLoading(false);
        }
      }
    );

    initializeAuth();

    return () => {
      console.log('🧹 useAuth - Cleaning up');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const getAccessToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const getProviderToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.provider_token;
  };

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    getAccessToken,
    getProviderToken,
    accessToken: session?.access_token,
    providerToken: session?.provider_token
  };
}