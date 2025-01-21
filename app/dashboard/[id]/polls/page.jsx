import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import CreatePollForm from "@/components/Dashboard/CreatePollForm";
import PollsList from "@/components/Dashboard/PollsList";

export default async function PollsPage({ params }) {
    const supabase = createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // Check if user is campaign owner
    const { data: campaign } = await supabase
        .from('campaigns')
        .select('owner_id')
        .eq('id', params.id)
        .single();

    if (!campaign || campaign.owner_id !== user.id) {
        redirect(`/dashboard/${params.id}`);
    }

    // Fetch all polls for this campaign
    const { data: polls } = await supabase
        .from('polls')
        .select(`
            *,
            options:poll_options (
                id,
                option_text,
                votes:poll_votes(count)
            )
        `)
        .eq('campaign_id', params.id)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Polls Management</h1>
                    <p className="text-gray-500">Create and manage polls for your campaign</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Create New Poll</h2>
                    <CreatePollForm campaignId={params.id} />
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Active Polls</h2>
                    <PollsList 
                        polls={polls?.filter(p => p.is_active) || []} 
                        campaignId={params.id}
                        isActive={true}
                    />

                    <h2 className="text-xl font-semibold mb-4 mt-8">Inactive Polls</h2>
                    <PollsList 
                        polls={polls?.filter(p => !p.is_active) || []} 
                        campaignId={params.id}
                        isActive={false}
                    />
                </Card>
            </div>
        </div>
    );
} 