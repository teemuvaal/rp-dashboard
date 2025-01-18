'use server'

import { uploadCampaignImage } from './actions';

export async function cleanUpNote(note) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/completion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                prompt: `Format this following note properly as markdown, using standard markdown syntax. Ensure proper headings, lists, code blocks, and other markdown elements are used appropriately: ${note}` +
                        `The cleaned up version should be in the same language as the note.` +
                        `Improve the note structure to add a summary, key events, and other important information based on what is available in the note.` +
                        `If note contains unrelated information, profanity, or other inappropriate content, just return unable to clean up note.` +
                        `If note is empty, just return unable to clean up note.`
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, cleanedNote: data.text };
    } catch (error) {
        console.error('Error cleaning up note:', error);
        return { success: false, error: 'Failed to clean up note' };
    }
}

export async function createSummary({notes}) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/completion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                prompt: `Create a summary of the session based on these notes:\n\n${notes}\n\n` +
                       `Create a narrative summary that captures the key events, encounters, and moments from the session. ` +
                       `Format the summary in markdown with proper headings, sections, and formatting. ` +
                       `Focus on the most important events and their outcomes. ` +
                       `Use an engaging, narrative style suitable for a D&D campaign summary.` +
                       `The summary should be in the same language as the notes.` +
                       `Format the summary in markdown with proper headings, sections, and formatting. `
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, cleanedNote: data.text };
    } catch (error) {
        console.error('Error creating a summary:', error);
        return { success: false, error: 'Failed to create a summary' };
    }
}

export async function generateCampaignImage({ campaignId, description }) {
    try {
        // Generate the image
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/images`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: description }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Fetch the PNG directly from the URL
        const imageResponse = await fetch(data.imageUrl);
        if (!imageResponse.ok) throw new Error('Failed to fetch generated image');
        
        const imageBlob = await imageResponse.blob();
        
        // Create a File object from the blob
        const file = new File([imageBlob], 'campaign-image.png', { type: 'image/png' });
        
        // Prepare FormData for upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('campaignId', campaignId);

        // Upload the image using the existing uploadCampaignImage function
        const uploadResult = await uploadCampaignImage(formData);

        if (uploadResult.error) {
            throw new Error(uploadResult.error);
        }

        return { success: true, imageUrl: uploadResult.imageUrl };
    } catch (error) {
        console.error('Error generating campaign image:', error);
        return { success: false, error: error.message || 'Failed to generate campaign image' };
    }
}