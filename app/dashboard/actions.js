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

  
}

export async function updateSessionStatus(formData) {
  const supabase = createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    return { error: 'Authentication error' }
  }

  const sessionId = formData.get('sessionId')
  const campaignId = formData.get('campaignId')
  const status = formData.get('status')

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
    return { error: 'Only the campaign owner can update session status' }
  }

  // Update the session status
  const { error: updateError } = await supabase
    .from('sessions')
    .update({ status })
    .eq('id', sessionId)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath(`/dashboard/${campaignId}/sessions/${sessionId}`)
  return { success: true }
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
          owner_id,
          campaign_image
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

export async function createNote(formData) {
    const supabase = createClient();

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
            console.error('Authentication error:', userError);
            return { error: 'Authentication error' };
        }

        const campaignId = formData.get('campaignId');
        const sessionId = formData.get('sessionId') || null;
        const title = formData.get('title');
        const content = formData.get('content');
        const isPublic = formData.get('isPublic') === 'true';

        // Verify campaign membership
        const { data: membership } = await supabase
            .from('campaign_members')
            .select('role')
            .eq('campaign_id', campaignId)
            .eq('user_id', user.id)
            .single();

        if (!membership) {
            return { error: 'Not a campaign member' };
        }

        // If linking to a session, verify session exists and belongs to campaign
        if (sessionId) {
            const { data: session } = await supabase
                .from('sessions')
                .select('id')
                .eq('id', sessionId)
                .eq('campaign_id', campaignId)
                .single();

            if (!session) {
                return { error: 'Invalid session' };
            }
        }

        const { data, error } = await supabase
            .from('notes')
            .insert({
                campaign_id: campaignId,
                session_id: sessionId,
                user_id: user.id,
                title,
                content,
                is_public: isPublic,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select(`
                *,
                users (
                    username,
                    profile_picture
                )
            `)
            .single();

        if (error) {
            console.error('Error creating note:', error);
            return { error: error.message };
        }

        return { 
            success: true, 
            note: {
                ...data,
                author: data.users?.username || 'Unknown'
            }
        };
    } catch (error) {
        console.error('Unexpected error in createNote:', error);
        return { error: 'An unexpected error occurred' };
    }
}

export async function fetchNotes(campaignId) {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    return { error: 'Authentication error' }
  }

  const { data, error } = await supabase
    .from('notes')
    .select(`
      id,
      title,
      content,
      is_public,
      created_at,
      updated_at,
      user_id,
      session_id,
      users:user_id (username, profile_picture)
    `)
    .eq('campaign_id', campaignId)
    .or(`user_id.eq.${user.id},is_public.eq.true`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notes:', error)
    return { error: 'Error fetching notes' }
  }

  const notes = data.map(note => ({
    ...note,
    author: note.users?.username || 'Unknown'
  }))

  return { notes }
}

export async function fetchSessionNotes(sessionId) {
    const supabase = createClient();
    
    try {
        const { data: notes, error } = await supabase
            .from('notes')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching session notes:', error);
            return { notes: [], error: error.message };
        }

        return { notes: notes || [] };
    } catch (error) {
        console.error('Error in fetchSessionNotes:', error);
        return { notes: [], error: error.message };
    }
}


export async function updateNote(formData) {
  const supabase = createClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('Authentication error:', userError)
      return { error: 'Authentication error' }
    }

    const noteId = formData.get('noteId')
    const sessionId = formData.get('sessionId')

    // If we're just updating the session link, we don't need the other fields
    if (sessionId !== null && !formData.get('title')) {
      const { data, error } = await supabase
        .from('notes')
        .update({ session_id: sessionId || null })
        .eq('id', noteId)
        .eq('user_id', user.id)
        .select()

      if (error) {
        console.error('Error updating note:', error)
        return { error: error.message }
      }

      return { success: true, note: data[0] }
    }

    // Otherwise, update all fields
    const title = formData.get('title')
    const content = formData.get('content')
    const isPublic = formData.get('isPublic') === 'true'

    const { data, error } = await supabase
      .from('notes')
      .update({
        title,
        content,
        is_public: isPublic,
        session_id: sessionId || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .eq('user_id', user.id)
      .select()

    if (error) {
      console.error('Error updating note:', error)
      return { error: error.message }
    }

    return { success: true, note: data[0] }
  } catch (error) {
    console.error('Unexpected error in updateNote:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Add this new function
export async function fetchNote(noteId) {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    return { error: 'Authentication error' }
  }

  const { data, error } = await supabase
    .from('notes')
    .select(`
      id,
      title,
      content,
      is_public,
      created_at,
      updated_at,
      user_id,
      users:user_id (username, profile_picture)
    `)
    .eq('id', noteId)
    .single()

  if (error) {
    console.error('Error fetching note:', error)
    return { error: 'Error fetching note' }
  }

  if (!data.is_public && data.user_id !== user.id) {
    return { error: 'You do not have permission to view this note' }
  }

  return { note: {
    ...data,
    author: data.users?.username || 'Unknown'
  }}
}

// Add this new function
export async function deleteNote(noteId) {
  const supabase = createClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('Authentication error:', userError)
      return { error: 'Authentication error' }
    }

    // First, fetch the note to check ownership
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('user_id, campaign_id')
      .eq('id', noteId)
      .single()

    if (fetchError) {
      console.error('Error fetching note:', fetchError)
      return { error: 'Error fetching note' }
    }

    if (note.user_id !== user.id) {
      return { error: 'You do not have permission to delete this note' }
    }

    // If the user is the owner, proceed with deletion
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)

    if (deleteError) {
      console.error('Error deleting note:', deleteError)
      return { error: deleteError.message }
    }

    revalidatePath(`/dashboard/${note.campaign_id}/notes`)
    return { success: true }
  } catch (error) {
    console.error('Unexpected error in deleteNote:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function createPoll(formData) {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get form data
    const campaignId = formData.get('campaignId');
    const title = formData.get('title');
    const description = formData.get('description');
    const allowMultiple = formData.get('allowMultiple') === 'true';
    const options = JSON.parse(formData.get('options'));

    // Verify campaign ownership
    const { data: campaign } = await supabase
        .from('campaigns')
        .select('owner_id')
        .eq('id', campaignId)
        .single();

    if (!campaign || campaign.owner_id !== user.id) {
        return { success: false, error: 'Not authorized' };
    }

    // Create poll
    const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert({
            campaign_id: campaignId,
            title,
            description,
            allow_multiple: allowMultiple,
            created_by: user.id,
            is_active: true
        })
        .select()
        .single();

    if (pollError) {
        console.error('Error creating poll:', pollError);
        return { success: false, error: 'Failed to create poll' };
    }

    // Create poll options
    const optionsToInsert = options.map(option => ({
        poll_id: poll.id,
        option_text: option
    }));

    const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionsToInsert);

    if (optionsError) {
        console.error('Error creating poll options:', optionsError);
        // Clean up the poll since options failed
        await supabase.from('polls').delete().eq('id', poll.id);
        return { success: false, error: 'Failed to create poll options' };
    }

    return { success: true, poll };
}

export async function updatePoll(formData) {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get form data
    const pollId = formData.get('pollId');
    const campaignId = formData.get('campaignId');
    const isActive = formData.get('isActive') === 'true';

    // Verify campaign ownership
    const { data: campaign } = await supabase
        .from('campaigns')
        .select('owner_id')
        .eq('id', campaignId)
        .single();

    if (!campaign || campaign.owner_id !== user.id) {
        return { success: false, error: 'Not authorized' };
    }

    // Update poll
    const { error } = await supabase
        .from('polls')
        .update({ is_active: isActive })
        .eq('id', pollId)
        .eq('campaign_id', campaignId);

    if (error) {
        console.error('Error updating poll:', error);
        return { success: false, error: 'Failed to update poll' };
    }

    return { success: true };
}

export async function votePoll(formData) {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get form data
    const pollId = formData.get('pollId');
    const campaignId = formData.get('campaignId');
    const selectedOptions = JSON.parse(formData.get('options'));

    // Verify campaign membership
    const { data: membership } = await supabase
        .from('campaign_members')
        .select('role')
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id)
        .single();

    if (!membership) {
        return { success: false, error: 'Not a campaign member' };
    }

    // Get poll details to check if multiple votes are allowed
    const { data: poll } = await supabase
        .from('polls')
        .select('allow_multiple, is_active')
        .eq('id', pollId)
        .single();

    if (!poll) {
        return { success: false, error: 'Poll not found' };
    }

    if (!poll.is_active) {
        return { success: false, error: 'Poll is not active' };
    }

    if (!poll.allow_multiple && selectedOptions.length > 1) {
        return { success: false, error: 'Multiple selections not allowed' };
    }

    // Delete existing votes if not allowing multiple
    if (!poll.allow_multiple) {
        await supabase
            .from('poll_votes')
            .delete()
            .eq('poll_id', pollId)
            .eq('user_id', session.user.id);
    }

    // Insert new votes
    const votesToInsert = selectedOptions.map(optionId => ({
        poll_id: pollId,
        option_id: optionId,
        user_id: session.user.id
    }));

    const { error: votesError } = await supabase
        .from('poll_votes')
        .insert(votesToInsert);

    if (votesError) {
        console.error('Error recording votes:', votesError);
        return { success: false, error: 'Failed to record vote' };
    }

    return { success: true };
}

export async function getPolls(campaignId) {
    const supabase = createClient();
    
    // First fetch polls with their options and votes
    const { data: polls, error } = await supabase
        .from('polls')
        .select(`
            *,
            options:poll_options (
                id,
                option_text,
                votes:poll_votes (
                    user_id
                )
            )
        `)
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching polls:', error);
        return [];
    }

    // Get all unique user IDs from votes
    const userIds = new Set();
    polls.forEach(poll => {
        poll.options.forEach(option => {
            option.votes.forEach(vote => {
                userIds.add(vote.user_id);
            });
        });
    });

    // Fetch user profiles for all voters
    const { data: userProfiles } = await supabase
        .from('users')
        .select('id, username, profile_picture')
        .in('id', Array.from(userIds));

    // Create a map of user profiles for quick lookup
    const userProfileMap = Object.fromEntries(
        (userProfiles || []).map(profile => [profile.id, profile])
    );

    // Transform the data to include vote counts and voters with their profiles
    const transformedPolls = polls.map(poll => ({
        ...poll,
        options: poll.options.map(option => ({
            ...option,
            votes: option.votes.length || 0,
            voters: option.votes.map(vote => {
                const profile = userProfileMap[vote.user_id];
                return {
                    id: vote.user_id,
                    username: profile?.username || 'Unknown',
                    profile_picture: profile?.profile_picture
                };
            })
        }))
    }));

    return transformedPolls;
}

export async function deletePoll(formData) {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get form data
    const pollId = formData.get('pollId');
    const campaignId = formData.get('campaignId');

    // Verify campaign ownership
    const { data: campaign } = await supabase
        .from('campaigns')
        .select('owner_id')
        .eq('id', campaignId)
        .single();

    if (!campaign || campaign.owner_id !== user.id) {
        return { success: false, error: 'Not authorized' };
    }

    // Delete poll (cascade will handle options and votes)
    const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId)
        .eq('campaign_id', campaignId);

    if (error) {
        console.error('Error deleting poll:', error);
        return { success: false, error: 'Failed to delete poll' };
    }

    return { success: true };
}

export async function fetchSessions(campaignId) {
  const supabase = createClient()
  
  try {
    // First check if the campaign exists
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', campaignId)
      .single();

    if (campaignError) {
      return { error: 'Campaign not found' };
    }

    // Fetch sessions
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, name, scheduled_date, status')
      .eq('campaign_id', campaignId)
      .order('scheduled_date', { ascending: true });

    if (error) {
      return { error: error.message };
    }

    return { sessions: sessions || [] };
  } catch (error) {
    return { error: 'Failed to fetch sessions' };
  }
}

export async function saveSummary({ sessionId, content }) {
    const supabase = createClient();
    
    try {
        const { data, error } = await supabase
            .from('session_summaries')
            .upsert({
                session_id: sessionId,
                content,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'session_id'
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving summary:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error in saveSummary:', error);
        return { success: false, error: error.message };
    }
}

// Asset Actions
export async function createAsset(formData) {
    const supabase = createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) return { error: 'Not authenticated' }

    const campaignId = formData.get('campaignId')
    const title = formData.get('title')
    const description = formData.get('description')
    const content = formData.get('content')
    const type = formData.get('type')
    const isPublic = formData.get('isPublic') === 'true'

    if (!title || !content || !type) {
        return { error: 'Missing required fields' }
    }

    const { data, error } = await supabase
        .from('assets')
        .insert({
            campaign_id: campaignId,
            user_id: user.id,
            title,
            description,
            content,
            type,
            is_public: isPublic
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating asset:', error)
        return { error: 'Failed to create asset' }
    }

    return { success: true, data }
}

export async function updateAsset(formData) {
    const supabase = createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) return { error: 'Not authenticated' }

    const assetId = formData.get('assetId')
    const title = formData.get('title')
    const description = formData.get('description')
    const content = formData.get('content')
    const type = formData.get('type')
    const isPublic = formData.get('isPublic') === 'true'

    if (!assetId || !title || !content || !type) {
        return { error: 'Missing required fields' }
    }

    const { data, error } = await supabase
        .from('assets')
        .update({
            title,
            description,
            content,
            type,
            is_public: isPublic,
            updated_at: new Date().toISOString()
        })
        .eq('id', assetId)
        .select()
        .single()

    if (error) {
        console.error('Error updating asset:', error)
        return { error: 'Failed to update asset' }
    }

    return { success: true, data }
}

export async function deleteAsset(formData) {
    const supabase = createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) return { error: 'Not authenticated' }

    const assetId = formData.get('assetId')
    if (!assetId) return { error: 'Asset ID is required' }

    const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId)

    if (error) {
        console.error('Error deleting asset:', error)
        return { error: 'Failed to delete asset' }
    }

    return { success: true }
}

export async function fetchAssets(campaignId) {
    const supabase = createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) return { error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('assets')
        .select(`
            *,
            users (
                username,
                profile_picture
            )
        `)
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching assets:', error)
        return { error: 'Failed to fetch assets' }
    }

    return { assets: data }
}

export async function fetchSummary(sessionId) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('session_summaries')
        .select('content')
        .eq('session_id', sessionId)
        .single()

    if (error) {
        return { error: 'Failed to fetch summary' }
    }

    return { summary: data }
}

export async function fetchAsset(assetId) {
    try {
        const supabase = createClient();

        const { data: asset, error } = await supabase
            .from('assets')
            .select(`
                *,
                users:user_id (
                    username
                )
            `)
            .eq('id', assetId)
            .single();

        if (error) {
            console.error('Error fetching asset:', error);
            return null;
        }

        return asset;
    } catch (error) {
        console.error('Error in fetchAsset:', error);
        return null;
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
        // Validate all required fields before attempting to save
        if (!sessionId) throw new Error('Session ID is required');
        if (!highlights || !Array.isArray(highlights) || highlights.length === 0) {
            throw new Error('Highlights are required and must be an array');
        }
        if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
            throw new Error('Image URLs are required and must be an array');
        }
        if (!narrativeContent || typeof narrativeContent !== 'string' || narrativeContent.trim().length === 0) {
            throw new Error('Narrative content is required');
        }
        if (!audioUrl || typeof audioUrl !== 'string' || audioUrl.trim().length === 0) {
            throw new Error('Audio URL is required');
        }

        // First, verify that the summary exists
        if (summaryId) {
            const { data: existingSummary, error: summaryError } = await supabase
                .from('session_summaries')
                .select('id')
                .eq('id', summaryId)
                .single();

            if (summaryError) {
                console.log('Summary not found, will save without summary_id');
                summaryId = null;
            }
        }

        const visualSummaryData = {
            session_id: sessionId,
            summary_id: summaryId, // This will be null if summary doesn't exist
            highlights,
            image_urls: imageUrls,
            image_prompts: imagePrompts,
            narrative_content: narrativeContent.trim(),
            audio_url: audioUrl.trim(),
            updated_at: new Date().toISOString(),
        };

        // Use upsert to either update existing record or create new one
        const { data, error } = await supabase
            .from('session_visual_summaries')
            .upsert(visualSummaryData, {
                onConflict: 'session_id',
                returning: 'representation'
            })
            .select()
            .single();

        if (error) throw error;

        return { 
            success: true, 
            data 
        };
    } catch (error) {
        console.error('Error saving visual summary:', error);
        return { 
            success: false, 
            error: error.message || 'Failed to save visual summary' 
        };
    }
}

export async function updateNarrativeContent({ sessionId, narrativeContent }) {
    const supabase = createClient();
    
    try {
        const { data, error } = await supabase
            .from('session_summaries')
            .update({ narrative_content: narrativeContent })
            .eq('session_id', sessionId)
            .select()
            .single();

        if (error) {
            console.error('Error updating narrative content:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error in updateNarrativeContent:', error);
        return { success: false, error: error.message };
    }
}

// Add a function to fetch visual summary
export async function fetchVisualSummary(sessionId) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('session_visual_summaries')
        .select('*')
        .eq('session_id', sessionId)
        .single();

    if (error) {
        return { error: error.message };
    }

    return { visualSummary: data };
}

export async function removeCampaignMember(formData) {
    const supabase = createClient();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
        return { error: 'Not authenticated' };
    }

    const campaignId = formData.get('campaignId');
    const memberId = formData.get('memberId');

    // Check if the user is the campaign owner
    const { data: campaign } = await supabase
        .from('campaigns')
        .select('owner_id')
        .eq('id', campaignId)
        .single();

    if (!campaign || campaign.owner_id !== user.id) {
        return { error: 'Not authorized to remove members' };
    }

    // Don't allow removing the owner
    if (memberId === campaign.owner_id) {
        return { error: 'Cannot remove the campaign owner' };
    }

    // Remove the member
    const { error: deleteError } = await supabase
        .from('campaign_members')
        .delete()
        .eq('campaign_id', campaignId)
        .eq('user_id', memberId);

    if (deleteError) {
        console.error('Error removing member:', deleteError);
        return { error: 'Failed to remove member' };
    }

    return { success: true };
}

export async function saveNarrativeSummary({ sessionId, summaryId, content }) {
    const supabase = createClient();
    
    try {
        const { data, error } = await supabase
            .from('narrative_summaries')
            .upsert({
                session_id: sessionId,
                summary_id: summaryId,
                content: content,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Error saving narrative summary:', error);
        return { success: false, error: error.message };
    }
}

export async function fetchNarrativeSummary(sessionId) {
    const supabase = createClient();
    
    try {
        const { data, error } = await supabase
            .from('narrative_summaries')
            .select('*')
            .eq('session_id', sessionId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        return { success: true, narrativeSummary: data };
    } catch (error) {
        console.error('Error fetching narrative summary:', error);
        return { success: false, error: error.message };
    }
}

export async function saveNarrativeContent({ sessionId, narrativeContent }) {
    const supabase = createClient();
    
    try {
        // First check if a visual summary exists
        const { data: existingSummary, error: fetchError } = await supabase
            .from('session_visual_summaries')
            .select('id')
            .eq('session_id', sessionId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
            console.error('Error fetching existing visual summary:', fetchError);
            return { success: false, error: fetchError.message };
        }

        let result;
        if (existingSummary) {
            // Update existing record
            result = await supabase
                .from('session_visual_summaries')
                .update({
                    narrative_content: narrativeContent,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingSummary.id)
                .select()
                .single();
        } else {
            // Create new record
            result = await supabase
                .from('session_visual_summaries')
                .insert({
                    session_id: sessionId,
                    narrative_content: narrativeContent,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();
        }

        if (result.error) {
            console.error('Error saving narrative content:', result.error);
            return { success: false, error: result.error.message };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error('Error in saveNarrativeContent:', error);
        return { success: false, error: error.message };
    }
}

export async function fetchUserSubscription() {
    const supabase = createClient();
    
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('user_subscriptions')
            .select(`
                *,
                subscription_plans (
                    name,
                    description,
                    features
                )
            `)
            .eq('user_id', user.id)
            .single();

        if (error) throw error;

        const isActive = data.status === 'active' && 
            new Date(data.current_period_end) > new Date();

        return {
            success: true,
            subscription: {
                status: data.status,
                planName: data.subscription_plans.name,
                planDescription: data.subscription_plans.description,
                features: data.subscription_plans.features,
                currentPeriodEnd: data.current_period_end,
                isActive
            }
        };
    } catch (error) {
        console.error('Error fetching user subscription:', error);
        return {
            success: false,
            error: error.message
        };
    }
}