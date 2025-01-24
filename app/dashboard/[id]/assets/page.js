import { fetchAssets } from '@/app/dashboard/actions';
import AssetsPage from '@/components/Dashboard/AssetsPage';

export default async function Assets({ params }) {
    const { assets, error } = await fetchAssets(params.id);
    return <AssetsPage assets={assets} campaignId={params.id} error={error} />;
} 