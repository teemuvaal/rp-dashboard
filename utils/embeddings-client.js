import { createClient } from '@/utils/supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function ensureEmbeddingRecord(supabase, contentType, contentId) {
    try {
        // First try to get the content details
        let contentText;
        if (contentType === 'note') {
            const { data: note } = await supabase
                .from('notes')
                .select('title, content')
                .eq('id', contentId)
                .single();
                
            if (note) {
                contentText = `${note.title}\n\n${note.content}`;
            }
        }
        // Add other content types here as needed

        if (!contentText) {
            console.error('Could not find content for', { contentType, contentId });
            return false;
        }

        // Try to create the embedding record
        const { data, error } = await supabase
            .from('content_embeddings')
            .upsert({
                content_type: contentType,
                content_id: contentId,
                content_text: contentText,
                status: 'pending',
                last_processed_at: new Date().toISOString(),
            }, {
                onConflict: 'content_type,content_id',
            });

        if (error) {
            console.error('Error ensuring embedding record:', error);
            return false;
        }

        // Trigger processing
        try {
            const response = await fetch(`${API_BASE_URL}/api/embeddings/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error('Error triggering embedding process:', await response.text());
            } else {
                console.log('Successfully triggered embedding process');
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
    const supabase = createClient();

    try {
        const { data, error } = await supabase
            .from('content_embeddings')
            .select('status, error_message, last_processed_at')
            .eq('content_type', contentType)
            .eq('content_id', contentId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // No rows returned
                console.log('No embedding record found, creating one...');
                const created = await ensureEmbeddingRecord(supabase, contentType, contentId);
                if (created) {
                    return { status: 'pending' };
                }
                return null;
            }
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
        const response = await fetch(`${API_BASE_URL}/api/embeddings/retry`, {
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