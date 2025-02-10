import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Card } from "@/components/ui/card";
import CharacterSheet from '@/components/Dashboard/Characters/CharacterSheet';
import CharacterHeader from '@/components/Dashboard/Characters/CharacterHeader';

export default async function CharacterPage({ params }) {
    const supabase = createClient();
    
    try {
        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw new Error('Failed to get user');

        // Check if user is a member of the campaign
        const { data: membership, error: membershipError } = await supabase
            .from('campaign_members')
            .select('role')
            .eq('campaign_id', params.id)
            .eq('user_id', user.id)
            .single();

        if (membershipError || !membership) {
            notFound();
        }
        
        // Fetch character with template and user info
        const { data: character, error: characterError } = await supabase
            .from('characters')
            .select(`
                *,
                users (
                    username,
                    profile_picture
                ),
                character_templates (
                    name,
                    description,
                    schema,
                    ui_schema
                )
            `)
            .eq('id', params.charId)
            .eq('campaign_id', params.id)  // Make sure character belongs to this campaign
            .single();

        if (characterError || !character) {
            console.error('Error fetching character:', characterError);
            notFound();
        }

        // Check if user is campaign owner
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('owner_id')
            .eq('id', params.id)
            .single();
        
        if (campaignError) throw new Error('Failed to fetch campaign details');
        
        const isOwner = campaign?.owner_id === user?.id;
        const isCharacterOwner = character.user_id === user?.id;
        const canEdit = isOwner || isCharacterOwner;

        return (
            <div className="space-y-4">
                <CharacterHeader 
                    character={character}
                    canEdit={canEdit}
                    campaignId={params.id}
                />

                <Card className="p-6">
                    <CharacterSheet 
                        character={character}
                        template={character.character_templates}
                        canEdit={canEdit}
                    />
                </Card>
            </div>
        );
    } catch (error) {
        console.error('Error in CharacterPage:', error);
        notFound();
    }
} 