import Feed from "@/components/DashboardFeed";
import { createClient } from '@/utils/supabase/server'
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchFeedItems, createPost } from '../actions'

export default async function CampaignFeed({ params }) {
    const supabase = createClient()
    
    // Fetch user information
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user is an owner
    const { data: membership } = await supabase
        .from('campaign_members')
        .select('role')
        .eq('campaign_id', params.id)
        .eq('user_id', user.id)
        .single()

    const isOwner = membership?.role === 'owner'

    // Fetch feed items
    const feedItems = await fetchFeedItems(params.id)

    // Fetch calendar events
    const sessions = await fetchSessions(params.id)
    
    return (
        <div>
            <div className="flex justify-start mt-4">
                {isOwner && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                            >
                                Add Post
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Post</DialogTitle>
                                <DialogDescription>
                                    Add a public post that will be displayed in the front page of your campaign.
                                </DialogDescription>
                                <form
                                    action={createPost}
                                    className="flex flex-col gap-4"
                                >
                                    <input type="hidden" name="campaignId" value={params.id} />
                                    <label htmlFor="title">Title</label>
                                    <Input id="title" name="title" required />
                                    <label htmlFor="content">Content</label>
                                    <Textarea id="content" name="content" required />
                                    <Button type="submit">Add post</Button>
                                </form>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>                 
                )}
            </div>
            <div>
                <Feed feedItems={feedItems} sessions={sessions} isOwner={isOwner} />
            </div>
        </div>
    );
}

// Implement these functions to fetch actual data
async function fetchSessions(campaignId) {
    const supabase = createClient()
    
    // Fetch sessions for the campaign
    const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('scheduled_date', { ascending: true })

    if (error) {
        console.error('Error fetching sessions:', error)
        return <div>Error loading sessions</div>
    }

    return sessions
}