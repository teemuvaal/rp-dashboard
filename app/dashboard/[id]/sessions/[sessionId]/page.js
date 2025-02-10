import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, Users, NotebookPen, CalendarClock, Sparkles } from "lucide-react"
import Link from "next/link"
import LinkNoteToSession from "@/components/Dashboard/LinkNoteToSession"
import SessionStatusToggle from "@/components/Dashboard/SessionStatusToggle"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import SessionSummary from "@/components/Dashboard/SessionSummary"


export default async function SessionPage({ params }) {
    const sessionId = params.sessionId;
    const campaignId = params.id;
    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // Check if user has audio access
    const { data: hasAudioAccess } = await supabase
        .rpc('user_has_audio_narration', { user_id: user.id });

    // Fetch session with campaign info
    const { data: session, error } = await supabase
        .from('sessions')
        .select(`
            *,
            campaigns (
                name,
                owner_id
            )
        `)
        .eq('id', sessionId)
        .single();

    if (error || !session) {
        notFound();
    }

    // Check if user is campaign member
    const { data: membership } = await supabase
        .from('campaign_members')
        .select('role')
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id)
        .single();

    if (!membership) {
        redirect(`/dashboard/${campaignId}`);
    }

    // Fetch linked notes
    const { data: linkedNotes } = await supabase
        .from('notes')
        .select(`
            *,
            users (
                username,
                profile_picture
            )
        `)
        .eq('session_id', sessionId)
        .eq('campaign_id', campaignId)
        .or(`is_public.eq.true,user_id.eq.${user.id}`);

    // Fetch available notes for linking
    const { data: availableNotes } = await supabase
        .from('notes')
        .select(`
            *,
            users (
                username,
                profile_picture
            )
        `)
        .eq('campaign_id', campaignId)
        .is('session_id', null)
        .or(`is_public.eq.true,user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

    const isOwner = session.campaigns.owner_id === user.id;
    const formattedDate = new Date(session.scheduled_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const formattedTime = new Date(session.scheduled_date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">{session.name}</CardTitle>
                            <CardDescription>{session.description}</CardDescription>
                        </div>
                        {isOwner && (
                            <div className="flex items-center gap-4">
                                <SessionStatusToggle
                                    sessionId={sessionId}
                                    campaignId={campaignId}
                                    initialStatus={session.status}
                                />
                                <Button variant="outline" asChild>
                                    <Link href={`/dashboard/${campaignId}/sessions/${sessionId}/edit`}>
                                        Edit Session
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center space-x-2">
                            <CalendarDays className="h-4 w-4 opacity-70" />
                            <span className="text-sm text-muted-foreground">{formattedDate}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 opacity-70" />
                            <span className="text-sm text-muted-foreground">
                                {formattedTime} ({session.duration_minutes} minutes)
                            </span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <CalendarClock className="h-4 w-4 opacity-70" />
                            <span className="text-sm text-muted-foreground">
                                {session.status}
                            </span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 opacity-70" />
                            <span className="text-sm text-muted-foreground">
                                Campaign: {session.campaigns.name}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <SessionSummary session={session} hasAudioAccess={hasAudioAccess} />

            {/* Notes Section */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <NotebookPen className="h-5 w-5" />
                                Session Notes
                            </CardTitle>
                            <CardDescription>
                                Link existing notes to this session
                            </CardDescription>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={`/dashboard/${campaignId}/notes/new`}>
                                Create New Note
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Link Notes Dropdown */}
                    {availableNotes?.length > 0 && (
                        <Accordion type="single" collapsible>
                            <AccordionItem value="link-notes">
                                <AccordionTrigger>Link Existing Note</AccordionTrigger>
                                <AccordionContent>
                                    <LinkNoteToSession
                                        availableNotes={availableNotes}
                                        sessionId={sessionId}
                                        campaignId={campaignId}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}

                    {/* Linked Notes */}
                    {linkedNotes?.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Linked Notes</h3>
                            <div className="space-y-4">
                                {linkedNotes.map(note => (
                                    <Card key={note.id}>
                                        <CardHeader>
                                            <CardTitle>{note.title}</CardTitle>
                                            <CardDescription>
                                                By {note.users.username} • {note.is_public ? 'Public' : 'Private'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div dangerouslySetInnerHTML={{ __html: note.content }} />
                                        </CardContent>
                                        <CardFooter>
                                            <Button variant="outline" asChild>
                                                <Link href={`/dashboard/${campaignId}/notes/${note.id}`}>
                                                    View Full Note
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}