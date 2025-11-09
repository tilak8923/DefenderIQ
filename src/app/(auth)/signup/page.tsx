'use client';

import { useState } from 'react';
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
import { Chrome } from 'lucide-react';
import Link from 'next/link';
import { initiateEmailSignUp, signInWithGoogle, auth } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';


export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { toast } = useToast();
    const router = useRouter();
    const { user, isUserLoading } = useUser();

    if (isUserLoading) {
        return <div>Loading...</div>;
    }

    if(user){
        router.push('/dashboard');
        return null;
    }

    const handleEmailSignup = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast({
                variant: 'destructive',
                title: 'Signup Failed',
                description: 'Passwords do not match.',
            });
            return;
        }
        initiateEmailSignUp(auth, email, password)
            .catch(error => {
                toast({
                    variant: 'destructive',
                    title: 'Signup Failed',
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

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>
                Get started with your security dashboard in minutes.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleEmailSignup} className="space-y-4">
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
                <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                </div>
                <Button type="submit" className="w-full">
                Create Account
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
             <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
                <Chrome className="mr-2 h-4 w-4" />
                Google
            </Button>
            </CardContent>
            <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline">
                Sign In
                </Link>
            </p>
            </CardFooter>
        </Card>
        </div>
    );
}
