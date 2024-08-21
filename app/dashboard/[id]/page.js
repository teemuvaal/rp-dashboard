import Feed from "@/components/DashboardFeed";
import { createClient } from '@/utils/supabase/server'

export default async function CampaignFeed({ params }) {
    const supabase = createClient()
    
    // Fetch feed items
    const feedItems = await fetchFeedItems(params.id)

    // Fetch calendar events
    const calendarEvents = await fetchCalendarEvents(params.id)

    return (
        <Feed feedItems={feedItems} calendarEvents={calendarEvents} />
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

async function fetchCalendarEvents(campaignId) {
    // Fetch calendar events from your database
    return [
        { date: new Date(), title: "Next Session" },
        // ... more calendar events
    ]
}