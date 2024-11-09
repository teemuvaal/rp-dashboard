import { createClient } from '@/utils/supabase/server'
import { fetchCampaignMembers, generateShareLink, refreshShareLink } from '../../actions'
import MembersList from '@/components/Dashboard/MembersList'
import InviteMember from '@/components/Dashboard/InviteMember'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export default async function MembersPage({ params }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user is an owner
    const { data: membership } = await supabase
        .from('campaign_members')
        .select('role')
        .eq('campaign_id', params.id)
        .eq('user_id', user.id)
        .single()

    const isOwner = membership?.role === 'owner'

    const members = await fetchCampaignMembers(params.id)

    return (
        <Card>
        <div className="w-full h-screen p-4 rounded-sm">
            <MembersList members={members} />
            {isOwner && (
                <div className="flex flex-col mt-4">
                <InviteMember 
                    campaignId={params.id} 
                    generateShareLink={generateShareLink} 
                    refreshShareLink={refreshShareLink}
                />
                </div>
            )}
        </div>
        </Card>
    )
}