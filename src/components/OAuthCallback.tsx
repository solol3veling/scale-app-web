import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { oauthApi } from '@/services/api/oauth';

export function OAuthCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for OAuth1 (Twitter) parameters
        const oauthVerifier = searchParams.get('oauth_verifier');
        
        // Check for OAuth2 parameters
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        // Check for errors
        const denied = searchParams.get('denied');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for authorization denial or errors
        if (denied) {
          sendMessageToParent('UNAUTHORIZED', 'Authorization was denied or cancelled');
          return;
        }

        if (error) {
          sendMessageToParent('ERROR', errorDescription || error);
          return;
        }

        // Handle OAuth1 flow (Twitter)
        if (oauthVerifier) {
          // Get the oauth_request_token from cookies
          const cookies = document.cookie.split(';');
          let oauthRequestToken = null;
          
          for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'oauth_request_token' || name === 'oauth1_state') {
              oauthRequestToken = value;
              break;
            }
          }

          // Complete the OAuth1 flow
          const response = await oauthApi.completeJson({
            oauth_verifier: oauthVerifier,
            oauth_request_token: oauthRequestToken
          });

          sendMessageToParent('OK', 'Account connected successfully');
          return;
        }

        // Handle OAuth2 flow (Facebook, Instagram, LinkedIn)
        if (code) {
          // Extract platform from state or URL
          const platform = state || searchParams.get('platform') || 'unknown';
          
          // Complete OAuth2 flow - now works the same as OAuth1
          const response = await oauthApi.completeOAuth2(platform, code, state);

          // Send success message to parent window (same as OAuth1)
          sendMessageToParent('OK', 'Account connected successfully');
          return;
        }

        // If we get here, neither OAuth1 nor OAuth2 parameters were found
        sendMessageToParent('ERROR', 'Missing OAuth parameters');

      } catch (error) {
        console.error('OAuth callback error:', error);
        sendMessageToParent('ERROR', error instanceof Error ? error.message : 'OAuth connection failed');
      }
    };

    const sendMessageToParent = (status: string, message: string, additionalData?: any) => {
      if (window.opener && !window.opener.closed) {
        try {
          const messageData = { status, message, ...additionalData };
          window.opener.postMessage(messageData, window.location.origin);
          console.log('OAuth callback: Message sent to parent:', messageData);
        } catch (error) {
          console.error('OAuth callback: Failed to send message to parent:', error);
        }
        // Close the popup after a short delay
        setTimeout(() => {
          window.close();
        }, 1000);
      } else {
        console.warn('OAuth callback: No valid parent window found');
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 p-8 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">
            Connecting Your Account
          </h2>
          <p className="text-gray-600">
            Please wait while we complete the connection...
          </p>
        </div>
        
        {/* Status indicators */}
        <div className="flex justify-center space-x-4 text-sm">
          <div className="flex items-center space-x-2 text-blue-600">
            <CheckCircle className="h-4 w-4" />
            <span>Authenticating</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="h-4 w-4 border-2 border-gray-300 rounded-full"></div>
            <span>Completing</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500">
          This window will close automatically when done.
        </p>
      </div>
    </div>
  );
}