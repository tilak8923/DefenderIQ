
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    console.warn("DEPRECATED: The /api/ingest endpoint is no longer in use. Please use the updated Python collector script which connects directly to Firestore.");
    return NextResponse.json({ 
        message: "This endpoint is deprecated and no longer functional. Please update your collector script from the 'Collectors' page in the UI."
    }, { status: 410 }); // 410 Gone
}
