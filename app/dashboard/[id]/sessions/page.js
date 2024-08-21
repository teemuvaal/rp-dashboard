import SessionList from "@/components/SessionList";
import { createClient } from '@/utils/supabase/server'

export default async function CampaignSessions({ params }) {
    const supabase = createClient()
    const campaignId = params.id;
    
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

    return <SessionList sessions={sessions} campaignId={campaignId} />;
}