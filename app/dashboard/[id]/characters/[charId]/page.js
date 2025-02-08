import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Card } from "@/components/ui/card";
import CharacterSheet from '@/components/Dashboard/Characters/CharacterSheet';
import CharacterHeader from '@/components/Dashboard/Characters/CharacterHeader';

export default async function CharacterPage({ params }) {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch character with template and user info
    const { data: character } = await supabase
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
        .single();

    if (!character) {
        notFound();
    }

    // Check if user is campaign owner
    const { data: campaign } = await supabase
        .from('campaigns')
        .select('owner_id')
        .eq('id', params.id)
        .single();
    
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
} 