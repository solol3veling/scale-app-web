import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import logoImage from "@/assets/logo.png";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate("/");
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          navigate("/");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);


  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    try {
      // Use Supabase's built-in OTP functionality for passwordless authentication
      // This will automatically create the user if they don't exist
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // Auto-create user if they don't exist
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to send OTP email');
      }

      setIsOtpSent(true);
      toast({
        title: "Check your email",
        description: "We've sent you a 6-digit verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return;

    setIsLoading(true);

    try {
      // Verify the OTP using Supabase's built-in verification
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      
      if (error) {
        throw new Error(error.message || "Invalid verification code");
      }

      toast({
        title: "Welcome!",
        description: "You've been successfully authenticated.",
      });
    } catch (error: any) {
      toast({
        title: "Invalid code",
        description: "Please check your code and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setIsOtpSent(false);
    setOtp("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto">
            <img 
              src={logoImage} 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-normal text-foreground mb-2">
              {isOtpSent ? "Enter verification code" : "Sign in to your account"}
            </h1>
            {isOtpSent && (
              <p className="text-muted-foreground text-sm">
                We sent a 6-digit code to {email}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {!isOtpSent ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base border border-border rounded-lg px-4 focus:border-ring focus:ring-1 focus:ring-ring transition-colors"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending code...
                  </>
                ) : (
                "Continue with email"
                )}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-4 text-muted-foreground font-medium tracking-wide">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-12 text-base font-medium border border-border hover:bg-accent transition-colors"
                onClick={handleGoogleAuth}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    className="gap-2"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-12 text-lg font-semibold border border-border rounded-lg focus:border-ring focus:ring-1 focus:ring-ring" />
                      <InputOTPSlot index={1} className="w-12 h-12 text-lg font-semibold border border-border rounded-lg focus:border-ring focus:ring-1 focus:ring-ring" />
                      <InputOTPSlot index={2} className="w-12 h-12 text-lg font-semibold border border-border rounded-lg focus:border-ring focus:ring-1 focus:ring-ring" />
                      <InputOTPSlot index={3} className="w-12 h-12 text-lg font-semibold border border-border rounded-lg focus:border-ring focus:ring-1 focus:ring-ring" />
                      <InputOTPSlot index={4} className="w-12 h-12 text-lg font-semibold border border-border rounded-lg focus:border-ring focus:ring-1 focus:ring-ring" />
                      <InputOTPSlot index={5} className="w-12 h-12 text-lg font-semibold border border-border rounded-lg focus:border-ring focus:ring-1 focus:ring-ring" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </form>

              <div className="text-center space-y-3">
                <Button
                  variant="ghost"
                  onClick={handleBackToEmail}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors p-0 h-auto"
                >
                  ← Back
                </Button>
                <div className="text-sm text-muted-foreground">
                  Didn't receive a code?{" "}
                  <Button
                    variant="ghost"
                    onClick={handleEmailSubmit}
                    disabled={isLoading}
                    className="text-primary hover:text-primary/80 p-0 h-auto font-medium underline-offset-4 hover:underline"
                  >
                    Send again
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <button className="text-primary hover:underline">Terms</button>
          {" "}and{" "}
          <button className="text-primary hover:underline">Privacy Policy</button>
        </div>
      </div>
    </div>
  );
}