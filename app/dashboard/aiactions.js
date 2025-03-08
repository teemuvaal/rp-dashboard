'use server'

import { uploadCampaignImage, createAsset, saveNarrativeContent } from './actions';
import { createClient } from '@/utils/supabase/server';
import { createPost } from './actions';

// Utility function to extract JSON from markdown code blocks or raw JSON strings
function extractJsonFromMarkdown(text) {
    if (!text) return null;
    
    // First, try parsing the text directly as JSON
    try {
        return JSON.parse(text);
    } catch (e) {
        // Not valid JSON, continue with extraction
    }

    // Try to extract JSON from markdown code blocks
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = text.match(codeBlockRegex);
    
    if (match && match[1]) {
        try {
            return JSON.parse(match[1].trim());
        } catch (e) {
            console.error("Failed to parse extracted content as JSON:", e);
        }
    }
    
    // Try to find array or object notation directly
    const jsonRegex = /(\[[\s\S]*\]|\{[\s\S]*\})/;
    const jsonMatch = text.match(jsonRegex);
    
    if (jsonMatch && jsonMatch[1]) {
        try {
            return JSON.parse(jsonMatch[1].trim());
        } catch (e) {
            console.error("Failed to parse JSON notation:", e);
        }
    }
    
    throw new Error("Could not extract valid JSON from the text");
}

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
                        `If note is empty, just return unable to clean up note.` +
                        `Return ONLY the formatted markdown text, without any JSON wrapping or metadata.`
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // If the response is a string, use it directly
        // If it's an object with a text property, use that
        // Otherwise, return an error
        const cleanedNote = typeof data === 'string' ? data : 
                          (data.text ? data.text : 
                          'Unable to clean up note: Invalid response format');

        return { success: true, cleanedNote };
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
                       `Use an engaging, narrative style suitable for a tabletop roleplaying campaign summary.` +
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


export async function generateCampaignImage({ campaignId, description, artStyle = '80s fantasy book cover' }) {
    try {
        // Generate the image
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/images`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                prompt: description,
                type: 'campaign',
                artStyle
            }),
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
        // Make the OpenAI call
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/completion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: `Extract exactly three key visual highlights from this session summary. Each highlight should be a brief but vivid description of a specific, visually interesting moment or scene.

                Format your response as a JSON array of strings, where each string is a visual highlight.
                Example format: ["A towering dragon emerges from the mountain, its scales gleaming in the moonlight", "The party stands at the edge of a massive chasm, torches flickering against the darkness below", "The ancient artifact pulses with ethereal blue light as the wizard carefully examines its inscriptions"]

                Session Summary:
                ${summary}`
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to extract highlights: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('AI Response for highlights:', data.text);
        
        // Try to parse the AI response using our utility function
        try {
            const highlights = extractJsonFromMarkdown(data.text);
            
            // Validate that we got an array with exactly 3 highlights
            if (Array.isArray(highlights) && highlights.length > 0) {
                // Ensure we have exactly 3 highlights
                return { 
                    success: true, 
                    highlights: highlights.slice(0, 3),
                    error: null
                };
            } else {
                throw new Error('Invalid highlights format returned');
            }
        } catch (parseError) {
            console.error('Failed to parse highlights:', parseError);
            console.log('Response text:', data.text);
            
            // As a fallback, try to manually extract valid content
            // This handles cases where the AI might return malformed JSON
            const cleanedText = data.text
                .replace(/```json|```/g, '') // Remove markdown code block markers
                .trim();
                
            try {
                // Try parsing the cleaned text
                const highlights = JSON.parse(cleanedText);
                if (Array.isArray(highlights) && highlights.length > 0) {
                    return { 
                        success: true, 
                        highlights: highlights.slice(0, 3),
                        error: null
                    };
                }
            } catch (secondError) {
                console.error('Second parsing attempt failed:', secondError);
            }
            
            throw new Error('Failed to extract valid highlights from AI response');
        }
    } catch (error) {
        console.error('Error extracting highlights:', error);
        return { 
            success: false, 
            highlights: null,
            error: `Error extracting highlights: ${error.message}` 
        };
    }
}

export async function generateHighlightImages(highlights, sessionId, artStyle = 'fantasy') {
    try {
        // Convert highlights to image-optimized prompts using OpenAI
        console.log('Converting highlights to image prompts with art style:', artStyle);
        console.log('Highlights:', highlights);
        
        const promptResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/completion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                prompt: `Convert these scene descriptions into detailed image generation prompts. Make them more specific and optimized for Flux image model. Art style should be ${artStyle}. Format as JSON array.
                Example format: ["A majestic dragon emerging from dark storm clouds, scales crackling with electricity, dramatic lighting, detailed scales, volumetric lighting"]
                Scenes to convert: ${JSON.stringify(highlights)}`
            }),
        });

        if (!promptResponse.ok) {
            throw new Error(`Failed to optimize image prompts: ${promptResponse.status} ${promptResponse.statusText}`);
        }

        const promptData = await promptResponse.json();
        console.log('AI response for prompt conversion:', promptData.text);
        
        // Parse the response which might contain markdown
        let imagePrompts;
        try {
            imagePrompts = extractJsonFromMarkdown(promptData.text);
            console.log('Parsed image prompts:', imagePrompts);
        } catch (parseError) {
            console.error('Error parsing prompt response:', parseError);
            throw new Error('Failed to parse image prompts: ' + parseError.message);
        }

        if (!Array.isArray(imagePrompts) || imagePrompts.length === 0) {
            throw new Error('Invalid image prompts format: expected non-empty array');
        }

        console.log(`Generating ${imagePrompts.length} images with ${artStyle} style...`);
        
        // Generate and upload images in parallel
        const imagePromises = imagePrompts.map(async (prompt, index) => {
            console.log(`Generating image ${index + 1} with prompt:`, prompt);
            
            try {
                // Generate the image
                const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/images`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        prompt, 
                        type: 'highlight',
                        artStyle
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`Failed to generate image ${index + 1}: ${errorData.error || response.statusText}`);
                }

                const data = await response.json();
                console.log(`Image ${index + 1} generated successfully`);
                
                if (!data.imageUrl) {
                    throw new Error(`No image URL received for image ${index + 1}`);
                }
                
                // Fetch the image data
                const imageResponse = await fetch(data.imageUrl);
                if (!imageResponse.ok) {
                    throw new Error(`Failed to fetch generated image ${index + 1}: ${imageResponse.status} ${imageResponse.statusText}`);
                }
                
                const imageBlob = await imageResponse.blob();
                console.log(`Image ${index + 1} fetched successfully, size: ${imageBlob.size} bytes`);
                
                if (imageBlob.size === 0) {
                    throw new Error(`Empty image blob received for image ${index + 1}`);
                }
                
                // Create a File object
                const file = new File([imageBlob], `session-highlight-${index + 1}.png`, { type: 'image/png' });
                
                // Upload to storage using uploadAsset
                const formData = new FormData();
                formData.append('file', file);
                formData.append('sessionId', sessionId);
                formData.append('type', 'visual_summary');
                formData.append('index', index.toString());

                console.log(`Uploading image ${index + 1} to storage...`);
                const uploadResult = await uploadSessionImage(formData);
                if (uploadResult.error) {
                    throw new Error(`Failed to upload image ${index + 1}: ${uploadResult.error}`);
                }

                console.log(`Image ${index + 1} uploaded successfully:`, uploadResult.imageUrl);
                return uploadResult.imageUrl;
            } catch (error) {
                console.error(`Error processing image ${index + 1}:`, error);
                throw error; // Re-throw to be caught by the Promise.all
            }
        });

        // Wait for all images to be generated and uploaded
        try {
            const imageUrls = await Promise.all(imagePromises);
            console.log('All images generated and uploaded successfully');
            
            return { 
                success: true, 
                imageUrls,
                prompts: imagePrompts
            };
        } catch (error) {
            console.error('Failed to process one or more images:', error);
            throw new Error(`Image generation failed: ${error.message}`);
        }
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
                prompt: `Transform this RPG session summary into a flowing narrative story, as if being told by a master storyteller around a campfire.
                Make it engaging and dramatic, perfect for being read aloud as a single continuous tale.
                Focus on creating a seamless narrative that maintains dramatic tension and emphasizes the emotional weight of key moments.
                Write in a style similar to how a professional game master would recount the tale to an audience.
                The story should flow naturally from beginning to end, maintaining continuity throughout.
                Do not break it into separate scenes or sections - create one cohesive narrative. Try make the summary always less than 1000 words.
                
                Here's the session summary to transform:
                ${summaryContent}`
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate narrative');
        }

        const data = await response.json();
        
        if (!data.text || typeof data.text !== 'string' || data.text.trim().length === 0) {
            throw new Error('Generated narrative is empty or invalid');
        }

        // Save the narrative content
        const result = await saveNarrativeContent({
            sessionId,
            narrativeContent: data.text.trim()
        });

        if (!result.success) {
            throw new Error(result.error || 'Failed to save narrative content');
        }

        return {
            success: true,
            text: data.text.trim()
        };
    } catch (error) {
        console.error('Error generating narrative:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate narrative'
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
                modelId: "eleven_flash_v2_5",
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

            // Get session and campaign info for the post
            const { data: session } = await supabase
                .from('sessions')
                .select('campaign_id, name')
                .eq('id', sessionId)
                .single();

            if (session && result.data) {
                // Create a post for the new visual summary
                const { data: post, error: postError } = await supabase
                    .from('posts')
                    .insert({
                        campaign_id: session.campaign_id,
                        user_id: (await supabase.auth.getUser()).data.user.id,
                        title: `Visual Summary: ${session.name}`,
                        content: `A new visual summary has been created for session "${session.name}".`,
                        session_id: sessionId,
                        visual_summary_id: result.data.id,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (postError) {
                    console.error('Error creating post for visual summary:', postError);
                }
            }
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
        console.log(`Starting visual summary generation for session ${sessionId}`);
        
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
        const highlightResult = await extractSummaryHighlights(summaryContent);
        console.log('Highlight extraction result:', JSON.stringify(highlightResult));
        
        if (!highlightResult.success || !highlightResult.highlights) {
            console.error('Failed to extract highlights:', highlightResult.error);
            throw new Error(highlightResult.error || 'Failed to extract highlights');
        }
        
        const highlights = highlightResult.highlights;
        console.log('Extracted highlights:', highlights);

        console.log('Step 2: Generating images...');
        const { success: imageSuccess, imageUrls, prompts, error: imageError } = 
            await generateHighlightImages(highlights, sessionId, selectedStyle);
        
        if (!imageSuccess) {
            console.error('Failed to generate images:', imageError);
            throw new Error(imageError || 'Failed to generate images');
        }
        
        console.log('Generated image URLs:', imageUrls);

        console.log('Step 3: Generating narrative...');
        const { success: narrativeSuccess, text: narrativeContent, error: narrativeError } = 
            await generateNarrativeSummary(summaryContent, sessionId);
        
        if (!narrativeSuccess || !narrativeContent) {
            console.error('Narrative generation failed:', narrativeError);
            throw new Error(narrativeError || 'Failed to generate narrative');
        }

        console.log('Step 4: Generating audio...');
        const { success: audioSuccess, audioUrl, error: audioError } = 
            await generateNarrationAudio(narrativeContent);
        
        if (!audioSuccess) {
            console.error('Audio generation failed:', audioError);
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
            console.error('Failed to save visual summary:', saveError);
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

export async function handleGenerateBasicVisualSummary(sessionId, summaryId, summaryContent, selectedStyle) {
    if (!summaryContent || typeof summaryContent !== 'string' || summaryContent.trim().length === 0) {
        return {
            success: false,
            error: 'Summary content is required'
        };
    }

    const supabase = createClient();

    try {
        console.log(`Starting basic visual summary generation for session ${sessionId}`);
        
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
        const highlightResult = await extractSummaryHighlights(summaryContent);
        console.log('Highlight extraction result:', JSON.stringify(highlightResult));
        
        if (!highlightResult.success || !highlightResult.highlights) {
            console.error('Failed to extract highlights:', highlightResult.error);
            return {
                success: false,
                error: highlightResult.error || 'Failed to extract highlights'
            };
        }
        
        const highlights = highlightResult.highlights;
        console.log('Extracted highlights:', highlights);

        console.log('Step 2: Generating images...');
        const { success: imageSuccess, imageUrls, prompts: imagePrompts, error: imageError } = 
            await generateHighlightImages(highlights, sessionId, selectedStyle);

        if (!imageSuccess) {
            console.error('Failed to generate images:', imageError);
            return {
                success: false,
                error: imageError || 'Failed to generate images'
            };
        }
        
        console.log('Generated image URLs:', imageUrls);

        console.log('Step 3: Generating narrative...');
        const { success: narrativeSuccess, text: narrativeContent, error: narrativeError } = 
            await generateNarrativeSummary(summaryContent, sessionId);

        if (!narrativeSuccess) {
            console.error('Narrative generation failed:', narrativeError);
            return {
                success: false,
                error: narrativeError || 'Failed to generate narrative'
            };
        }

        console.log('Step 4: Saving visual summary (without audio)...');
        // Save the visual summary without audio
        const { success: saveSuccess, error: saveError, data: savedData } = await saveVisualSummary({
            sessionId,
            summaryId: summary.id,
            highlights,
            imageUrls,
            imagePrompts,
            narrativeContent,
            audioUrl: null // No audio for basic version
        });

        if (!saveSuccess) {
            console.error('Failed to save visual summary:', saveError);
            return {
                success: false,
                error: saveError || 'Failed to save visual summary'
            };
        }

        console.log('Basic visual summary generation completed successfully');
        return {
            success: true,
            data: savedData || {
                highlights,
                imageUrls,
                imagePrompts,
                narrativeContent,
                audioUrl: null
            }
        };
    } catch (error) {
        console.error('Error in handleGenerateBasicVisualSummary:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate visual summary'
        };
    }
}