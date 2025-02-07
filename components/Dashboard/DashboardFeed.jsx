import FeedTile from "./FeedTile";
import CalendarTile from "./CalendarTile";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator";
import PollCard from "./PollCard";
import { ChartBar } from "lucide-react";
import Link from "next/link";
import CreatePostDialog from "./CreatePostDialog";
import DashboardHero from "@/components/Dashboard/DashboardHero"

export default function Feed({ feedItems = [], sessions = [], polls = [], isOwner = false, campaignId, createPost, campaign }) {
    // Ensure polls is an array and filter active ones
    const activePolls = Array.isArray(polls) ? polls.filter(poll => poll.is_active) : [];

    // Ensure we have the campaign object
    const campaignDetails = campaign?.campaign || {};

    return (
        <>
        <DashboardHero 
            name={campaignDetails.name} 
            description={campaignDetails.description} 
            image={campaignDetails.campaign_image} 
        />
        <Card>
            <div className="w-full flex flex-col lg:flex-row p-2 sm:p-4 mb-auto gap-2 h-full">
                <div className="w-full lg:w-2/3 p-2 sm:p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold">Feed</h1>
                            <p className="text-xs sm:text-sm font-light text-gray-500">Latest events, posts, etc. from the campaign</p>
                        </div>
                        <div className="flex gap-2">
                            {isOwner && (
                                <Link href={`/dashboard/${campaignId}/polls`}>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-full"
                                    >
                                        <ChartBar className="w-4 h-4 mr-2" />
                                        Manage Polls
                                    </Button>
                                </Link>
                            )}
                            {isOwner && (
                                <CreatePostDialog campaignId={campaignId} createPost={createPost} />
                            )}
                        </div>
                    </div>
                    <section className="space-y-4">
                        {/* Feed Items */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Recent Posts</h2>
                            </div>
                            {feedItems.length > 0 ? (
                                feedItems.map((item) => (
                                    <FeedTile 
                                        key={item.id}
                                        title={item.title} 
                                        content={item.content}
                                        author={item.author}
                                        authorUsername={item.authorUsername}
                                        authorProfilePicture={item.authorProfilePicture}
                                        createdAt={item.created_at}
                                    />
                                ))
                            ) : (
                                <p className="text-gray-500">No posts available.</p>
                            )}
                        </div>
                    </section>
                </div>
                <div className="w-full lg:w-1/3 p-2 sm:p-4 space-y-6">
                    <CalendarTile sessions={sessions} />
                    
                    {/* Active Polls Section */}
                    {activePolls.length > 0 && (
                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Active Polls</h2>
                                <p className="text-sm text-gray-500">
                                    {activePolls.length} active poll{activePolls.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="space-y-4">
                                {activePolls.map((poll) => (
                                    <PollCard 
                                        key={poll.id}
                                        poll={poll}
                                        campaignId={campaignId}
                                        isOwner={isOwner}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>  
        </>
    )
}