import Link from 'next/link';
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
import { Edit, Trash2 } from 'lucide-react';
import { DeleteTemplateButton } from './DeleteTemplateButton';

export default function TemplateList({ templates, campaignId }) {
    if (!templates.length) {
        return (
            <div className="text-center py-8 text-gray-500">
                No character templates have been created yet.
                Create your first template to allow players to create characters.
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Characters</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {templates.map((template) => (
                    <TableRow key={template.id}>
                        <TableCell className="font-medium">
                            <Link 
                                href={`/dashboard/${campaignId}/characters/templates/${template.id}/edit`}
                                className="hover:underline"
                            >
                                {template.name}
                            </Link>
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                            {template.description}
                        </TableCell>
                        <TableCell>
                            {template.characters.count} character{template.characters.count !== 1 ? 's' : ''}
                        </TableCell>
                        <TableCell>
                            {formatDistanceToNow(new Date(template.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                <Link 
                                    href={`/dashboard/${campaignId}/characters/templates/${template.id}/edit`}
                                    passHref
                                >
                                    <Button variant="outline" size="sm">
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">Edit</span>
                                    </Button>
                                </Link>
                                
                                <DeleteTemplateButton 
                                    templateId={template.id}
                                    campaignId={campaignId}
                                    disabled={template.characters.count > 0}
                                />
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
} 