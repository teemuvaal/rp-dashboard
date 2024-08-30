import CampaignDetails from "@/components/Dashboard/CampaignDetails";

export default async function CampaignDetailsPage({ params }) {
    // Fetch detailed campaign information
    const campaignDetails = await fetchCampaignDetails(params.id);

    return <CampaignDetails details={campaignDetails} />;
}