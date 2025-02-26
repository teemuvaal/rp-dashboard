import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    console.log('Embeddings status endpoint called');
    const supabase = createClient();

    try {
        // Get counts for different embedding statuses
        const { data: statusCounts, error: countError } = await supabase
            .from('content_embeddings')
            .select('status, count(*)')
            .group('status');

        if (countError) {
            console.error('Error fetching embedding status counts:', countError);
            throw countError;
        }

        // Get the most recent pending items
        const { data: pendingItems, error: pendingError } = await supabase
            .from('content_embeddings')
            .select(`
                id, 
                content_type, 
                content_id, 
                chunk_index, 
                created_at, 
                last_processed_at
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5);

        if (pendingError) {
            console.error('Error fetching pending items:', pendingError);
            throw pendingError;
        }

        // Get the most recent failed items
        const { data: failedItems, error: failedError } = await supabase
            .from('content_embeddings')
            .select(`
                id, 
                content_type, 
                content_id, 
                chunk_index, 
                error_message, 
                last_processed_at
            `)
            .eq('status', 'failed')
            .order('last_processed_at', { ascending: false })
            .limit(5);

        if (failedError) {
            console.error('Error fetching failed items:', failedError);
            throw failedError;
        }

        // Convert status counts to a more usable format
        const countsByStatus = statusCounts.reduce((acc, item) => {
            acc[item.status] = parseInt(item.count);
            return acc;
        }, {});

        // Calculate total
        const total = Object.values(countsByStatus).reduce((sum, count) => sum + count, 0);

        return NextResponse.json({
            pending: countsByStatus.pending || 0,
            completed: countsByStatus.completed || 0,
            failed: countsByStatus.failed || 0,
            total,
            recentPending: pendingItems,
            recentFailed: failedItems
        });
    } catch (error) {
        console.error('Error in embedding status endpoint:', error);
        return NextResponse.json({ 
            error: error.message 
        }, { status: 500 });
    }
} 