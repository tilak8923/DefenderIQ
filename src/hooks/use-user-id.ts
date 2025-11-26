'use client';

import { useUser } from '@/firebase';

/**
 * A hook that returns the UID of the currently authenticated Firebase user.
 * It replaces the previous local storage-based ID system.
 * @returns The user's UID, or null if the user is not authenticated or loading.
 */
export function useUserId() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return null; // Return null while authentication state is being determined
  }
  
  return user ? user.uid : null;
}
