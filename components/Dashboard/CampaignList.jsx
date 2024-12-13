import CampaignTile from "./CampaignTile"

export default async function CampaignList({ campaigns, user }) {
    if (!campaigns || campaigns.length === 0) {
        return <div>No campaigns found. Are you ready to create one or join your friends?</div>
    }

    const ownerCampaigns = campaigns.filter((campaign) => campaign.owner_id === user.id)
    const memberCampaigns = campaigns.filter((campaign) => campaign.owner_id !== user.id)
    return (
        <div className="flex flex-col gap-4 p-4">
            <h2>Your Campaigns (owner)</h2>
            <div className="flex flex-col gap-4">
                {ownerCampaigns.map((campaign) => (
                    <CampaignTile key={campaign.id} {...campaign} />
                ))}
            </div>
            <h2>Your Campaigns (member)</h2>
            <div className="flex flex-col gap-4">
                {memberCampaigns.map((campaign) => (
                    <CampaignTile key={campaign.id} {...campaign} />
                ))}
            </div>
        </div>
    )
}