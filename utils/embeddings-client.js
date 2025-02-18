import { createClient } from '@/utils/supabase/client';

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
 * Retry a failed embedding via API
 * @param {string} contentType - Type of content ('note', 'asset', etc.)
 * @param {string} contentId - ID of the content item
 * @returns {Promise<Object>} Status object
 */
export async function retryEmbedding(contentType, contentId) {
    try {
        const response = await fetch('/api/embeddings/retry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contentType, contentId }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to retry embedding');
        }

        return await response.json();
    } catch (error) {
        console.error('Error retrying embedding:', error);
        throw error;
    }
} 