
import { NextResponse } from 'next/server';
import { parseLogEntries } from '@/ai/flows/parse-log-entries';
import { initializeFirebase } from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';

// This is the most important change. It tells Next.js to treat this as a fully dynamic
// API endpoint, which is necessary for handling POST requests from non-browser clients.
export const dynamic = 'force-dynamic';

const INGESTION_API_KEY = "a-super-secret-and-unique-key-for-ingestion";

export async function POST(request: Request) {
  // 1. Authenticate the request with the secret API key
  const apiKey = request.headers.get('Authorization')?.split(' ')[1];
  if (apiKey !== INGESTION_API_KEY) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

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

    // 2. Use the AI flow to parse the raw log text
    const { parsedLogs } = await parseLogEntries({ logText: logs });
    
    if (!parsedLogs || parsedLogs.length === 0) {
        return NextResponse.json({ message: 'AI failed to parse any valid log entries from the provided text.' }, { status: 400 });
    }

    // 3. Write the parsed logs to Firestore under the user's ID
    const batch = writeBatch(firestore);
    const logsCollection = collection(firestore, 'users', userId, 'logs');
    
    parsedLogs.forEach(log => {
      const docRef = doc(logsCollection); // Create a new doc with a unique ID
      const logWithUser = { ...log, userId }; // Ensure userId is in the log data for rule validation
      batch.set(docRef, logWithUser);
    });
    
    await batch.commit();

    // The response headers are crucial for external clients.
    const headers = {
        'Access-Control-Allow-Origin': '*', // Allow requests from any origin
        'Cache-Control': 'no-store', // Prevent caching of this API response
    };

    return NextResponse.json({ 
        message: `Successfully ingested ${parsedLogs.length} log entries.`,
        ingestedCount: parsedLogs.length 
    }, { status: 200, headers });

  } catch (error: any) {
    console.error('Ingestion API Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.', error: error.message }, { status: 500 });
  }
}
