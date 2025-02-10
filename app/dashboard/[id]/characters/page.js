import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Card } from "@/components/ui/card";
import CharactersList from '@/components/Dashboard/Characters/CharactersList';
import CreateCharacterButton from '@/components/Dashboard/Characters/CreateCharacterButton';
import ManageTemplatesButton from '@/components/Dashboard/Characters/ManageTemplatesButton';

export default async function CharactersPage({ params }) {
    const supabase = createClient();
    
    try {
        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
            console.error('Authentication error:', userError);
            throw new Error('Failed to get user');
        }

        console.log('User authenticated:', user.id);

        // Check if user is a member or owner of the campaign
        const { data: membership, error: membershipError } = await supabase
            .from('campaign_members')
            .select('role')
            .eq('campaign_id', params.id)
            .eq('user_id', user.id)
            .single();

        console.log('Campaign membership check:', { 
            campaignId: params.id,
            membership,
            error: membershipError
        });

        // Allow both 'member' and 'owner' roles
        if (membershipError || (!membership?.role && membership?.role !== 'member' && membership?.role !== 'owner')) {
            console.log('User is not a campaign member or owner');
            notFound();
        }
        
        // Check if user is campaign owner
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('owner_id')
            .eq('id', params.id)
            .single();
        
        if (campaignError) {
            console.error('Campaign fetch error:', campaignError);
            throw new Error('Failed to fetch campaign details');
        }
        
        console.log('Campaign owner check:', {
            campaignId: params.id,
            ownerId: campaign?.owner_id,
            isOwner: campaign?.owner_id === user?.id
        });
        
        const isOwner = campaign?.owner_id === user?.id;

        // Fetch characters for this campaign
        const { data: characters, error: charactersError } = await supabase
            .from('characters')
            .select(`
                *,
                users:user_id (
                    username,
                    profile_picture
                ),
                character_templates:template_id (
                    name,
                    description
                )
            `)
            .eq('campaign_id', params.id)
            .order('created_at', { ascending: false });

        if (charactersError) {
            console.error('Error fetching characters:', charactersError);
            throw new Error('Failed to fetch characters');
        }

        console.log('Characters fetched:', characters?.length || 0);

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
    } catch (error) {
        console.error('Error in CharactersPage:', error);
    }
} 