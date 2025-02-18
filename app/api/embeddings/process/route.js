import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

export async function POST() {
    console.log('Processing endpoint called');
    try {
        console.log('Starting queue processing...');
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        // Fetch pending embeddings
        console.log('Fetching pending embeddings...');
        const { data: pendingEmbeddings, error: fetchError } = await supabase
            .from('content_embeddings')
            .select(`
                *,
                campaigns:campaign_id (owner_id)
            `)
            .eq('status', 'pending')
            .order('content_type, content_id, chunk_index')
            .limit(20);

        if (fetchError) {
            console.error('Error fetching pending embeddings:', fetchError);
            throw fetchError;
        }

        console.log(`Found ${pendingEmbeddings?.length || 0} pending embeddings:`, 
            pendingEmbeddings?.map(e => ({ 
                id: e.id, 
                content_type: e.content_type, 
                content_id: e.content_id,
                chunk_index: e.chunk_index,
                total_chunks: e.total_chunks
            }))
        );

        if (!pendingEmbeddings || pendingEmbeddings.length === 0) {
            return NextResponse.json({ message: 'No pending embeddings to process' });
        }

        // Group embeddings by content to process chunks together
        const groupedEmbeddings = pendingEmbeddings.reduce((groups, item) => {
            const key = `${item.content_type}:${item.content_id}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {});

        // Process each group of chunks
        const results = [];
        for (const [contentKey, chunks] of Object.entries(groupedEmbeddings)) {
            console.log(`Processing chunks for ${contentKey}`);
            
            // Process chunks in sequence to maintain order
            for (const item of chunks) {
                try {
                    console.log(`Processing chunk ${item.chunk_index + 1}/${item.total_chunks} for ${contentKey}`);
                    
                    const { embedding } = await embed({
                        model: openai.embedding('text-embedding-3-small'),
                        value: item.content_text,
                    });

                    console.log(`Generated embedding for chunk ${item.chunk_index + 1}`);

                    const { error: updateError } = await supabase
                        .from('content_embeddings')
                        .update({
                            embedding,
                            status: 'completed',
                            last_processed_at: new Date().toISOString(),
                        })
                        .eq('id', item.id);

                    if (updateError) {
                        console.error(`Error updating embedding ${item.id}:`, updateError);
                        throw updateError;
                    }

                    console.log(`Successfully updated chunk ${item.chunk_index + 1}`);
                    results.push({ 
                        id: item.id, 
                        content_key: contentKey,
                        chunk_index: item.chunk_index,
                        status: 'success' 
                    });
                } catch (error) {
                    console.error(`Error processing chunk ${item.chunk_index + 1} for ${contentKey}:`, error);
                    
                    try {
                        const { error: statusError } = await supabase
                            .from('content_embeddings')
                            .update({
                                status: 'failed',
                                error_message: error.message,
                                last_processed_at: new Date().toISOString(),
                            })
                            .eq('id', item.id);

                        if (statusError) {
                            console.error(`Error updating failure status for ${item.id}:`, statusError);
                        }
                    } catch (updateError) {
                        console.error(`Critical error updating failure status for ${item.id}:`, updateError);
                    }

                    results.push({ 
                        id: item.id, 
                        content_key: contentKey,
                        chunk_index: item.chunk_index,
                        status: 'error', 
                        error: error.message 
                    });
                }
            }
        }

        const summary = {
            total: results.length,
            successful: results.filter(r => r.status === 'success').length,
            failed: results.filter(r => r.status === 'error').length,
            results: results.reduce((groups, result) => {
                if (!groups[result.content_key]) {
                    groups[result.content_key] = {
                        chunks_processed: 0,
                        chunks_failed: 0,
                        chunk_results: []
                    };
                }
                groups[result.content_key].chunks_processed++;
                if (result.status === 'error') {
                    groups[result.content_key].chunks_failed++;
                }
                groups[result.content_key].chunk_results.push(result);
                return groups;
            }, {})
        };

        console.log('Processing summary:', summary);
        return NextResponse.json(summary);
    } catch (error) {
        console.error('Error in embedding processing:', error);
        return NextResponse.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
} 