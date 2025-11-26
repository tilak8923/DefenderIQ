'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
  writeBatch,
  doc,
  collection,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';
import { initializeFirebase } from './index';
import { defaultAlertRules, sampleLogEntries, recentAlerts } from '@/lib/data';


/**
 * Seeds initial data for a new user, including default rules, logs, and alerts.
 * This function is idempotent and will not re-seed if the user has been initialized before.
 * @param userId The ID of the user to seed data for.
 */
export async function seedInitialData(userId: string) {
  const { firestore } = initializeFirebase();
  const userInitializedKey = `tsiem-user-initialized-${userId}`;
  if (localStorage.getItem(userInitializedKey)) {
    return; // User has already been initialized
  }

  const batch = writeBatch(firestore);

  // Add default alert rules
  const rulesCollection = collection(firestore, 'users', userId, 'alertRules');
  defaultAlertRules.forEach((rule) => {
    const newRuleRef = doc(rulesCollection);
    batch.set(newRuleRef, rule);
  });

  // Add sample logs
  const logsCollection = collection(firestore, 'users', userId, 'logs');
  sampleLogEntries.forEach((log) => {
    const newLogRef = doc(logsCollection);
    batch.set(newLogRef, log);
  });

  // Add initial alerts
  const alertsCollection = collection(firestore, 'users', userId, 'alerts');
  recentAlerts.forEach((alert) => {
    const newAlertRef = doc(alertsCollection);
    batch.set(newAlertRef, alert);
  });

  await batch.commit();
  localStorage.setItem(userInitializedKey, 'true');
}



/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  setDoc(docRef, data, options).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'write', // or 'create'/'update' based on options
        requestResourceData: data,
      })
    )
  })
  // Execution continues immediately
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally.
 * Returns the Promise for the new doc ref, but typically not awaited by caller.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const promise = addDoc(colRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      )
    });
  return promise;
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      )
    });
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      )
    });
}
