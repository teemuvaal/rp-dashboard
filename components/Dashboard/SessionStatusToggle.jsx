'use client';

import { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { updateSessionStatus } from '@/app/dashboard/actions';
import { useRouter } from 'next/navigation';

export default function SessionStatusToggle({ sessionId, campaignId, initialStatus }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState(initialStatus);
    const router = useRouter();

    const handleStatusChange = async (checked) => {
        setIsUpdating(true);
        setError(null);

        const newStatus = checked ? 'completed' : 'scheduled';
        const formData = new FormData();
        formData.append('sessionId', sessionId);
        formData.append('campaignId', campaignId);
        formData.append('status', newStatus);

        try {
            const result = await updateSessionStatus(formData);
            if (result.success) {
                setStatus(newStatus);
                router.refresh();
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to update session status');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
                {status === 'completed' ? 'Completed' : 'Scheduled'}
            </span>
            <Switch
                checked={status === 'completed'}
                onCheckedChange={handleStatusChange}
                disabled={isUpdating}
            />
            {error && (
                <span className="text-sm text-red-500">{error}</span>
            )}
        </div>
    );
} 