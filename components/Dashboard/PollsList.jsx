'use client';

import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { updatePoll } from "@/app/dashboard/actions";
import { useRouter } from 'next/navigation';

export default function PollsList({ polls, campaignId, isActive }) {
    const router = useRouter();
    const [updating, setUpdating] = useState(null);

    const handleToggleActive = async (pollId, currentState) => {
        setUpdating(pollId);
        try {
            const formData = new FormData();
            formData.append('pollId', pollId);
            formData.append('campaignId', campaignId);
            formData.append('isActive', !currentState);

            const result = await updatePoll(formData);
            if (result.success) {
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to update poll:', error);
        } finally {
            setUpdating(null);
        }
    };

    if (polls.length === 0) {
        return (
            <p className="text-sm text-gray-500">
                No {isActive ? 'active' : 'inactive'} polls found.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {polls.map((poll) => {
                const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes?.[0]?.count || 0), 0);
                
                return (
                    <Card key={poll.id}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{poll.title}</CardTitle>
                                    {poll.description && (
                                        <CardDescription>{poll.description}</CardDescription>
                                    )}
                                </div>
                                <Switch
                                    checked={poll.is_active}
                                    disabled={updating === poll.id}
                                    onCheckedChange={() => handleToggleActive(poll.id, poll.is_active)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {poll.options.map((option) => {
                                    const voteCount = option.votes?.[0]?.count || 0;
                                    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                                    
                                    return (
                                        <div key={option.id} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>{option.option_text}</span>
                                                <span className="text-gray-500">
                                                    {voteCount} vote{voteCount !== 1 ? 's' : ''} ({Math.round(percentage)}%)
                                                </span>
                                            </div>
                                            <Progress value={percentage} className="h-2" />
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 text-sm text-gray-500">
                                Total votes: {totalVotes}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
} 