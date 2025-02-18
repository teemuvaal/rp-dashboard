import { NextResponse } from 'next/server';
import { processEmbeddingQueue } from '@/utils/embeddings';

export async function POST() {
    try {
        const result = await processEmbeddingQueue();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in embedding processing:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 