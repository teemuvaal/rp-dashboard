import { fetchAsset } from '@/app/dashboard/actions';
import ViewAsset from '@/components/Dashboard/ViewAsset';

export default async function ViewAssetPage({ params }) {
    const asset = await fetchAsset(params.assetId);
    
    if (!asset) {
        return <div>Asset not found</div>;
    }

    return <ViewAsset asset={asset} campaignId={params.id} />;
} 