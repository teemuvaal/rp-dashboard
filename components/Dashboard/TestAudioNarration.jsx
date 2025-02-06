'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TestAudioNarration() {
    const [text, setText] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { toast } = useToast();

    const handleGenerateAudio = async () => {
        if (!text) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please enter some text to narrate.",
            });
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('/api/generate-audio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    modelId: "eleven_multilingual_v2",
                    voiceId: "JBFqnCBsd6RMkjVDRZzb", // Default voice ID
                    outputFormat: "mp3_44100_128"
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate audio');
            }

            setAudioUrl(data.audioUrl);
            
            toast({
                title: "Success",
                description: "Audio generated successfully!",
            });
        } catch (error) {
            console.error('Error generating audio:', error);
            setError(error.message);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to generate audio",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Test Audio Narration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder="Enter text to narrate..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={6}
                />
                <div className="flex justify-between items-center">
                    <Button
                        onClick={handleGenerateAudio}
                        disabled={isLoading || !text}
                    >
                        {isLoading ? 'Generating...' : 'Generate Audio'}
                    </Button>
                </div>
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {audioUrl && (
                    <div className="mt-4">
                        <audio controls src={audioUrl} className="w-full" />
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 