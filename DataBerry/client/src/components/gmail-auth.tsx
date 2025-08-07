import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GmailAPI } from "@/lib/gmail-api";
import { useToast } from "@/hooks/use-toast";
import { Mail, Shield, Database, Sparkles } from "lucide-react";
import appIconPath from "@assets/1752568649408_1753356371508.png";

interface GmailAuthProps {
  onAuthSuccess: (user: any) => void;
}

export default function GmailAuth({ onAuthSuccess }: GmailAuthProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { toast } = useToast();

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    
    try {
      const gmailAPI = GmailAPI.getInstance();
      const authResponse = await gmailAPI.authenticate();
      
      // Send auth data to backend
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: authResponse.email,
          googleId: authResponse.id,
          accessToken: authResponse.access_token,
          refreshToken: authResponse.refresh_token,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate');
      }

      const { user } = await response.json();
      
      // Set access token for future API calls
      gmailAPI.setAccessToken(authResponse.access_token);
      
      toast({
        title: "Authentication successful",
        description: "Connected to Gmail successfully",
      });
      
      onAuthSuccess(user);
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Failed to connect to Gmail",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-pink-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 via-cyan-100/20 to-pink-100/20"></div>
      <Card className="w-full max-w-lg shadow-modern-lg border-0 relative z-10">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-6 relative">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 via-cyan-600 to-pink-600 p-1">
              <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
                <img 
                  src={appIconPath} 
                  alt="Finance Manager" 
                  className="w-12 h-12 rounded-lg"
                />
              </div>
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-cyan-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Gmail Finance Manager
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">
            Seamlessly organize and manage your financial emails with AI-powered insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200">
              <div className="flex-shrink-0">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-purple-900">Secure Authentication</p>
                <p className="text-sm text-purple-700">Google OAuth 2.0 protection</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-cyan-100 border border-cyan-200">
              <div className="flex-shrink-0">
                <Database className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <p className="font-medium text-cyan-900">Smart Organization</p>
                <p className="text-sm text-cyan-700">Auto-categorize financial documents</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <p className="font-medium text-pink-900">Custom Filters</p>
                <p className="text-sm text-pink-700">Create personalized email rules</p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleAuthenticate}
            disabled={isAuthenticating}
            className="w-full h-12 text-lg font-semibold bg-purple-gradient hover:shadow-lg transition-all duration-200 border-0"
          >
            {isAuthenticating ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Connect Gmail Account</span>
              </div>
            )}
          </Button>
          
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            By connecting, you authorize this application to access your Gmail account for organizing financial emails. 
            Your data is processed securely and never shared with third parties.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
