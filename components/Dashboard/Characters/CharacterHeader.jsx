import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';

export default function CharacterHeader({ character, canEdit, campaignId }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-2xl">{character.name}</CardTitle>
                    <CardDescription>
                        Created {formatDistanceToNow(new Date(character.created_at), { addSuffix: true })}
                    </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="text-sm text-right">
                        <p className="font-medium">{character.users?.username}</p>
                        <p className="text-gray-500">Owner</p>
                    </div>
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={character.users?.profile_picture} />
                        <AvatarFallback>
                            {character.users?.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-sm text-gray-500">
                    <p>Template: {character.character_templates?.name}</p>
                    {character.character_templates?.description && (
                        <p className="mt-1">{character.character_templates.description}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 