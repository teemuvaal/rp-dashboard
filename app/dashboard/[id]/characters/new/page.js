import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from "@/components/ui/card";
import CharacterForm from '@/components/Dashboard/Characters/CharacterForm';

export default async function NewCharacterPage({ params }) {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check if user is a member of the campaign
    const { data: membership } = await supabase
        .from('campaign_members')
        .select('role')
        .eq('campaign_id', params.id)
        .eq('user_id', user.id)
        .single();

    if (!membership) {
        redirect(`/dashboard/${params.id}`);
    }

    // Fetch available templates for this campaign
    const { data: templates } = await supabase
        .from('character_templates')
        .select('*')
        .eq('campaign_id', params.id)
        .order('name', { ascending: true });

    if (!templates?.length) {
        // No templates available
        redirect(`/dashboard/${params.id}/characters`);
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Create New Character</h1>
                <p className="text-sm text-gray-500">
                    Fill out the character sheet to create your new character
                </p>
            </div>

            <Card className="p-6">
                <CharacterForm 
                    templates={templates}
                    campaignId={params.id}
                />
            </Card>
        </div>
    );
} 