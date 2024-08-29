import SessionList from "@/components/SessionList";
import { createClient } from '@/utils/supabase/server'
import CreateSessionForm from "@/components/CreateSessionForm";

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
    const now = new Date()
    const upcomingSessions = sessions.filter(session => new Date(session.scheduled_date) > now)
    const pastSessions = sessions.filter(session => new Date(session.scheduled_date) <= now)

    return (
        <div
        className="flex flex-col gap-4 py-4"
        >
            <h2 className="text-2xl font-bold">Sessions</h2>
            <h3>Campaign statistics:</h3>
            <div>
                <h4>Total sessions: {sessions.length}</h4>
                <h4>Scheduled sessions: {upcomingSessions.length}</h4>
                <h4>Past sessions: {pastSessions.length}</h4>
            </div>
            <div>
                <CreateSessionForm campaignId={campaignId} />
            </div>
            <SessionList sessions={sessions} campaignId={campaignId} />
        </div>
    );
}   