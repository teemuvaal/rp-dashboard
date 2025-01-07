import Feed from "@/components/Dashboard/DashboardFeed";
import { createClient } from '@/utils/supabase/server'
import { fetchFeedItems, createPost, getPolls } from '../actions'

export default async function CampaignFeed({ params }) {
    const supabase = createClient()
    
    // Fetch user information
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user is an owner
    const { data: membership } = await supabase
        .from('campaign_members')
        .select('role')
        .eq('campaign_id', params.id)
        .eq('user_id', user.id)
        .single()

    const isOwner = membership?.role === 'owner'

    // Fetch feed items
    const feedItems = await fetchFeedItems(params.id)

    // Fetch calendar events
    const sessions = await fetchSessions(params.id)

    // Fetch polls
    const polls = await getPolls(params.id)

    return (
        <div>
            <Feed 
                feedItems={feedItems} 
                sessions={sessions} 
                isOwner={isOwner} 
                campaignId={params.id}
                createPost={createPost}
                polls={polls || []}
            />
        </div>
    );
}

// Implement these functions to fetch actual data
async function fetchSessions(campaignId) {
    const supabase = createClient()
    
    // Fetch sessions for the campaign
    const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('scheduled_date', { ascending: true })

    if (error) {
        console.error('Error fetching sessions:', error)
        return <div>Error loading sessions</div>
    }

    return sessions
}