'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // Always redirect to the landing page.
    // The landing page will handle the user's next steps.
    if (!isUserLoading) {
      router.replace('/landing');
    }
  }, [isUserLoading, router]);

  // You can optionally show a loading spinner here
  return <div>Loading...</div>;
}
