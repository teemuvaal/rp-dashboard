import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card } from "@/components/ui/card";
import TemplateEditor from '@/components/Dashboard/Characters/Templates/TemplateEditor';

export default async function EditTemplatePage({ params }) {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch template with campaign info
    const { data: template } = await supabase
        .from('character_templates')
        .select(`
            *,
            campaigns (
                owner_id
            )
        `)
        .eq('id', params.templateId)
        .single();

    if (!template) {
        notFound();
    }

    // Only campaign owner can access this page
    if (template.campaigns.owner_id !== user?.id) {
        redirect(`/dashboard/${params.id}/characters`);
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Edit Template: {template.name}</h1>
                <p className="text-sm text-gray-500">
                    Customize the fields and layout of your character template
                </p>
            </div>

            <Card className="p-6">
                <TemplateEditor 
                    template={template}
                    campaignId={params.id}
                />
            </Card>
        </div>
    );
} 