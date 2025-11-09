
import { NextResponse } from 'next/server';
import { parseLogEntries } from '@/ai/flows/parse-log-entries';
import { initializeFirebase } from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';

export async function POST(request: Request) {
  const { firestore } = initializeFirebase();
  try {
    const body = await request.json();
    const { userId, logs } = body;

    if (!userId || !logs) {
      return NextResponse.json({ message: 'Missing userId or logs in request body' }, { status: 400 });
    }

    if (typeof logs !== 'string' || logs.trim() === '') {
        return NextResponse.json({ message: 'Log data must be a non-empty string.' }, { status: 400 });
    }

    // Use the AI flow to parse the raw log text
    const { parsedLogs } = await parseLogEntries({ logText: logs });
    
    if (!parsedLogs || parsedLogs.length === 0) {
        return NextResponse.json({ message: 'AI failed to parse any valid log entries from the provided text.' }, { status: 400 });
    }

    // Write the parsed logs to Firestore under the user's ID
    const batch = writeBatch(firestore);
    const logsCollection = collection(firestore, 'users', userId, 'logs');
    
    parsedLogs.forEach(log => {
      const docRef = doc(logsCollection); // Create a new doc with a unique ID
      batch.set(docRef, log);
    });
    
    await batch.commit();

    return NextResponse.json({ 
        message: `Successfully ingested ${parsedLogs.length} log entries.`,
        ingestedCount: parsedLogs.length 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Ingestion API Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.', error: error.message }, { status: 500 });
  }
}
