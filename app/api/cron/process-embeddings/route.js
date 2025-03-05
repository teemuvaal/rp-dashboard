import { NextResponse } from 'next/server';
import { processEmbeddingQueue } from '@/utils/embeddings';

// This endpoint should be called by a cron job service (e.g., Vercel Cron)
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // Verify the request is from our cron service
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Process the embedding queue
        const result = await processEmbeddingQueue();

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in cron job:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 