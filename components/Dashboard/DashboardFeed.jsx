import FeedTile from "./FeedTile";
import CalendarTile from "./CalendarTile";
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
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  

export default function Feed({ feedItems, sessions, isOwner, campaignId, createPost }) {
    return (
        <div className="w-full flex flex-col lg:flex-row p-2 sm:p-4 mb-auto gap-2 h-full">
            <div className="w-full lg:w-2/3 border border-gray-200 rounded-md p-2 sm:p-4 shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold">Feed</h1>
                        <p className="text-xs sm:text-sm font-light text-gray-500">Latest events, posts, etc. from the campaign</p>
                    </div>
                    {isOwner && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    className="bg-stone-900 hover:bg-stone-800 rounded-full"
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
                                        <input type="hidden" name="campaignId" value={campaignId} />
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
                <section className="space-y-4">
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
                        <p>No feed items available.</p>
                    )}
                </section>
            </div>
            <div className="w-full lg:w-1/3 p-2 sm:p-4">
                <CalendarTile sessions={sessions} />
            </div>
        </div>  
    )
}