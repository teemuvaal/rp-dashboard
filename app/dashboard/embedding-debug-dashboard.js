'use client';

import { useState, useEffect } from 'react';
import ProcessEmbeddingsButton from './process-embeddings-button';
import CronEmbeddingPanel from './cron-embedding-panel';

// Helper function to check embedding status
async function checkEmbeddingStatus() {
    try {
        const response = await fetch('/api/embeddings/status', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error checking embedding status:', error);
        throw error;
    }
}

export default function EmbeddingDebugDashboard() {
    const [status, setStatus] = useState(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(false);
    const [error, setError] = useState(null);
    
    const fetchStatus = async () => {
        setIsLoadingStatus(true);
        setError(null);
        
        try {
            const data = await checkEmbeddingStatus();
            setStatus(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching status:', err);
        } finally {
            setIsLoadingStatus(false);
        }
    };
    
    useEffect(() => {
        fetchStatus();
        // Poll every 30 seconds
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, []);
    
    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">Embedding Management Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold mb-4">Manual Processing</h3>
                    <ProcessEmbeddingsButton />
                </div>
                
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold mb-4">Status Overview</h3>
                    <div className="space-y-2">
                        <button 
                            onClick={fetchStatus} 
                            disabled={isLoadingStatus}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 w-full"
                        >
                            {isLoadingStatus ? 'Refreshing...' : 'Refresh Status'}
                        </button>
                        
                        {error && (
                            <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                                Error: {error}
                            </div>
                        )}
                        
                        {status && (
                            <div className="border rounded-lg overflow-hidden">
                                <div className="bg-gray-100 p-2 border-b font-medium">Embedding Queue Status</div>
                                <div className="p-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="font-medium">Pending:</div>
                                        <div>{status.pending || 0}</div>
                                        
                                        <div className="font-medium">Completed:</div>
                                        <div>{status.completed || 0}</div>
                                        
                                        <div className="font-medium">Failed:</div>
                                        <div>{status.failed || 0}</div>
                                        
                                        <div className="font-medium">Total:</div>
                                        <div>{status.total || 0}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <CronEmbeddingPanel />
            
            <div className="mt-8 bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-4">Implementation Guide</h3>
                <div className="prose max-w-none">
                    <p>
                        To ensure embeddings are properly processed:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>Content should be queued for embedding when created or updated</li>
                        <li>Processing can be triggered:
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Manually using the ProcessEmbeddings button</li>
                                <li>Via scheduled cron job</li>
                                <li>After content creation/update (may have timeout limits)</li>
                            </ul>
                        </li>
                        <li>Set up a Supabase Edge Function or external cron service to call <code className="bg-gray-100 px-1 rounded">/api/cron/process-embeddings</code> endpoint</li>
                        <li>Ensure your OpenAI API key is properly configured</li>
                    </ol>
                </div>
            </div>
        </div>
    );
} 