import { openai } from '@ai-sdk/openai';
import { embed, embedMany } from 'ai';
import { createClient } from '@/utils/supabase/server';

/**
 * Search for similar content using embeddings
 * @param {string} query - The search query
 * @param {string} campaignId - The campaign ID to search within
 * @param {number} limit - Maximum number of results to return
 * @param {string[]} contentTypes - Array of content types to search (e.g., ['note', 'asset'])
 * @returns {Promise<Array>} Array of similar content items
 */
export async function searchSimilarContent(query, campaignId, limit = 5, contentTypes = null) {
    const supabase = createClient();

    try {
        // Generate embedding for the search query using AI SDK
        const { embedding: queryEmbedding } = await embed({
            model: openai.embedding('text-embedding-3-small'),
            value: query,
        });

        // Construct the base query
        let similarityQuery = supabase
            .from('content_embeddings')
            .select(`
                *,
                similarity:1-(embedding <=> '${JSON.stringify(queryEmbedding)}')
            `)
            .eq('campaign_id', campaignId)
            .eq('status', 'completed')
            .order('similarity', { ascending: false })
            .limit(limit);

        // Add content type filter if specified
        if (contentTypes && contentTypes.length > 0) {
            similarityQuery = similarityQuery.in('content_type', contentTypes);
        }

        const { data: similarContent, error } = await similarityQuery;

        if (error) {
            console.error('Error searching similar content:', error);
            throw error;
        }

        return similarContent;
    } catch (error) {
        console.error('Error in searchSimilarContent:', error);
        throw error;
    }
}

/**
 * Process a batch of pending embeddings
 * @param {Array} items - Array of items to process
 * @returns {Promise<Array>} Array of processed results
 */
async function processBatch(items) {
    const supabase = createClient();

    try {
        console.log('Processing batch of', items.length, 'items');
        
        // Use embedMany for batch processing
        const embeddings = await Promise.all(items.map(async (item) => {
            try {
                const { embedding } = await embed({
                    model: openai.embedding('text-embedding-3-small'),
                    value: item.content_text,
                });
                return embedding;
            } catch (error) {
                console.error(`Error generating embedding for item ${item.id}:`, error);
                throw error;
            }
        }));

        console.log('Generated embeddings for', embeddings.length, 'items');

        // Update each item with its embedding
        const results = await Promise.all(items.map(async (item, index) => {
            try {
                const { error: updateError } = await supabase
                    .from('content_embeddings')
                    .update({
                        embedding: embeddings[index],
                        status: 'completed',
                        last_processed_at: new Date().toISOString(),
                    })
                    .eq('id', item.id);

                if (updateError) throw updateError;

                console.log(`Successfully updated embedding for item ${item.id}`);
                return {
                    id: item.id,
                    status: 'success'
                };
            } catch (error) {
                console.error(`Error updating embedding for item ${item.id}:`, error);
                
                await supabase
                    .from('content_embeddings')
                    .update({
                        status: 'failed',
                        error_message: error.message,
                        last_processed_at: new Date().toISOString(),
                    })
                    .eq('id', item.id);

                return {
                    id: item.id,
                    status: 'error',
                    error: error.message
                };
            }
        }));

        return results;
    } catch (error) {
        console.error('Error in batch processing:', error);
        throw error;
    }
}

/**
 * Process the embedding queue
 * @returns {Promise<void>}
 */
export async function processEmbeddingQueue() {
    const supabase = createClient();
    const BATCH_SIZE = 10;

    try {
        // Fetch pending embeddings
        const { data: pendingEmbeddings, error: fetchError } = await supabase
            .from('content_embeddings')
            .select('*')
            .eq('status', 'pending')
            .limit(BATCH_SIZE);

        if (fetchError) {
            console.error('Error fetching pending embeddings:', fetchError);
            throw fetchError;
        }

        if (!pendingEmbeddings || pendingEmbeddings.length === 0) {
            return { message: 'No pending embeddings to process' };
        }

        const results = await processBatch(pendingEmbeddings);

        return {
            processed: results.length,
            results
        };
    } catch (error) {
        console.error('Error processing embedding queue:', error);
        throw error;
    }
}

/**
 * Check the embedding status for a specific content item
 * @param {string} contentType - Type of content ('note', 'asset', etc.)
 * @param {string} contentId - ID of the content item
 * @returns {Promise<Object>} Status object
 */
export async function checkEmbeddingStatus(contentType, contentId) {
    const supabase = createClient();

    try {
        const { data, error } = await supabase
            .from('content_embeddings')
            .select('status, error_message, last_processed_at')
            .eq('content_type', contentType)
            .eq('content_id', contentId)
            .single();

        if (error) {
            console.error('Error checking embedding status:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error in checkEmbeddingStatus:', error);
        throw error;
    }
}

/**
 * Retry a failed embedding
 * @param {string} contentType - Type of content ('note', 'asset', etc.)
 * @param {string} contentId - ID of the content item
 * @returns {Promise<Object>} Status object
 */
export async function retryEmbedding(contentType, contentId) {
    const supabase = createClient();

    try {
        // First, update status to pending
        const { error: updateError } = await supabase
            .from('content_embeddings')
            .update({
                status: 'pending',
                error_message: null,
                last_processed_at: new Date().toISOString(),
            })
            .eq('content_type', contentType)
            .eq('content_id', contentId);

        if (updateError) {
            throw updateError;
        }

        // Trigger immediate processing
        const result = await processEmbeddingQueue();
        
        return {
            success: true,
            message: 'Embedding queued for retry'
        };
    } catch (error) {
        console.error('Error retrying embedding:', error);
        throw error;
    }
} 