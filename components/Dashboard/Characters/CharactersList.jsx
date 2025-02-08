import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from 'date-fns';

export default function CharactersList({ characters, campaignId, isOwner }) {
    if (!characters.length) {
        return (
            <div className="text-center py-8 text-gray-500">
                No characters have been created yet.
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Character</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {characters.map((character) => (
                    <TableRow key={character.id}>
                        <TableCell className="font-medium">
                            <Link 
                                href={`/dashboard/${campaignId}/characters/${character.id}`}
                                className="hover:underline"
                            >
                                {character.name}
                            </Link>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={character.users?.profile_picture} />
                                    <AvatarFallback>{character.users?.username?.[0]?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                {character.users?.username}
                            </div>
                        </TableCell>
                        <TableCell>{character.character_templates?.name}</TableCell>
                        <TableCell>{formatDistanceToNow(new Date(character.created_at), { addSuffix: true })}</TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                character.is_active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                            }`}>
                                {character.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </TableCell>
                        <TableCell className="text-right">
                            <Link href={`/dashboard/${campaignId}/characters/${character.id}`}>
                                <Button variant="outline" size="sm">
                                    View
                                </Button>
                            </Link>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
} 