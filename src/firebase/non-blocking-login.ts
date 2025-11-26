'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { initializeFirebase } from './index';
import { seedInitialData } from './non-blocking-updates';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<void> {
  return signInAnonymously(authInstance).then(() => {});
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string
): Promise<void> {
  const { firestore } = initializeFirebase();
  return createUserWithEmailAndPassword(authInstance, email, password).then(
    async (userCredential) => {
      const user = userCredential.user;
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        id: user.uid,
        email: user.email,
        registrationDate: new Date().toISOString(),
      });
      await seedInitialData(user.uid);
    }
  );
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(
  authInstance: Auth,
  email: string,
  password: string
): Promise<void> {
  return signInWithEmailAndPassword(authInstance, email, password).then(
    () => {}
  );
}

/** Signs in the user with Google using a popup. */
export async function signInWithGoogle(auth: Auth) {
  const { firestore } = initializeFirebase();
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        id: user.uid,
        username: user.displayName,
        email: user.email,
        registrationDate: new Date().toISOString(),
      });
      await seedInitialData(user.uid);
    }
  } catch (error) {
    console.error('Error during Google sign-in:', error);
    throw error;
  }
}

/** Signs in the user with GitHub using a popup. */
export async function signInWithGitHub(auth: Auth) {
  const { firestore } = initializeFirebase();
  const provider = new GithubAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        id: user.uid,
        username: user.displayName,
        email: user.email,
        registrationDate: new Date().toISOString(),
      });
      await seedInitialData(user.uid);
    }
  } catch (error) {
    console.error('Error during GitHub sign-in:', error);
    throw error;
  }
}

/** Signs out the current user. */
export function signOutUser(auth: Auth) {
  return signOut(auth);
}

export * from '@/firebase/index';
