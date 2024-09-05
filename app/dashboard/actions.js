'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCampaign(formData) {
  const supabase = createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    return { error: 'Authentication error' }
  }

  // Extract campaign data from formData
  const name = formData.get('name')
  const description = formData.get('description')

  // Start a Supabase transaction
  const { data, error } = await supabase.rpc('create_campaign_with_owner', {
    p_name: name,
    p_description: description,
    p_owner_id: user.id
  })

  if (error) {
    return { error: error.message }
  }

  // Revalidate the dashboard page to reflect the new campaign
  revalidatePath('/dashboard')

  return { success: true, campaignId: data }
}

export async function createSession(formData) {
  const supabase = createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    return { error: 'Authentication error' }
  }

  const campaignId = formData.get('campaignId')
  const name = formData.get('name')
  const description = formData.get('description')
  const duration = formData.get('duration')
  const scheduled_date = formData.get('date')

  console.log('Received form data:', { campaignId, name, description, duration, scheduled_date });

  if (!campaignId) {
    return { error: 'Campaign ID is missing' }
  }

  // Check if the user is the campaign owner
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('owner_id')
    .eq('id', campaignId)
    .single()

  if (campaignError) {
    return { error: 'Error fetching campaign details' }
  }

  if (campaign.owner_id !== user.id) {
    return { error: 'Only the campaign owner can create sessions' }
  }

  // Convert the datetime-local string to ISO 8601 format
  const scheduledDateISO = new Date(scheduled_date).toISOString();

  // Insert the new session
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      campaign_id: campaignId,
      name,
      description,
      duration_minutes: parseInt(duration),
      scheduled_date: scheduledDateISO,
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()

  if (error) {
    return { error: error.message }
  }

  // Revalidate the sessions page to reflect the new session
  revalidatePath(`/dashboard/${campaignId}/sessions`)

  // Check if data exists and has at least one item before accessing its id
  const sessionId = data && data.length > 0 ? data[0].id : null;

  return { success: true, sessionId }
  
}

export async function deleteSession(sessionId, campaignId) {
  const supabase = createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    return { error: 'Authentication error' }
  }

  // Check if the user is the campaign owner
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('owner_id')
    .eq('id', campaignId)
    .single()

  if (campaignError) {
    return { error: 'Error fetching campaign details' }
  }

  if (campaign.owner_id !== user.id) {
    return { error: 'Only the campaign owner can delete sessions' }
  }

  // Delete the session
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId)

  if (error) {
    return { error: error.message }
  }

  // Revalidate the sessions page to reflect the deleted session
  revalidatePath(`/dashboard/${campaignId}/sessions`)

  return { success: true }
}

export async function fetchUserCampaigns() {
    const supabase = createClient()
  
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
  
    if (userError) {
      return { error: 'Authentication error' }
    }
  
    // Fetch campaigns where the user is a member
    const { data: campaigns, error } = await supabase
      .from('campaign_members')
      .select(`
        campaign_id,
        role,
        campaigns:campaign_id (
          id,
          name,
          description,
          created_at,
          updated_at,
          owner_id
        )
      `)
      .eq('user_id', user.id)
  
    if (error) {
      return { error: error.message }
    }
  
    // Transform the data to a more convenient format
    const formattedCampaigns = campaigns.map(({ campaign_id, role, campaigns }) => ({
      id: campaign_id,
      role,
      ...campaigns
    }))
  
    return { campaigns: formattedCampaigns }
  }

export async function createPost(formData) {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    return { error: 'Authentication error' }
  }

  const campaignId = formData.get('campaignId')
  const title = formData.get('title')
  const content = formData.get('content')
  const sessionId = formData.get('sessionId') || null
  const noteId = formData.get('noteId') || null

  const { data, error } = await supabase
    .from('posts')
    .insert({
      campaign_id: campaignId,
      user_id: user.id,
      title,
      content,
      session_id: sessionId,
      note_id: noteId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/${campaignId}`)
  return { success: true, post: data[0] }
}

export async function fetchFeedItems(campaignId) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      created_at,
      user_id
    `)
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching feed items:', error)
    return []
  }

  // Fetch user information for the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    console.error('Error fetching user information:', userError)
    return data.map(post => ({
      ...post,
      author: 'Unknown'
    }))
  }

  return data.map(post => ({
    ...post,
    author: post.user_id === user.id ? user.email : 'Unknown'
  }))
}

export async function fetchCampaignDetails(campaignId) {
  const supabase = createClient()

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single()

  if (error) {
    console.error(error)
    return { error: 'Error loading campaign details' }
  }

  return { campaign }
}

export async function updateCampaignDetails(campaignId, updates) {
  const supabase = createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    return { error: 'Authentication error' }
  }

  // Check if the user is the campaign owner
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('owner_id, tags')
    .eq('id', campaignId)
    .single()

  if (campaignError) {
    return { error: 'Error fetching campaign details' }
  }

  if (campaign.owner_id !== user.id) {
    return { error: 'Only the campaign owner can update details' }
  }

  // If updating tags, ensure we don't exceed 5 tags
  if (updates.tags && updates.tags.length > 5) {
    return { error: 'Maximum of 5 tags allowed' }
  }

  // Update the campaign
  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', campaignId)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/${campaignId}/details`)
  return { success: true, campaign: data[0] }
}

export async function uploadCampaignImage(formData) {
  const supabase = createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    return { error: 'Authentication error' }
  }

  const file = formData.get('file')
  const campaignId = formData.get('campaignId')

  if (!file || !campaignId) {
    return { error: 'Missing file or campaign ID' }
  }

  // Check if the user is the campaign owner
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('owner_id')
    .eq('id', campaignId)
    .single()

  if (campaignError) {
    return { error: 'Error fetching campaign details' }
  }

  if (campaign.owner_id !== user.id) {
    return { error: 'Only the campaign owner can upload images' }
  }

  // Upload the file
  const fileExt = file.name.split('.').pop()
  const fileName = `${campaignId}_${Math.random().toString(36).substring(2)}.${fileExt}`
  const { data, error } = await supabase.storage
    .from('campaign-images')
    .upload(fileName, file)

  if (error) {
    return { error: error.message }
  }

  // Get the public URL of the uploaded file
  const { data: { publicUrl }, error: urlError } = supabase.storage
    .from('campaign-images')
    .getPublicUrl(fileName)

  if (urlError) {
    return { error: urlError.message }
  }

  // Update the campaign with the new image URL
  const { error: updateError } = await supabase
    .from('campaigns')
    .update({ campaign_image: publicUrl })
    .eq('id', campaignId)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath(`/dashboard/${campaignId}/details`)
  return { success: true, imageUrl: publicUrl }
}