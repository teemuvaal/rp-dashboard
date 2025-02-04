'use server'

import { uploadCampaignImage, createAsset, saveNarrativeContent } from './actions';
import { createClient } from '@/utils/supabase/server';

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

export async function generateHighlightImages(highlights, sessionId, artStyle = 'fantasy') {
    try {
        // Convert highlights to image-optimized prompts using OpenAI
        const promptResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/completion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                prompt: `Convert these scene descriptions into detailed image generation prompts. Make them more specific and optimized for Flux image model. Art style should be ${artStyle}. Format as JSON array.
                Example format: ["A majestic dragon emerging from dark storm clouds, scales crackling with electricity, dramatic lighting, ${artStyle} art style, detailed scales, volumetric lighting"]
                Scenes to convert: ${JSON.stringify(highlights)}`
            }),
        });

        if (!promptResponse.ok) {
            throw new Error('Failed to optimize image prompts');
        }

        const promptData = await promptResponse.json();
        const imagePrompts = JSON.parse(promptData.text);

        // Generate and upload images in parallel
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
            
            // Upload to storage using uploadAsset
            const formData = new FormData();
            formData.append('file', file);
            formData.append('sessionId', sessionId);
            formData.append('type', 'visual_summary');
            formData.append('index', index.toString());

            const uploadResult = await uploadSessionImage(formData);
            if (uploadResult.error) {
                throw new Error(`Failed to upload image ${index + 1}: ${uploadResult.error}`);
            }

            return uploadResult.imageUrl;
        });

        // Wait for all images to be generated and uploaded
        const imageUrls = await Promise.all(imagePromises);

        return { 
            success: true, 
            imageUrls,
            prompts: imagePrompts
        };
    } catch (error) {
        console.error('Error generating highlight images:', error);
        return { 
            success: false, 
            error: error.message || 'Failed to generate highlight images' 
        };
    }
}

// Helper function to upload session images to Supabase storage
async function uploadSessionImage(formData) {
    const supabase = createClient()
    
    try {
        const file = formData.get('file');
        const sessionId = formData.get('sessionId');
        const type = formData.get('type');
        const index = formData.get('index');

        if (!file || !sessionId) {
            throw new Error('Missing required parameters');
        }

        // Create a unique file path
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const filePath = `sessions/${sessionId}/${type}/${index}-${timestamp}.${fileExt}`;

        // Upload the file to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('session-images')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
            .from('session-images')
            .getPublicUrl(filePath);

        return { success: true, imageUrl: publicUrl };
    } catch (error) {
        console.error('Error uploading session image:', error);
        return { error: error.message || 'Failed to upload image' };
    }
}

export async function generateNarrativeSummary(summaryContent, sessionId) {
    if (!summaryContent || typeof summaryContent !== 'string' || summaryContent.trim().length === 0) {
        return {
            success: false,
            error: 'Summary content is required'
        };
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/completion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: `Transform this RPG session summary into an engaging narrative from a storyteller's perspective. 
                Use rich, descriptive language and a captivating tone that would work well for voice narration.
                Focus on creating a flowing narrative that maintains dramatic tension and emphasizes the emotional weight of key moments.
                Write in a style similar to how a professional dungeon master would recount the tale to an audience.
                
                Guidelines:
                - Use present tense to create immediacy
                - Include atmospheric details and sensory descriptions
                - Maintain dramatic pacing and tension
                - Emphasize character emotions and reactions
                - Use natural transitions between scenes
                - Keep the tone appropriate for the genre and setting
                - Make it suitable for audio narration (clear sentence structure, good flow)
                - Break into clear paragraphs for better pacing
                
                Here's the session summary to transform:
                ${summaryContent.trim()}`
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate narrative summary');
        }

        const data = await response.json();
        
        if (!data.text || typeof data.text !== 'string' || data.text.trim().length === 0) {
            throw new Error('Generated narrative is empty or invalid');
        }

        // Don't save the narrative content here - it will be saved with all other data later
        return {
            success: true,
            content: data.text.trim()
        };
    } catch (error) {
        console.error('Error generating narrative summary:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate narrative summary'
        };
    }
}

export async function generateNarrationAudio(text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return {
            success: false,
            error: 'Text is required for audio narration'
        };
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/generate-audio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text.trim(),
                modelId: "eleven_multilingual_v2",
                voiceId: "JBFqnCBsd6RMkjVDRZzb",
                outputFormat: "mp3_44100_128"
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate audio');
        }

        return {
            success: true,
            audioUrl: data.audioUrl
        };
    } catch (error) {
        console.error('Error in generateNarrationAudio:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate audio'
        };
    }
}

export async function generateSummary(sessionId) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/completion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: `Create a concise but detailed summary of these session notes. Focus on key events, important decisions, and significant character moments. Format the summary into clear paragraphs.

                Session ID: ${sessionId}`
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate summary');
        }

        const data = await response.json();
        return {
            success: true,
            summary: data.content,
        };
    } catch (error) {
        console.error('Error generating summary:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

export async function saveVisualSummary({ 
    sessionId, 
    summaryId, 
    highlights, 
    imageUrls, 
    imagePrompts,
    narrativeContent,
    audioUrl
}) {
    const supabase = createClient();
    
    try {
        // Validate required fields
        if (!sessionId) throw new Error('Session ID is required');
        if (!highlights || !Array.isArray(highlights) || highlights.length === 0) {
            throw new Error('Highlights are required');
        }
        if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
            throw new Error('Image URLs are required');
        }
        if (!narrativeContent) throw new Error('Narrative content is required');
        if (!audioUrl) throw new Error('Audio URL is required');

        // First check if a record exists
        const { data: existingRecord } = await supabase
            .from('session_visual_summaries')
            .select('id')
            .eq('session_id', sessionId)
            .single();

        const visualSummaryData = {
            session_id: sessionId,
            summary_id: summaryId,
            highlights,
            image_urls: imageUrls,
            image_prompts: imagePrompts,
            narrative_content: narrativeContent,
            audio_url: audioUrl,
            updated_at: new Date().toISOString(),
        };

        let result;
        if (existingRecord) {
            // Update existing record
            result = await supabase
                .from('session_visual_summaries')
                .update(visualSummaryData)
                .eq('id', existingRecord.id)
                .select()
                .single();
        } else {
            // Insert new record
            result = await supabase
                .from('session_visual_summaries')
                .insert(visualSummaryData)
                .select()
                .single();
        }

        if (result.error) throw result.error;

        return { 
            success: true, 
            data: result.data 
        };
    } catch (error) {
        console.error('Error saving visual summary:', error);
        return { 
            success: false, 
            error: error.message || 'Failed to save visual summary' 
        };
    }
}

export async function handleGenerateVisualSummary(sessionId, summaryId, summaryContent, selectedStyle) {
    if (!summaryContent || typeof summaryContent !== 'string' || summaryContent.trim().length === 0) {
        return {
            success: false,
            error: 'Summary content is required'
        };
    }

    const supabase = createClient();

    try {
        // First, get the correct summary ID from the database
        const { data: summary, error: summaryError } = await supabase
            .from('session_summaries')
            .select('id')
            .eq('session_id', sessionId)
            .single();

        if (summaryError) {
            console.error('Error fetching summary:', summaryError);
            return {
                success: false,
                error: 'Failed to fetch session summary'
            };
        }

        console.log('Step 1: Extracting highlights...');
        const { success: highlightSuccess, highlights, error: highlightError } = 
            await extractSummaryHighlights(summaryContent);
        
        if (!highlightSuccess || !highlights) {
            throw new Error(highlightError || 'Failed to extract highlights');
        }

        console.log('Step 2: Generating images...');
        const { success: imageSuccess, imageUrls, prompts, error: imageError } = 
            await generateHighlightImages(highlights, sessionId, selectedStyle);
        
        if (!imageSuccess) {
            throw new Error(imageError || 'Failed to generate images');
        }

        console.log('Step 3: Generating narrative...');
        const { success: narrativeSuccess, content: narrativeContent, error: narrativeError } = 
            await generateNarrativeSummary(summaryContent, sessionId);
        
        if (!narrativeSuccess || !narrativeContent) {
            console.error('Narrative generation failed:', narrativeError);
            throw new Error(narrativeError || 'Failed to generate narrative');
        }

        console.log('Step 4: Generating audio...');
        const { success: audioSuccess, audioUrl, error: audioError } = 
            await generateNarrationAudio(narrativeContent);
        
        if (!audioSuccess) {
            throw new Error(audioError || 'Failed to generate audio');
        }

        console.log('Step 5: Saving all data...');
        const { success: saveSuccess, error: saveError, data: savedData } = await saveVisualSummary({
            sessionId,
            summaryId: summary.id, // Use the correct summary ID from the database
            highlights,
            imageUrls,
            imagePrompts: prompts,
            narrativeContent,
            audioUrl
        });

        if (!saveSuccess) {
            throw new Error(saveError || 'Failed to save visual summary');
        }

        console.log('Visual summary generation completed successfully');
        return {
            success: true,
            data: savedData || {
                highlights,
                imageUrls,
                imagePrompts: prompts,
                narrativeContent,
                audioUrl
            }
        };
    } catch (error) {
        console.error('Error in handleGenerateVisualSummary:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate visual summary'
        };
    }
}