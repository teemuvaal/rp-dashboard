'use client';

import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { votePoll, deletePoll } from "@/app/dashboard/actions";
import { Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PollCard({ poll, campaignId, isOwner }) {
    const router = useRouter();
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isVoting, setIsVoting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);

    // Calculate total votes
    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

    const handleVote = async () => {
        if (selectedOptions.length === 0) {
            setError("Please select an option");
            return;
        }

        setIsVoting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('pollId', poll.id);
            formData.append('campaignId', campaignId);
            formData.append('options', JSON.stringify(selectedOptions));

            const result = await votePoll(formData);
            if (!result.success) {
                setError(result.error || 'Failed to submit vote');
            } else {
                // Reset selection after successful vote
                setSelectedOptions([]);
                router.refresh();
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsVoting(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('pollId', poll.id);
            formData.append('campaignId', campaignId);

            const result = await deletePoll(formData);
            if (!result.success) {
                setError(result.error || 'Failed to delete poll');
            } else {
                router.refresh();
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOptionSelect = (optionId) => {
        if (poll.allow_multiple) {
            setSelectedOptions(prev => 
                prev.includes(optionId)
                    ? prev.filter(id => id !== optionId)
                    : [...prev, optionId]
            );
        } else {
            setSelectedOptions([optionId]);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{poll.title}</CardTitle>
                        {poll.description && (
                            <CardDescription>{poll.description}</CardDescription>
                        )}
                    </div>
                    {isOwner && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Poll</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this poll? This action cannot be undone.
                                        All votes will be permanently deleted.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-red-500 hover:bg-red-600"
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete Poll'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {poll.options.map((option) => (
                        <div key={option.id} className="space-y-2">
                            <div className="flex items-center space-x-2">
                                {poll.allow_multiple ? (
                                    <Checkbox
                                        id={option.id}
                                        checked={selectedOptions.includes(option.id)}
                                        onCheckedChange={() => handleOptionSelect(option.id)}
                                    />
                                ) : (
                                    <RadioGroup
                                        value={selectedOptions[0]}
                                        onValueChange={(value) => setSelectedOptions([value])}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value={option.id} id={option.id} />
                                        </div>
                                    </RadioGroup>
                                )}
                                <Label htmlFor={option.id}>{option.option_text}</Label>
                            </div>
                            <Progress 
                                value={totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0} 
                                className="h-2"
                            />
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500">
                                    {option.votes} vote{option.votes !== 1 ? 's' : ''} 
                                    ({totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0}%)
                                </p>
                                {option.voters && option.voters.length > 0 && (
                                    <div className="flex -space-x-2">
                                        <TooltipProvider>
                                            {option.voters.map((voter) => (
                                                <Tooltip key={voter.id}>
                                                    <TooltipTrigger asChild>
                                                        <div className="relative inline-block h-6 w-6 rounded-full bg-gray-100 ring-2 ring-white overflow-hidden">
                                                            {voter.profile_picture ? (
                                                                <Image
                                                                    src={voter.profile_picture}
                                                                    alt={voter.username}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                                                                    {voter.username[0].toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        {voter.username}
                                                    </TooltipContent>
                                                </Tooltip>
                                            ))}
                                        </TooltipProvider>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {error && (
                    <p className="text-sm text-red-500 mt-2">{error}</p>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
                <p className="text-sm text-gray-500">
                    Total votes: {totalVotes}
                </p>
                <Button 
                    onClick={handleVote} 
                    disabled={isVoting || selectedOptions.length === 0}
                >
                    {isVoting ? 'Submitting...' : 'Vote'}
                </Button>
            </CardFooter>
        </Card>
    );
} 