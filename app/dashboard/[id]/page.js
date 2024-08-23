import Feed from "@/components/DashboardFeed";
import { createClient } from '@/utils/supabase/server'


export default async function CampaignFeed({ params }) {
    const supabase = createClient()
    
    // Fetch feed items
    const feedItems = await fetchFeedItems(params.id)

    // Fetch calendar events
    const sessions = await fetchSessions(params.id)

    return (
        <Feed feedItems={feedItems} sessions={sessions} />
    );
}

// Implement fetchFeedItems and fetchCalendarEvents as before

// Implement these functions to fetch actual data
async function fetchFeedItems(campaignId) {
    // Fetch feed items from your database
    return [
        { title: "Thanks for the session!", content: "Looking forward to the next session!" },
        { title: "New Post", content: "What a great game we had last session!" },
        // ... more feed items
    ]
}

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