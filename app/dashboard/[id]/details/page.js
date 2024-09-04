import { fetchCampaignDetails } from '@/app/dashboard/actions'
import EditableCampaignDetails from '@/components/Dashboard/EditableCampaignDetails'

export default async function DetailsPage({ params }) {
    const { campaign, error } = await fetchCampaignDetails(params.id)

    if (error) {
        return <div>Error: {error}</div>
    }

    if (!campaign) {
        return <div>Loading...</div>
    }

    return (
        <div className="w-full border-gray-200 border-2 h-screen p-4 rounded-sm">
            <EditableCampaignDetails campaign={campaign} campaignId={params.id} />
        </div>
    )
}