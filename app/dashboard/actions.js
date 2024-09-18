'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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
      user_id,
      users:user_id (username, profile_picture)
    `)
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching feed items:', error)
    return []
  }

  return data.map(post => ({
    id: post.id,
    title: post.title,
    content: post.content,
    created_at: post.created_at,
    user_id: post.user_id,
    author: post.users?.username || 'Unknown',
    authorProfilePicture: post.users?.profile_picture || null
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

export async function fetchCampaignMembers(campaignId) {
  const supabase = createClient()

  // First, fetch campaign members
  const { data: members, error: membersError } = await supabase
    .from('campaign_members')
    .select('id, user_id, role')
    .eq('campaign_id', campaignId)

  if (membersError) {
    console.error('Error fetching campaign members:', membersError)
    return []
  }

  // Extract user IDs
  const userIds = members.map(member => member.user_id)

  // Then, fetch user details
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, username, profile_picture')
    .in('id', userIds)

  if (usersError) {
    console.error('Error fetching user details:', usersError)
    return []
  }

  // Create a map of user details
  const userMap = Object.fromEntries(users.map(user => [user.id, user]))

  // Combine member and user data
  return members.map(member => ({
    id: member.id,
    user_id: member.user_id,
    role: member.role,
    username: userMap[member.user_id]?.username || 'Unknown User',
    profile_picture: userMap[member.user_id]?.profile_picture || null
  }))
}

export async function createInvitation(formData) {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    return { error: 'Authentication error' }
  }

  const campaignId = formData.get('campaignId')
  const email = formData.get('email')
  const role = formData.get('role')

  const { data, error } = await supabase.rpc('create_invitation', {
    p_campaign_id: campaignId,
    p_invited_by: user.id,
    p_email: email,
    p_role: role
  })

  if (error) {
    return { error: error.message }
  }

  const invitationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/invite/${data}`

  // Here you would typically send an email with the invitationUrl
  // For now, we'll just return it
  return { success: true, invitationUrl }
}

export async function generateShareLink(campaignId) {
  const supabase = createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    return { error: 'Authentication error' }
  }

  // Check if the user is the campaign owner
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('owner_id, share_id')
    .eq('id', campaignId)
    .single()

  if (campaignError) {
    return { error: 'Error fetching campaign details' }
  }

  if (campaign.owner_id !== user.id) {
    return { error: 'Only the campaign owner can generate share links' }
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/join/${campaign.share_id}`

  return { success: true, shareUrl }
}

export async function joinCampaign(shareId, userId) {
  const supabase = createClient()

  // Find the campaign
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('id')
    .eq('share_id', shareId)
    .single()

  if (campaignError) {
    return { error: 'Invalid or expired share link' }
  }

  // Check if the user is already a member
  const { data: existingMember, error: memberError } = await supabase
    .from('campaign_members')
    .select('id')
    .eq('campaign_id', campaign.id)
    .eq('user_id', userId)
    .single()

  if (existingMember) {
    return { error: 'You are already a member of this campaign' }
  }

  // Add user to campaign_members
  const { error: insertError } = await supabase
    .from('campaign_members')
    .insert({
      campaign_id: campaign.id,
      user_id: userId,
      role: 'member'
    })

  if (insertError) {
    return { error: 'Error joining the campaign' }
  }

  return { success: true, campaignId: campaign.id }
}

export async function refreshShareLink(campaignId) {
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
    return { error: 'Only the campaign owner can refresh share links' }
  }

  // Generate a new UUID for the share_id
  const { data, error } = await supabase
    .from('campaigns')
    .update({ share_id: supabase.auth.uuid() })
    .eq('id', campaignId)
    .select('share_id')

  if (error) {
    return { error: 'Error refreshing share link' }
  }

  const newShareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/join/${data[0].share_id}`

  return { success: true, shareUrl: newShareUrl }
}

export async function updateProfile(formData) {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    return { error: 'Authentication error' }
  }

  const username = formData.get('username')
  const profilePicture = formData.get('profilePicture')

  let updates = { username }

  if (profilePicture) {
    const fileExt = profilePicture.name.split('.').pop()
    const fileName = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, profilePicture)

    if (uploadError) {
      return { error: 'Error uploading profile picture' }
    }

    const { data: { publicUrl }, error: urlError } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName)

    if (urlError) {
      return { error: 'Error getting public URL for profile picture' }
    }

    updates.profile_picture = publicUrl
  }

  const { error: updateError } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)

  if (updateError) {
    return { error: 'Error updating profile' }
  }

  revalidatePath('/dashboard/profile')
  redirect('/dashboard')
}