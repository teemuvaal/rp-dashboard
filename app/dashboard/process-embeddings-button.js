'use client';

import { useState } from 'react';

// Function to process embeddings through the API
async function triggerEmbeddingProcess() {
    try {
        const response = await fetch('/api/embeddings/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error processing embeddings:', error);
        throw error;
    }
}

export default function ProcessEmbeddingsButton() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleClick = async () => {
        setIsProcessing(true);
        setError(null);
        setResult(null);
        
        try {
            const data = await triggerEmbeddingProcess();
            setResult(data);
            console.log('Embedding processing result:', data);
        } catch (err) {
            setError(err.message);
            console.error('Error:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="my-4">
            <button
                onClick={handleClick}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
            >
                {isProcessing ? 'Processing...' : 'Process Pending Embeddings'}
            </button>
            
            {error && (
                <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                    Error: {error}
                </div>
            )}
            
            {result && (
                <div className="mt-2 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
                    <p>Processed {result.total || 0} items</p>
                    <p>Successful: {result.successful || result.successes || 0}</p>
                    <p>Failed: {result.failed || result.failures || 0}</p>
                </div>
            )}
        </div>
    );
} 