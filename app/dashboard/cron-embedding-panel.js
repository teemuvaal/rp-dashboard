'use client';

import { useState } from 'react';

// Function to process embeddings through the cron API
async function triggerCronProcess() {
    try {
        // Generate a temporary token that matches the expected format in the API
        const tempToken = process.env.NEXT_PUBLIC_DEV_CRON_TOKEN || 'dev-cron-token';
        
        const response = await fetch('/api/cron/process-embeddings', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tempToken}`
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error processing cron job:', error);
        throw error;
    }
}

export default function CronEmbeddingPanel() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [logMessages, setLogMessages] = useState([]);

    const addLogMessage = (message) => {
        setLogMessages(prev => [...prev, { 
            time: new Date().toISOString().split('T')[1].split('.')[0], 
            message 
        }]);
    };

    const handleClick = async () => {
        setIsProcessing(true);
        setError(null);
        setResult(null);
        addLogMessage('Starting cron job for embedding processing...');
        
        try {
            const data = await triggerCronProcess();
            setResult(data);
            addLogMessage(`Completed: Processed ${data.processed || 0} items (${data.successes || 0} successful, ${data.failures || 0} failed)`);
            console.log('Cron embedding processing result:', data);
        } catch (err) {
            setError(err.message);
            addLogMessage(`Error: ${err.message}`);
            console.error('Error:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const clearLog = () => {
        setLogMessages([]);
    };

    return (
        <div className="my-4 p-4 border rounded-lg bg-background shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Embedding Processing Scheduler</h3>
            
            <div className="flex flex-col md:flex-row gap-2 mb-4">
                <button
                    onClick={handleClick}
                    disabled={isProcessing}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
                >
                    {isProcessing ? 'Processing...' : 'Run Embedding Cron Job'}
                </button>
                
                <button
                    onClick={clearLog}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
                >
                    Clear Log
                </button>
            </div>
            
            {error && (
                <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                    Error: {error}
                </div>
            )}
            
            {result && (
                <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
                    <p>Processed: {result.processed || 0} items</p>
                    <p>Successful: {result.successes || 0}</p>
                    <p>Failed: {result.failures || 0}</p>
                </div>
            )}
            
            <div className="border rounded-lg overflow-hidden">
                <div className="bg-background px-3 py-2 border-b font-medium">Process Log</div>
                <div className="p-2 bg-black text-white font-mono text-sm h-48 overflow-y-auto">
                    {logMessages.length === 0 ? (
                        <div className="text-gray-500 italic">No log messages yet...</div>
                    ) : (
                        logMessages.map((log, index) => (
                            <div key={index} className="mb-1">
                                <span className="text-gray-400">[{log.time}]</span> {log.message}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
} 