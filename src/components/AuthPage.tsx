
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useNavigate } from 'react-router-dom';

interface AuthPageProps {
  onBack: () => void;
  initialMode?: 'signin' | 'signup';
}

// Function to get user-friendly error messages
const getAuthErrorMessage = (error: any, isLogin: boolean) => {
  if (!error) return 'An unknown error occurred';
  
  const errorCode = error.code || error.message;
  const errorMessage = error.message || '';
  
  // Common Supabase auth error codes
  switch (errorCode) {
    case 'Invalid login credentials':
    case 'invalid_grant':
      return 'Invalid email or password. Please check your credentials and try again.';
    
    case 'User not found':
    case 'user_not_found':
      return 'No account found with this email address. Please check your email or create a new account.';
    
    case 'Invalid email':
    case 'invalid_email':
      return 'Please enter a valid email address.';
    
    case 'Weak password':
    case 'weak_password':
      return 'Password is too weak. Please choose a stronger password (at least 6 characters).';
    
    case 'Email not confirmed':
    case 'email_not_confirmed':
      return 'Please check your email and click the confirmation link before signing in.';
    
    case 'Too many requests':
    case 'too_many_requests':
      return 'Too many login attempts. Please wait a few minutes before trying again.';
    
    case 'User already registered':
    case 'user_already_registered':
      return 'An account with this email already exists. Please sign in instead.';
    
    case 'Password should be at least 6 characters':
      return 'Password must be at least 6 characters long.';
    
    case 'Signup disabled':
      return 'Account creation is currently disabled. Please contact support.';
    
    default:
      // Check if the error message contains specific keywords
      if (errorMessage.toLowerCase().includes('password')) {
        return 'Invalid password. Please check your password and try again.';
      }
      if (errorMessage.toLowerCase().includes('email')) {
        return 'Invalid email address. Please check your email and try again.';
      }
      if (errorMessage.toLowerCase().includes('credentials')) {
        return 'Invalid email or password. Please check your credentials and try again.';
      }
      
      // Return the original error message if no specific case matches
      return errorMessage || 'An error occurred. Please try again.';
  }
};

export const AuthPage = ({ onBack, initialMode = 'signin' }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          const userFriendlyMessage = getAuthErrorMessage(error, true);
          toast({
            title: "Sign in failed",
            description: userFriendlyMessage,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You've been signed in successfully."
          });
          // Show loading screen and redirect to chatbot page
          setShowLoading(true);
          setTimeout(() => {
            navigate('/chatbot');
          }, 1000);
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          const userFriendlyMessage = getAuthErrorMessage(error, false);
          toast({
            title: "Sign up failed",
            description: userFriendlyMessage,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account."
          });
          // Redirect to payment page after successful signup
          setTimeout(() => {
            navigate('/payment');
          }, 1000);
        }
      }
    } catch (error) {
      const userFriendlyMessage = getAuthErrorMessage(error, isLogin);
      toast({
        title: "An error occurred",
        description: userFriendlyMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showLoading && (
        <LoadingScreen 
          message="Preparing your ChristTask dashboard..." 
          duration={2000}
          onComplete={() => setShowLoading(false)}
        />
      )}
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="py-6 px-6 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-900 dark:bg-slate-100 p-3 rounded-xl shadow-sm">
                <BookOpen className="h-6 w-6 text-slate-50 dark:text-slate-900" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                ChristTask
              </h1>
            </div>
            <Button
              onClick={onBack}
              variant="ghost"
              className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <X className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Auth Form */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-md">
          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-3xl overflow-hidden">
            <CardHeader className="text-center py-8">
              <CardTitle className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                {isLogin 
                  ? 'Sign in to access your ChristTask account' 
                  : 'Join ChristTask to defend your faith with confidence'
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Full Name
                    </label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      required={!isLogin}
                      className="w-full !bg-white !text-black border-slate-200 placeholder:text-gray-500"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full !bg-white !text-black border-slate-200 placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full !bg-white !text-black border-slate-200 placeholder:text-gray-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-amber-500 dark:bg-slate-100 dark:hover:bg-amber-500 text-slate-50 hover:text-slate-900 dark:text-slate-900 dark:hover:text-slate-900 text-lg py-6 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <BookOpen className="mr-3 h-5 w-5" />
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Need an account? <a href="/payment" className="text-blue-600 hover:text-blue-500 font-medium">Sign up on the payment page</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
    </>
  );
};
