import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from "@/components/ui/card";
import TemplateList from '@/components/Dashboard/Characters/Templates/TemplateList';
import CreateTemplateButton from '@/components/Dashboard/Characters/Templates/CreateTemplateButton';

export default async function TemplatesPage({ params }) {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check if user is campaign owner
    const { data: campaign } = await supabase
        .from('campaigns')
        .select('owner_id')
        .eq('id', params.id)
        .single();
    
    // Only campaign owner can access this page
    if (campaign?.owner_id !== user?.id) {
        redirect(`/dashboard/${params.id}/characters`);
    }

    // Fetch templates for this campaign
    const { data: templates } = await supabase
        .from('character_templates')
        .select(`
            *,
            characters (count)
        `)
        .eq('campaign_id', params.id)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Character Templates</h1>
                    <p className="text-sm text-gray-500">
                        Create and manage character templates for your campaign
                    </p>
                </div>
                <CreateTemplateButton campaignId={params.id} />
            </div>

            <Card className="p-4">
                <TemplateList 
                    templates={templates || []} 
                    campaignId={params.id}
                />
            </Card>
        </div>
    );
} 