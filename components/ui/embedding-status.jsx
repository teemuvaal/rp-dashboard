import { useState, useEffect } from 'react';
import { Loader2, Check, AlertCircle, RefreshCw } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { checkEmbeddingStatus, retryEmbedding } from '@/utils/embeddings-client';
import { useToast } from "@/hooks/use-toast";

export function EmbeddingStatus({ contentType, contentId }) {
    console.log('EmbeddingStatus rendered with:', { contentType, contentId });

    const [status, setStatus] = useState('loading');
    const [error, setError] = useState(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [rateLimitReset, setRateLimitReset] = useState(null);
    const { toast } = useToast();

    const checkStatus = async () => {
        if (!contentType || !contentId) {
            console.error('Missing required props:', { contentType, contentId });
            setStatus(null);
            return;
        }

        try {
            console.log('Checking status for:', { contentType, contentId });
            const result = await checkEmbeddingStatus(contentType, contentId);
            console.log('Status check result:', result);
            
            if (!result) {
                console.log('No embedding record found');
                setStatus('not_found');
                return;
            }
            
            setStatus(result.status);
            setError(result.error_message);
        } catch (err) {
            console.error('Error checking embedding status:', err);
            setError(err.message);
            setStatus('error');
        }
    };

    useEffect(() => {
        checkStatus();
        
        // Check status every 30 seconds if still pending
        const interval = setInterval(() => {
            if (status === 'pending') {
                checkStatus();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [contentType, contentId, status]);

    const handleRetry = async (e) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation(); // Prevent event bubbling

        if (isRetrying) return;

        // Check if we're still rate limited
        if (rateLimitReset && Date.now() < rateLimitReset) {
            const secondsRemaining = Math.ceil((rateLimitReset - Date.now()) / 1000);
            toast({
                title: "Rate limit exceeded",
                description: `Please wait ${secondsRemaining} seconds before retrying again.`,
                variant: "destructive",
            });
            return;
        }

        setIsRetrying(true);
        try {
            await retryEmbedding(contentType, contentId);
            setStatus('pending');
            setError(null);
            setRateLimitReset(null);
            toast({
                title: "Retry initiated",
                description: "The content will be processed again for AI search.",
            });
        } catch (err) {
            console.error('Error retrying embedding:', err);
            
            // Handle rate limiting error
            if (err.status === 429) {
                const resetTime = Date.now() + (err.reset * 1000);
                setRateLimitReset(resetTime);
                toast({
                    title: "Rate limit exceeded",
                    description: `Too many retry attempts. Please wait ${Math.ceil(err.reset)} seconds.`,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Retry failed",
                    description: err.message,
                    variant: "destructive",
                });
            }
        } finally {
            setIsRetrying(false);
        }
    };

    // Debug log for render conditions
    console.log('Render conditions:', { status, error, isVisible: status !== null });

    // Show loading state
    if (status === 'loading') {
        return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
    }

    // Don't render anything if no status (not found in DB)
    if (!status || status === 'not_found') return null;

    const isRateLimited = rateLimitReset && Date.now() < rateLimitReset;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <div className="inline-flex items-center gap-2">
                        {status === 'pending' && (
                            <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                        )}
                        {status === 'completed' && (
                            <Check className="h-4 w-4 text-green-500" />
                        )}
                        {(status === 'failed' || status === 'error') && (
                            <div className="flex items-center gap-1">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 p-0.5"
                                    onClick={handleRetry}
                                    disabled={isRetrying || isRateLimited}
                                >
                                    <RefreshCw className={`h-4 w-4 text-red-500 ${isRetrying ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    {status === 'pending' && 'Processing for AI search...'}
                    {status === 'completed' && 'Available for AI search'}
                    {(status === 'failed' || status === 'error') && (
                        <div className="text-sm">
                            <p>Failed to process: {error || 'Unknown error'}</p>
                            {isRateLimited ? (
                                <p className="text-xs mt-1 text-yellow-500">
                                    Rate limited. Please wait before retrying.
                                </p>
                            ) : (
                                <p className="text-xs mt-1">Click the retry button to try again</p>
                            )}
                        </div>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
} 