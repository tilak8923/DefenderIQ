'use client';

import { MainNav } from '@/components/nav';
import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { useUser } from '@/firebase';
import { useRouter }re-exported from this file.
- `useCollection`: A hook for subscribing to a Firestore collection.
- `useDoc`: A hook for subscribing to a Firestore document.
- `useUser`: A hook for accessing the current user's authentication state.
- `useFirebase`, `useFirebaseApp`, `useFirestore`, `useAuth`: Hooks for accessing Firebase service instances.
 */

'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type Auth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
  setDoc,
  doc,
  collection,
  writeBatch,
  getDoc,
} from 'firebase/firestore';
import { defaultAlertRules, sampleLogEntries, recentAlerts } from '@/lib/data';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Initializes the Firebase application.
 * This function is idempotent and can be safely called multiple times.
 * It attempts to initialize using environment variables first, falling back to the config object.
 * @returns An object containing the initialized Firebase app, auth, and firestore instances.
 */
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      firebaseApp = initializeApp();
    } catch (e) {
      if (process.env.NODE_ENV === 'production') {
        console.warn(
          'Automatic initialization failed. Falling back to firebase config object.',
          e
        );
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
    return getSdks(firebaseApp);
  }
  return getSdks(getApp());
}

/**
 * Retrieves the SDK instances from a Firebase app instance.
 * @param firebaseApp The Firebase app instance.
 * @returns An object containing the auth and firestore instances.
 */
export function getSdks(firebaseApp: FirebaseApp) {
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  return {
    firebaseApp,
    auth,
    firestore,
  };
}

/**
 * Signs in the user with Google using a popup.
 * After sign-in, it creates a user profile document in Firestore if one doesn't exist.
 * @param auth The Firebase Auth instance.
 */
export async function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Create user profile in Firestore if it doesn't exist
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const { displayName, email } = user;
      setDocumentNonBlocking(
        userRef,
        {
          id: user.uid,
          username: displayName,
          email: email,
          registrationDate: new Date().toISOString(),
        },
        { merge: true }
      );
      // Seed initial data for the new user
      await seedInitialData(user.uid);
    }
  } catch (error) {
    console.error('Error during Google sign-in:', error);
    // Handle specific error codes if needed
  }
}

/**
 * Signs out the current user.
 * @param auth The Firebase Auth instance.
 */
export function signOutUser(auth: Auth) {
  signOut(auth).catch((error) => {
    console.error('Error signing out:', error);
  });
}

/**
 * Seeds initial data for a new user, including default rules, logs, and alerts.
 * This function is idempotent and will not re-seed if the user has been initialized before.
 * @param userId The ID of the user to seed data for.
 */
async function seedInitialData(userId: string) {
  const userInitializedKey = `tsiem-user-initialized-${userId}`;
  if (localStorage.getItem(userInitializedKey)) {
    return; // User has already been initialized
  }

  const { firestore: db } = getSdks(getApp());
  const batch = writeBatch(db);

  // Add default alert rules
  const rulesCollection = collection(db, 'users', userId, 'alertRules');
  defaultAlertRules.forEach((rule) => {
    const newRuleRef = doc(rulesCollection);
    batch.set(newRuleRef, rule);
  });

  // Add sample logs
  const logsCollection = collection(db, 'users', userId, 'logs');
  sampleLogEntries.forEach((log) => {
    const newLogRef = doc(logsCollection);
    batch.set(newLogRef, log);
  });

  // Add initial alerts
  const alertsCollection = collection(db, 'users', userId, 'alerts');
  recentAlerts.forEach((alert) => {
    const newAlertRef = doc(alertsCollection);
    batch.set(newAlertRef, alert);
  });

  await batch.commit();
  localStorage.setItem(userInitializedKey, 'true');
}

/**
 * Non-blocking Firestore `setDoc` operation with centralized error handling.
 * @param docRef The DocumentReference to write to.
 * @param data The data to write.
 * @param options `SetOptions` for the operation.
 */
export function setDocumentNonBlocking(
  docRef: any,
  data: any,
  options: any
) {
  setDoc(docRef, data, options).catch((error) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'write',
        requestResourceData: data,
      })
    );
  });
}

// Re-export all necessary modules for easy consumption
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';

// Destructure for easy access in other files
const { firebaseApp, auth, firestore: db } = initializeFirebase();
export { firebaseApp, auth, db };
