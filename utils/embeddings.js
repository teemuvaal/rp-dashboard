import { openai } from '@ai-sdk/openai';
import { embed, embedMany } from 'ai';
import { createClient } from '@/utils/supabase/server';

// Constants for chunking
const MAX_CHUNK_SIZE = 1000; // Maximum characters per chunk
const CHUNK_OVERLAP = 100;   // Number of characters to overlap between chunks

/**
 * Split text into overlapping chunks of roughly equal size
 * @param {string} text - The text to split into chunks
 * @param {number} maxChunkSize - Maximum size of each chunk
 * @param {number} overlap - Number of characters to overlap between chunks
 * @returns {Array<{text: string, index: number}>} Array of chunks with their index
 */
function createTextChunks(text, maxChunkSize = MAX_CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
    const chunks = [];
    let index = 0;
    
    // If text is shorter than max chunk size, return it as a single chunk
    if (text.length <= maxChunkSize) {
        return [{ text, index: 0 }];
    }

    let startIndex = 0;
    while (startIndex < text.length) {
        let endIndex = startIndex + maxChunkSize;
        
        // If this isn't the last chunk, try to break at a natural point
        if (endIndex < text.length) {
            // Look for natural break points in order of preference
            const breakPoints = [
                text.lastIndexOf('. ', endIndex),  // End of sentence
                text.lastIndexOf('? ', endIndex),
                text.lastIndexOf('! ', endIndex),
                text.lastIndexOf('\n', endIndex),  // End of paragraph
                text.lastIndexOf('. ', endIndex),
                text.lastIndexOf(' ', endIndex)    // Word boundary
            ];

            // Find the first valid break point
            const breakPoint = breakPoints.find(bp => bp > startIndex + maxChunkSize / 2);
            
            if (breakPoint !== -1) {
                endIndex = breakPoint + 1; // Include the punctuation/space
            }
        }

        chunks.push({
            text: text.slice(startIndex, endIndex).trim(),
            index
        });

        // Move start index back by overlap amount, but don't go backwards
        startIndex = Math.min(endIndex - overlap, text.length);
        if (startIndex < 0) startIndex = 0;
        index++;
    }

    return chunks;
}

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
    console.log('processBatch started with', items.length, 'items');
    const supabase = createClient();

    try {
        // Use embedMany for batch processing
        console.log('Generating embeddings...');
        const embeddings = await Promise.all(items.map(async (item) => {
            try {
                console.log(`Generating embedding for item ${item.id}...`);
                const { embedding } = await embed({
                    model: openai.embedding('text-embedding-3-small'),
                    value: item.content_text,
                });
                console.log(`Successfully generated embedding for item ${item.id}`);
                return embedding;
            } catch (error) {
                console.error(`Error generating embedding for item ${item.id}:`, error);
                throw error;
            }
        }));

        console.log('Generated embeddings for', embeddings.length, 'items');

        // Update each item with its embedding
        console.log('Updating items in database...');
        const results = await Promise.all(items.map(async (item, index) => {
            try {
                console.log(`Updating item ${item.id} with embedding...`);
                const { error: updateError } = await supabase
                    .from('content_embeddings')
                    .update({
                        embedding: embeddings[index],
                        status: 'completed',
                        last_processed_at: new Date().toISOString(),
                    })
                    .eq('id', item.id);

                if (updateError) {
                    console.error(`Error updating item ${item.id}:`, updateError);
                    throw updateError;
                }

                console.log(`Successfully updated item ${item.id}`);
                return {
                    id: item.id,
                    status: 'success'
                };
            } catch (error) {
                console.error(`Error updating embedding for item ${item.id}:`, error);
                
                try {
                    await supabase
                        .from('content_embeddings')
                        .update({
                            status: 'failed',
                            error_message: error.message,
                            last_processed_at: new Date().toISOString(),
                        })
                        .eq('id', item.id);
                } catch (updateError) {
                    console.error(`Error updating failure status for item ${item.id}:`, updateError);
                }

                return {
                    id: item.id,
                    status: 'error',
                    error: error.message
                };
            }
        }));

        console.log('Batch processing completed');
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
    console.log('processEmbeddingQueue started');
    const supabase = createClient();
    const BATCH_SIZE = 10;

    try {
        // Fetch pending embeddings
        console.log('Fetching pending embeddings...');
        const { data: pendingEmbeddings, error: fetchError } = await supabase
            .from('content_embeddings')
            .select('*')
            .eq('status', 'pending')
            .limit(BATCH_SIZE);

        if (fetchError) {
            console.error('Error fetching pending embeddings:', fetchError);
            throw fetchError;
        }

        console.log(`Found ${pendingEmbeddings?.length || 0} pending embeddings`);

        if (!pendingEmbeddings || pendingEmbeddings.length === 0) {
            return { message: 'No pending embeddings to process' };
        }

        // Process the batch
        console.log('Processing batch...');
        const results = await processBatch(pendingEmbeddings);
        console.log('Batch processing results:', results);

        // Count successes and failures
        const successes = results.filter(r => r.status === 'success').length;
        const failures = results.filter(r => r.status === 'error').length;

        return {
            processed: results.length,
            successes,
            failures,
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
    console.log('Server retryEmbedding called for:', { contentType, contentId });

    try {
        // First check if the content still exists
        let contentText;
        let campaignId;

        if (contentType === 'note') {
            const { data: note, error: noteError } = await supabase
                .from('notes')
                .select('title, content, campaign_id')
                .eq('id', contentId)
                .single();
                
            if (noteError) {
                console.error('Error fetching note:', noteError);
                throw new Error('Content not found');
            }
                
            if (note) {
                contentText = `${note.title}\n\n${note.content}`;
                campaignId = note.campaign_id;
            }
        } else if (contentType === 'asset') {
            const { data: asset, error: assetError } = await supabase
                .from('assets')
                .select('title, description, content, campaign_id')
                .eq('id', contentId)
                .single();
                
            if (assetError) {
                console.error('Error fetching asset:', assetError);
                throw new Error('Content not found');
            }
                
            if (asset) {
                contentText = `${asset.title}\n\n${asset.description || ''}\n\n${asset.content}`;
                campaignId = asset.campaign_id;
            }
        }

        if (!contentText || !campaignId) {
            throw new Error('Content not found');
        }

        // Delete existing embeddings
        const { error: deleteError } = await supabase
            .from('content_embeddings')
            .delete()
            .match({ content_type: contentType, content_id: contentId });
            
        if (deleteError) {
            console.error('Error deleting existing embeddings:', deleteError);
            throw deleteError;
        }

        // Create chunks from the content
        const chunks = createTextChunks(contentText);
        console.log(`Created ${chunks.length} chunks for content`);

        // Insert new embedding records for each chunk
        for (const chunk of chunks) {
            const { error: insertError } = await supabase
                .from('content_embeddings')
                .insert({
                    content_type: contentType,
                    content_id: contentId,
                    campaign_id: campaignId,
                    content_text: chunk.text,
                    chunk_index: chunk.index,
                    total_chunks: chunks.length,
                    status: 'pending',
                    last_processed_at: new Date().toISOString()
                });

            if (insertError) {
                console.error('Error inserting embedding record:', insertError);
                throw insertError;
            }
        }

        // Trigger immediate processing
        const result = await processEmbeddingQueue();
        
        return {
            success: true,
            message: 'Embedding queued for retry'
        };
    } catch (error) {
        console.error('Error in retryEmbedding:', error);
        throw error;
    }
} 