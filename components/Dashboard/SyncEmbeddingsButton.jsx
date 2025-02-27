'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
    RefreshCw, 
    CheckCircle2, 
    AlertCircle
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Component for campaign owners to manually sync their content embeddings
 * This allows users to manually trigger embedding generation for their campaign content
 */
export default function SyncEmbeddingsButton({ campaignId, contentType }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [showResult, setShowResult] = useState(false);

    // Types of content that can be synced
    const contentTypes = contentType ? [contentType] : ['notes', 'assets'];
    
    const handleSync = async () => {
        setIsProcessing(true);
        setError(null);
        setResult(null);
        setShowResult(true);
        
        try {
            const response = await fetch('/api/embeddings/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    campaignId, 
                    contentTypes 
                }),
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            setResult(data);
            
            // Auto-hide result after 5 seconds
            setTimeout(() => {
                setShowResult(false);
            }, 5000);
        } catch (err) {
            setError(err.message);
            console.error('Error syncing embeddings:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="inline-flex items-center gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={handleSync}
                            disabled={isProcessing}
                            variant="outline"
                            size="sm"
                            className="gap-1"
                        >
                            <RefreshCw className={`h-4 w-4 ${isProcessing ? "animate-spin" : ""}`} />
                            {isProcessing 
                                ? "Syncing..." 
                                : contentType 
                                    ? `Sync ${contentType}` 
                                    : "Sync Content"
                            }
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Regenerate AI embeddings for better search</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            
            {showResult && (
                <div className={`text-sm transition-opacity 
                    ${error 
                        ? "text-red-600" 
                        : "text-green-600"
                    } flex items-center gap-1`}
                >
                    {error ? (
                        <>
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </>
                    ) : result ? (
                        <>
                            <CheckCircle2 className="h-4 w-4" />
                            {result.total ?? 0} items queued
                        </>
                    ) : null}
                </div>
            )}
        </div>
    );
} 