import { useState } from 'react';
import { Lock, User, LogIn, ArrowLeft, Home, Eye, EyeOff, Sparkles, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useAdminAuth } from './AdminAuth';

interface AdminLoginProps {
  onLogin: (isAuthenticated: boolean, email?: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { toast } = useToast();
  const { signIn } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(credentials.email, credentials.password);

      if (error) {
        setLoginAttempts(prev => prev + 1);
        toast({
          title: "Authentication Failed",
          description: "Invalid email or password. Please check your credentials and try again.",
          variant: "destructive"
        });
        setCredentials(prev => ({ ...prev, password: '' }));
      } else {
        // Success
        localStorage.setItem('zionworks_admin_authenticated', 'true');
        localStorage.setItem('zionworks_admin_email', credentials.email.trim().toLowerCase());
        localStorage.setItem('zionworks_admin_login_time', new Date().toISOString());
        
        onLogin(true, credentials.email.trim().toLowerCase());
        
        toast({
          title: "Welcome Back! 👋",
          description: "Successfully logged in to your admin dashboard."
        });
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast({
        title: "System Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary/30 flex flex-col">
      {/* Navigation Header */}
      <motion.header 
        className="p-4 md:p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={handleBackToHome}
            className="text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Website
          </Button>
          
          <div className="flex items-center space-x-2">
            <img src="/favicon.png" alt="Zion Works icon" className="w-6 h-6" loading="lazy" />
            <span className="text-xl font-bold text-primary-foreground">Zion Works</span>
          </div>
          
          <Button
            variant="outline"
            onClick={handleBackToHome}
            className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur">
            <CardHeader className="text-center space-y-4 pb-6">
              <motion.div 
                className="flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.4 }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="w-10 h-10 text-primary" />
                </div>
              </motion.div>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-primary">Admin Portal</h1>
                <p className="text-muted-foreground">
                  Secure access to your Zion Works dashboard
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {loginAttempts >= 3 && (
                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/50">
                  <Lock className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    Multiple failed attempts detected. Please ensure you're using the correct credentials.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-primary">
                    Email Address
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      value={credentials.email}
                      onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                      placeholder="Enter your admin email"
                      className="pl-11 h-12 bg-background/50 border-muted focus:border-secondary transition-colors"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-primary">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                      placeholder="Enter your password"
                      className="pl-11 pr-11 h-12 bg-background/50 border-muted focus:border-secondary transition-colors"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary text-primary font-semibold text-base shadow-lg transition-all duration-200 hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
                      Authenticating...
                    </div>
                  ) : (
                    <>
                      <LogIn className="mr-2 w-5 h-5" />
                      Sign In to Dashboard
                    </>
                  )}
                </Button>
              </form>

              {/* Security Notice */}
              <div className="pt-4 border-t border-border">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-medium text-primary">Security Notice</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This is a secure admin portal. All login attempts are monitored and logged. 
                    If you don't have admin access, please return to the main website.
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Additional Info */}
          <motion.div 
            className="text-center mt-6 text-primary-foreground/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-sm">
              Need help? Contact support at{' '}
              <a 
                href="mailto:contactus@zionworks.dev" 
                className="text-secondary hover:text-secondary/80 underline transition-colors"
              >
                contactus@zionworks.dev
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;