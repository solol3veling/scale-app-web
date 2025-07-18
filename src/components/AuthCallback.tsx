import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing auth callback...');
        console.log('Current URL:', window.location.href);
        
        // Wait a moment to ensure Supabase has processed the callback
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if there's a session in the URL first
        const { data, error } = await supabase.auth.getSession();
        
        console.log('Callback - session check:', data.session);
        console.log('Callback - access token:', data.session?.access_token);
        console.log('Callback - provider token:', data.session?.provider_token);
        console.log('Callback - error:', error);
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth');
          return;
        }

        if (data.session?.access_token) {
          console.log('✅ Authentication successful with tokens, redirecting...');
          // Clear the URL to remove auth parameters
          window.history.replaceState({}, document.title, '/');
          navigate('/', { replace: true });
        } else {
          console.log('❌ No session or tokens found, redirecting to auth...');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Callback processing error:', error);
        navigate('/auth');
      }
    };

    // Set up a listener specifically for the callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Callback - auth state change:', event, session);
        if (event === 'SIGNED_IN' && session?.access_token) {
          console.log('✅ Auth state change - user signed in with tokens');
          window.history.replaceState({}, document.title, '/');
          navigate('/', { replace: true });
        }
      }
    );

    handleAuthCallback();

    return () => {
      console.log('Callback - cleaning up listener');
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p>Completing sign in...</p>
      </div>
    </div>
  );
}