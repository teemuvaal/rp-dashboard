'use server'

import { uploadCampaignImage, createAsset } from './actions';

// Cleans up a note and returns a cleaned up version
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

// Creates a summary for a session based on notes linked to session

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

// Creates an asset for a campaign

export async function generateAsset({ campaignId, name, description }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/completion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: description }),
        });
    } catch (error) {
        console.error('Error generating asset:', error);
        return { success: false, error: error.message || 'Failed to generate asset' };
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

export async function extractSummaryHighlights(summary) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/completion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                prompt: `Extract exactly 3 key visual highlights from this session summary. Each highlight should be a vivid, descriptive scene that could be turned into an image. Format the response as a JSON array of strings. The scenes should be in chronological order as they appear in the summary.

Example format:
["A massive dragon emerges from storm clouds, its scales glinting with lightning", "Heroes stand before ancient ruins, torches illuminating mysterious symbols", "A magical portal swirls with blue energy as adventurers step through"]

Summary to analyze: ${summary}`
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Parse the response text as JSON to get the array
        const highlights = JSON.parse(data.text);
        
        return { success: true, highlights };
    } catch (error) {
        console.error('Error extracting highlights:', error);
        return { success: false, error: 'Failed to extract highlights' };
    }
}

export async function generateHighlightImages(highlights, sessionId) {
    try {
        // Convert highlights to image-optimized prompts using OpenAI
        const promptResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/completion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                prompt: `Convert these scene descriptions into detailed image generation prompts. Make them more specific and optimized for Stable Diffusion. Include art style directions. Format as JSON array.
                Example format: ["A majestic dragon emerging from dark storm clouds, scales crackling with electricity, dramatic lighting, epic fantasy art style, detailed scales, volumetric lighting"]
                Scenes to convert: ${JSON.stringify(highlights)}`
            }),
        });

        if (!promptResponse.ok) {
            throw new Error('Failed to optimize image prompts');
        }

        const promptData = await promptResponse.json();
        const imagePrompts = JSON.parse(promptData.text);

        // Generate images in parallel
        const imagePromises = imagePrompts.map(async (prompt, index) => {
            // Generate the image
            const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error(`Failed to generate image ${index + 1}`);
            }

            const data = await response.json();
            
            // Fetch the PNG
            const imageResponse = await fetch(data.imageUrl);
            if (!imageResponse.ok) throw new Error(`Failed to fetch generated image ${index + 1}`);
            
            const imageBlob = await imageResponse.blob();
            
            // Create a File object
            const file = new File([imageBlob], `session-highlight-${index + 1}.png`, { type: 'image/png' });
            
            // Upload to storage
            const formData = new FormData();
            formData.append('file', file);
            formData.append('sessionId', sessionId);
            formData.append('highlightIndex', index.toString());

            // TODO: Create a new action to handle session highlight image uploads
            // For now, we'll just return the blob URL
            return URL.createObjectURL(imageBlob);
        });

        // Wait for all images to be generated and uploaded
        const imageUrls = await Promise.all(imagePromises);

        return { 
            success: true, 
            imageUrls,
            prompts: imagePrompts // Return the prompts for reference
        };
    } catch (error) {
        console.error('Error generating highlight images:', error);
        return { 
            success: false, 
            error: error.message || 'Failed to generate highlight images' 
        };
    }
}