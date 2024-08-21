import CampaignDetails from "@/components/CampaignDetails";

export default async function CampaignDetailsPage({ params }) {
    // Fetch detailed campaign information
    const campaignDetails = await fetchCampaignDetails(params.id);

    return <CampaignDetails details={campaignDetails} />;
}