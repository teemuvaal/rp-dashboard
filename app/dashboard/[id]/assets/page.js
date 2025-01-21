import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { fetchAssets } from "../../actions";
import { Card } from "@/components/ui/card";
import CreateAssetForm from "@/components/Dashboard/CreateAssetForm";
import AssetsList from "@/components/Dashboard/AssetsList";

export default async function AssetsPage({ params }) {
    const supabase = createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // Check if user is campaign member
    const { data: membership } = await supabase
        .from('campaign_members')
        .select('role')
        .eq('campaign_id', params.id)
        .eq('user_id', user.id)
        .single();

    if (!membership) {
        redirect(`/dashboard/${params.id}`);
    }

    // Fetch assets
    const { assets, error } = await fetchAssets(params.id);

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Assets</h1>
                    <p className="text-muted-foreground">
                        Manage your campaign assets
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Create New Asset</h2>
                    <CreateAssetForm campaignId={params.id} />
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Asset Library</h2>
                    <AssetsList 
                        assets={assets || []} 
                        campaignId={params.id}
                        error={error}
                    />
                </Card>
            </div>
        </div>
    );
} 