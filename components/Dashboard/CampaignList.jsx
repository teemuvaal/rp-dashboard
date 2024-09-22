import CampaignTile from "./CampaignTile"

export default async function CampaignList({ campaigns }) {
    if (!campaigns || campaigns.length === 0) {
        return <div>No campaigns found. Are you ready to create one or join your friends?</div>
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <h2>Your Campaigns</h2>
            <div className="flex flex-col gap-4">
                {campaigns.map((campaign) => (
                    <CampaignTile key={campaign.id} {...campaign} />
                ))}
            </div>
        </div>
    )
}