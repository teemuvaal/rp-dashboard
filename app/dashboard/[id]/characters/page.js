import { createClient } from '@/utils/supabase/server';
import { Card } from "@/components/ui/card";
import CharactersList from '@/components/Dashboard/Characters/CharactersList';
import CreateCharacterButton from '@/components/Dashboard/Characters/CreateCharacterButton';
import ManageTemplatesButton from '@/components/Dashboard/Characters/ManageTemplatesButton';

export default async function CharactersPage({ params }) {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check if user is campaign owner
    const { data: campaign } = await supabase
        .from('campaigns')
        .select('owner_id')
        .eq('id', params.id)
        .single();
    
    const isOwner = campaign?.owner_id === user?.id;

    // Fetch characters for this campaign
    const { data: characters } = await supabase
        .from('characters')
        .select(`
            *,
            users (
                username,
                profile_picture
            ),
            character_templates (
                name,
                description
            )
        `)
        .eq('campaign_id', params.id)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Characters</h1>
                <div className="flex gap-2">
                    <CreateCharacterButton campaignId={params.id} />
                    {isOwner && <ManageTemplatesButton campaignId={params.id} />}
                </div>
            </div>

            <Card className="p-4">
                <CharactersList 
                    characters={characters || []} 
                    campaignId={params.id}
                    isOwner={isOwner}
                />
            </Card>
        </div>
    );
} 