import TopNav from "@/components/TopNav";
import Hero from "@/components/DashboardHero";
import Feed from "@/components/DashboardFeed";
import Footer from "@/components/Footer";
import Actions from "@/components/Actions";
import AppMenu from "@/components/AppMenu";
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function CampaignPage({ params }) {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
        redirect('/login')
    }

    // Fetch campaign details
    const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', params.id)
        .single()

    if (campaignError || !campaign) {
        notFound()
    }

    // Check if user is a member or owner of the campaign
    const { data: membership, error: membershipError } = await supabase
        .from('campaign_members')
        .select('role')
        .eq('campaign_id', params.id)
        .eq('user_id', user.id)
        .single()

    if (membershipError || !membership) {
        redirect('/dashboard')  // User is not a member, redirect to main dashboard
    }

    // Fetch feed items (you'll need to implement this)
    const feedItems = await fetchFeedItems(params.id)

    // Fetch calendar events (you'll need to implement this)
    const calendarEvents = await fetchCalendarEvents(params.id)

    const menuItems = [
        { label: 'Feed', href: '#feed' },
        { label: 'Session', href: '#session' },
        { label: 'Notes', href: '#notes' },
        { label: 'Campaign', href: '#campaign' },
    ]

    const actions = [
        { label: 'Add Note', variant: 'default', onClick: () => {} },
        { label: 'View Notes', variant: 'outline', onClick: () => {} },
        { label: 'Edit', variant: 'outline', onClick: () => {} },
    ]

    return (
        <div
        style={{
            background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(185,164,121,1) 100%)"
          }}>
        <div 
        className="flex flex-col min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
            <TopNav campaigns={[campaign]}/>
            <Hero name={campaign.name} description={campaign.description} image="/LandingPageHero.png" />
            <AppMenu items={menuItems} />
            <Actions actions={actions} />
            <Feed feedItems={feedItems} calendarEvents={calendarEvents} />
            <Footer />
        </div>
        </div>
    );
}

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