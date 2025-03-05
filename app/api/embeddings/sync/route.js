import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req) {
    try {
        const supabase = createClient();
        
        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const requestData = await req.json();
        const { campaignId, contentTypes = ['notes', 'assets'] } = requestData;
        
        if (!campaignId) {
            return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 });
        }
        
        // Verify that the user has access to this campaign (owner or member)
        const { data: campaignAccess, error: accessError } = await supabase
            .from('campaign_members')
            .select('role')
            .eq('campaign_id', campaignId)
            .eq('user_id', user.id)
            .maybeSingle();
            
        if (accessError) {
            console.error('Error checking campaign access:', accessError);
            return NextResponse.json({ error: 'Failed to verify campaign access' }, { status: 500 });
        }
        
        const isOwner = await checkIfOwner(supabase, campaignId, user.id);
        
        if (!campaignAccess && !isOwner) {
            return NextResponse.json({ error: 'You do not have access to this campaign' }, { status: 403 });
        }
        
        // Process each content type
        let totalQueued = 0;
        
        // Process notes if requested
        if (contentTypes.includes('notes')) {
            const { count: notesCount, error: notesError } = await queueNoteEmbeddings(supabase, campaignId);
            
            if (notesError) {
                console.error('Error queuing note embeddings:', notesError);
            } else {
                totalQueued += notesCount;
            }
        }
        
        // Process assets if requested
        if (contentTypes.includes('assets')) {
            const { count: assetsCount, error: assetsError } = await queueAssetEmbeddings(supabase, campaignId);
            
            if (assetsError) {
                console.error('Error queuing asset embeddings:', assetsError);
            } else {
                totalQueued += assetsCount;
            }
        }
        
        return NextResponse.json({
            success: true,
            message: 'Content queued for embedding generation',
            total: totalQueued
        });
        
    } catch (error) {
        console.error('Error in sync embeddings API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function checkIfOwner(supabase, campaignId, userId) {
    const { data, error } = await supabase
        .from('campaigns')
        .select('owner_id')
        .eq('id', campaignId)
        .single();
        
    if (error) {
        console.error('Error checking campaign ownership:', error);
        return false;
    }
    
    return data.owner_id === userId;
}

async function queueNoteEmbeddings(supabase, campaignId) {
    try {
        // First query notes that don't have embeddings or have pending status
        const { data: notes, error: notesError } = await supabase
            .from('notes')
            .select('id, title, content')
            .eq('campaign_id', campaignId);
            
        if (notesError) {
            return { error: notesError };
        }
        
        let count = 0;
        
        // For each note, upsert into content_embeddings
        for (const note of notes) {
            // Generate the text to embed (title + content)
            const textToEmbed = `${note.title}\n\n${note.content}`;
            
            // Upsert to content_embeddings table with status = 'pending'
            const { error: upsertError } = await supabase
                .from('content_embeddings')
                .upsert({
                    content_type: 'note',
                    content_id: note.id,
                    campaign_id: campaignId,
                    content_text: textToEmbed,
                    status: 'pending',
                    updated_at: new Date().toISOString()
                }, { 
                    onConflict: 'content_type,content_id,chunk_index'
                });
                
            if (upsertError) {
                console.error('Error upserting note embedding:', upsertError);
            } else {
                count++;
            }
        }
        
        return { count };
    } catch (error) {
        console.error('Error in queueNoteEmbeddings:', error);
        return { error };
    }
}

async function queueAssetEmbeddings(supabase, campaignId) {
    try {
        // Query assets for the campaign
        const { data: assets, error: assetsError } = await supabase
            .from('assets')
            .select('id, title, description, content')
            .eq('campaign_id', campaignId);
            
        if (assetsError) {
            return { error: assetsError };
        }
        
        let count = 0;
        
        // For each asset, upsert into content_embeddings
        for (const asset of assets) {
            // Generate the text to embed based on asset type
            const textToEmbed = `${asset.title}\n${asset.description || ''}\n\n${asset.content}`;
            
            // Upsert to content_embeddings table with status = 'pending'
            const { error: upsertError } = await supabase
                .from('content_embeddings')
                .upsert({
                    content_type: 'asset',
                    content_id: asset.id,
                    campaign_id: campaignId,
                    content_text: textToEmbed,
                    status: 'pending',
                    updated_at: new Date().toISOString()
                }, { 
                    onConflict: 'content_type,content_id,chunk_index'
                });
                
            if (upsertError) {
                console.error('Error upserting asset embedding:', upsertError);
            } else {
                count++;
            }
        }
        
        return { count };
    } catch (error) {
        console.error('Error in queueAssetEmbeddings:', error);
        return { error };
    }
} 