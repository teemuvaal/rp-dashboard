'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createPoll } from "@/app/dashboard/actions";
import { PlusCircle, MinusCircle } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function CreatePollForm({ campaignId }) {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [allowMultiple, setAllowMultiple] = useState(false);
    const [options, setOptions] = useState(['', '']); // Start with 2 empty options
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddOption = () => {
        if (options.length < 10) {
            setOptions([...options, '']);
        }
    };

    const handleRemoveOption = (index) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        // Validation
        if (!title.trim()) {
            setError('Title is required');
            setIsSubmitting(false);
            return;
        }

        const validOptions = options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
            setError('At least 2 options are required');
            setIsSubmitting(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('campaignId', campaignId);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('allowMultiple', allowMultiple);
            formData.append('options', JSON.stringify(validOptions));

            const result = await createPoll(formData);
            
            if (result.success) {
                // Reset form
                setTitle('');
                setDescription('');
                setAllowMultiple(false);
                setOptions(['', '']);
                router.refresh();
            } else {
                setError(result.error || 'Failed to create poll');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter poll title"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter poll description"
                />
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                    id="allow-multiple"
                    checked={allowMultiple}
                    onCheckedChange={setAllowMultiple}
                />
                <Label htmlFor="allow-multiple">Allow multiple selections</Label>
            </div>

            <div className="space-y-4">
                <Label>Options</Label>
                {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <Input
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            required
                        />
                        {options.length > 2 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveOption(index)}
                            >
                                <MinusCircle className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ))}
                {options.length < 10 && (
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleAddOption}
                    >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Option
                    </Button>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Creating...' : 'Create Poll'}
            </Button>
        </form>
    );
} 