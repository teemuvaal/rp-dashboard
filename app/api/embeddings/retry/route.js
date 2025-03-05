import { NextResponse } from 'next/server';
import { retryEmbedding } from '@/utils/embeddings';
import { embedRetryLimiter } from '@/utils/rate-limit';
import { headers } from 'next/headers';

export async function POST(req) {
    try {
        const headersList = headers();
        const ip = headersList.get('x-forwarded-for') || 'anonymous';
        const contentType = headersList.get('content-type');

        // Check rate limit
        const { success, limit, reset, remaining } = await embedRetryLimiter.limit(ip);
        
        if (!success) {
            return NextResponse.json(
                { 
                    error: 'Rate limit exceeded',
                    reset: reset,
                    limit: limit,
                },
                { 
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': remaining.toString(),
                        'X-RateLimit-Reset': reset.toString(),
                    }
                }
            );
        }

        if (contentType !== 'application/json') {
            return NextResponse.json(
                { error: 'Content-Type must be application/json' },
                { status: 415 }
            );
        }

        const { contentType: type, contentId } = await req.json();

        if (!type || !contentId) {
            return NextResponse.json(
                { error: 'Content type and ID are required' },
                { status: 400 }
            );
        }

        const result = await retryEmbedding(type, contentId);
        
        return NextResponse.json(result, {
            headers: {
                'X-RateLimit-Limit': limit.toString(),
                'X-RateLimit-Remaining': remaining.toString(),
                'X-RateLimit-Reset': reset.toString(),
            }
        });
    } catch (error) {
        console.error('Error in retry endpoint:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to retry embedding' },
            { status: 500 }
        );
    }
} 