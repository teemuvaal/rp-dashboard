import { fetchCampaignDetails } from '@/app/dashboard/actions'
import EditableCampaignDetails from '@/components/Dashboard/EditableCampaignDetails'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export default async function DetailsPage({ params }) {
    const { campaign, error } = await fetchCampaignDetails(params.id)

    if (error) {
        return <div>Error: {error}</div>
    }

    if (!campaign) {
        return <div>Loading...</div>
    }

    return (
        <Card>
        <div className="w-full h-screen p-4 rounded-sm">
            <EditableCampaignDetails campaign={campaign} campaignId={params.id} />
        </div>
        </Card>
    )
}