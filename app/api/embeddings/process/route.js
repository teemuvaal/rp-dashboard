import { NextResponse } from 'next/server';
import { processEmbeddings } from '@/app/dashboard/actions';

export async function POST() {
    console.log('Processing endpoint called');

    try {
        const result = await processEmbeddings();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in embedding processing:', error);
        return NextResponse.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
} 