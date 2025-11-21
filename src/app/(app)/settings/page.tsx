
'use client';

import { useUser, useStorage } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';
import { Moon, Sun, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const storage = useStorage();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for forms
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const isPasswordProvider = user?.providerData.some(
    (provider) => provider.providerId === 'password'
  );
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    handleUpdateProfile(file);
  };

  const handleUpdateProfile = (file: File) => {
    if (!user) return;
    
    setIsUpdatingPhoto(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `profile-pictures/${user.uid}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        setIsUpdatingPhoto(false);
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: error.message,
        });
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          await updateProfile(user, { photoURL: downloadURL });
          toast({
            title: 'Profile Updated',
            description: 'Your profile picture has been changed.',
          });
          setIsUpdatingPhoto(false);
        }).catch((error) => {
          setIsUpdatingPhoto(false);
          toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not get the new image URL. ' + error.message,
          });
        });
      }
    );
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    if (newPassword !== confirmNewPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'New passwords do not match.' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Password Update Failed', description: error.message });
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  
  const handleSetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;

      if (newPassword !== confirmNewPassword) {
        toast({ variant: 'destructive', title: 'Error', description: 'Passwords do not match.' });
        return;
      }
      setIsUpdatingPassword(true);
      try {
        await updatePassword(user, newPassword);
        toast({ title: 'Password Set', description: 'You can now sign in with your email and new password.' });
        setNewPassword('');
        setConfirmNewPassword('');
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Failed to Set Password', description: error.message });
      } finally {
        setIsUpdatingPassword(false);
      }
  };

  if (isUserLoading) {
    return (
        <div>
            <h1 className="text-2xl font-bold tracking-wider mb-4">Settings</h1>
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>User Profile</CardTitle>
                        <CardDescription>Your personal account information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>Customize the look and feel of the application.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div>
        <h1 className="text-2xl font-bold tracking-wider mb-4">Settings</h1>
        <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>User Profile</CardTitle>
                    <CardDescription>Manage your personal account information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-semibold">{user.displayName || 'Anonymous User'}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                     <div className="space-y-4">
                        <Label>Profile Picture</Label>
                        <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        <Button onClick={handleFileSelect} disabled={isUpdatingPhoto}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                        </Button>
                        {isUpdatingPhoto && (
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Uploading...</p>
                                <Progress value={uploadProgress} className="w-full" />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your password and security settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isPasswordProvider ? (
                        <form onSubmit={handleChangePassword} className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                                <Input id="confirm-new-password" type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required />
                            </div>
                            <Button type="submit" disabled={isUpdatingPassword}>
                                {isUpdatingPassword ? 'Changing...' : 'Change Password'}
                            </Button>
                        </form>
                    ) : (
                         <form onSubmit={handleSetPassword} className="space-y-4">
                            <p className="text-sm text-muted-foreground">You are signed in with a social provider. You can set a password to also sign in with your email.</p>
                            <div className="space-y-2">
                                <Label htmlFor="set-password">New Password</Label>
                                <Input id="set-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="confirm-set-password">Confirm New Password</Label>
                                <Input id="confirm-set-password" type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required />
                            </div>
                            <Button type="submit" disabled={isUpdatingPassword}>
                                {isUpdatingPassword ? 'Setting...' : 'Set Password'}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>

            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Switch between light and dark themes.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between p-6">
                    <p className="font-medium">Theme</p>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    >
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
