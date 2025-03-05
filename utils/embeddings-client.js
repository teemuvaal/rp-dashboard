import { createClient } from '@/utils/supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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

// Export the function
export { createTextChunks };

async function ensureEmbeddingRecord(supabase, contentType, contentId) {
    console.log('Ensuring embedding record exists for:', { contentType, contentId });
    try {
        // First try to get the content details
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
                return false;
            }
                
            if (note) {
                contentText = `${note.title}\n\n${note.content}`;
                campaignId = note.campaign_id;
                console.log('Retrieved note content for embedding');
            }
        } else if (contentType === 'asset') {
            const { data: asset, error: assetError } = await supabase
                .from('assets')
                .select('title, description, content, campaign_id')
                .eq('id', contentId)
                .single();
                
            if (assetError) {
                console.error('Error fetching asset:', assetError);
                return false;
            }
                
            if (asset) {
                contentText = `${asset.title}\n\n${asset.description || ''}\n\n${asset.content}`;
                campaignId = asset.campaign_id;
                console.log('Retrieved asset content for embedding');
            }
        }

        if (!contentText) {
            console.error('Could not find content for', { contentType, contentId });
            return false;
        }

        if (!campaignId) {
            console.error('Could not determine campaign ID for content');
            return false;
        }

        // Create chunks from the content
        const chunks = createTextChunks(contentText);
        console.log(`Created ${chunks.length} chunks for content`);

        // Create or update embedding records for each chunk
        for (const chunk of chunks) {
            console.log(`Processing chunk ${chunk.index + 1}/${chunks.length}`);
            const { error } = await supabase
                .from('content_embeddings')
                .upsert({
                    content_type: contentType,
                    content_id: contentId,
                    campaign_id: campaignId,
                    content_text: chunk.text,
                    chunk_index: chunk.index,
                    total_chunks: chunks.length,
                    status: 'pending',
                    last_processed_at: new Date().toISOString(),
                }, {
                    onConflict: 'content_type,content_id,chunk_index',
                });

            if (error) {
                console.error('Error ensuring embedding record for chunk:', error);
                return false;
            }
        }

        console.log('Successfully created/updated embedding records for all chunks');

        // Trigger processing
        try {
            console.log('Triggering embedding processing...');
            const response = await fetch(`${API_BASE_URL}/api/embeddings/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error triggering embedding process:', errorText);
            } else {
                const result = await response.json();
                console.log('Embedding process triggered successfully:', result);
            }
        } catch (error) {
            console.error('Error triggering process:', error);
        }

        return true;
    } catch (error) {
        console.error('Error in ensureEmbeddingRecord:', error);
        return false;
    }
}

/**
 * Check the embedding status for a specific content item
 * @param {string} contentType - Type of content ('note', 'asset', etc.)
 * @param {string} contentId - ID of the content item
 * @returns {Promise<Object>} Status object
 */
export async function checkEmbeddingStatus(contentType, contentId) {
    console.log('Checking embedding status for:', { contentType, contentId });
    const supabase = createClient();

    try {
        const { data, error } = await supabase
            .from('content_embeddings')
            .select('status, error_message, last_processed_at, chunk_index, total_chunks')
            .eq('content_type', contentType)
            .eq('content_id', contentId)
            .order('chunk_index');

        if (error) {
            if (error.code === 'PGRST116') { // No rows returned
                console.log('No embedding records found, creating them...');
                const created = await ensureEmbeddingRecord(supabase, contentType, contentId);
                if (created) {
                    console.log('Successfully created new embedding records');
                    return { status: 'pending' };
                }
                console.log('Failed to create embedding records');
                return null;
            }
            console.error('Error checking embedding status:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            return null;
        }

        // Calculate overall status
        const statuses = new Set(data.map(d => d.status));
        let overallStatus;
        if (statuses.has('failed')) {
            overallStatus = 'failed';
        } else if (statuses.has('pending')) {
            overallStatus = 'pending';
        } else {
            overallStatus = 'completed';
        }

        // Get the most recent error message if any
        const errorMessages = data
            .filter(d => d.error_message)
            .map(d => `Chunk ${d.chunk_index + 1}: ${d.error_message}`)
            .join('; ');

        console.log('Found embedding status:', {
            status: overallStatus,
            chunks: data.length,
            errorMessages
        });

        return {
            status: overallStatus,
            error_message: errorMessages || null,
            last_processed_at: data[0].last_processed_at,
            chunks: data.length,
            completed_chunks: data.filter(d => d.status === 'completed').length
        };
    } catch (error) {
        console.error('Error in checkEmbeddingStatus:', error);
        throw error;
    }
}

/**
 * Retry a failed embedding via API
 * @param {string} contentType - Type of content ('note', 'asset', etc.)
 * @param {string} contentId - ID of the content item
 * @returns {Promise<Object>} Status object
 */
export async function retryEmbedding(contentType, contentId) {
    console.log('Retrying embedding for:', { contentType, contentId });
    try {
        const response = await fetch(`${API_BASE_URL}/api/embeddings/retry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contentType, contentId }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Error response from retry endpoint:', error);
            throw new Error(error.message || 'Failed to retry embedding');
        }

        const result = await response.json();
        console.log('Retry successful:', result);
        return result;
    } catch (error) {
        console.error('Error retrying embedding:', error);
        throw error;
    }
} 