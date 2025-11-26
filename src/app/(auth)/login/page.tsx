
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Chrome, Github } from 'lucide-react';
import Link from 'next/link';
import {
  initiateEmailSignIn,
  signInWithGoogle,
  signInWithGitHub,
} from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import Image from 'next/image';
import { useTheme } from 'next-themes';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { toast } = useToast();
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
      if (!isUserLoading && user) {
        router.push('/dashboard');
      }
    }, [user, isUserLoading, router]);

    if (isUserLoading || user) {
        return <div>Loading...</div>;
    }


    const handleEmailLogin = (e: React.FormEvent) => {
        e.preventDefault();
        initiateEmailSignIn(auth, email, password)
            .catch(error => {
                toast({
                    variant: 'destructive',
                    title: 'Login Failed',
                    description: error.message,
                });
            });
    };

    const handleGoogleLogin = () => {
        signInWithGoogle(auth)
            .catch(error => {
                 toast({
                    variant: 'destructive',
                    title: 'Google Sign-In Failed',
                    description: error.message,
                });
            })
    }

    const handleGitHubLogin = () => {
      signInWithGitHub(auth).catch((error) => {
        toast({
          variant: 'destructive',
          title: 'GitHub Sign-In Failed',
          description: error.message,
        });
      });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md relative">
            <div className="absolute top-4 left-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/landing" aria-label="Back to landing page">
                        {mounted && (
                            <Image 
                                src={theme === 'dark' ? '/logo.png' : '/logo2.png'} 
                                alt="DefendIQ Logo" 
                                width={45} 
                                height={45} 
                            />
                        )}
                    </Link>
                </Button>
            </div>
            <CardHeader className="text-center pt-12">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to access your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                </div>
                <Button type="submit" className="w-full">
                Sign In
                </Button>
            </form>
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleGoogleLogin}>
                  <Chrome className="mr-2 h-4 w-4" />
                  Google
              </Button>
              <Button variant="outline" onClick={handleGitHubLogin}>
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
              </Button>
            </div>
            </CardContent>
            <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-primary hover:underline">
                Sign Up
                </Link>
            </p>
            </CardFooter>
        </Card>
        </div>
    );
}

    