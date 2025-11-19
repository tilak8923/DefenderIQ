'use client';

import { MainNav } from '@/components/nav';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  if (!user) {
    return null; // Don't render the layout if the user is not authenticated
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <main className="flex-grow p-4 lg:p-6">{children}</main>
    </div>
  );
}
