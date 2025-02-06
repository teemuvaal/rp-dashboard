'use client';

import { useEffect, useState } from 'react';
import { fetchUserSubscription } from '@/app/dashboard/actions';
import { Badge } from "@/components/ui/badge";
import { CreditCard, Crown } from "lucide-react";
import { format } from 'date-fns';

export default function SubscriptionStatus({ showDetails = false }) {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSubscription = async () => {
            const result = await fetchUserSubscription();
            if (result.success) {
                setSubscription(result.subscription);
            }
            setLoading(false);
        };
        loadSubscription();
    }, []);

    if (loading) {
        return <div className="text-muted-foreground text-sm">Loading...</div>;
    }

    if (!subscription) {
        return <div className="text-muted-foreground text-sm">No subscription found</div>;
    }

    const isPro = subscription.planName === 'pro';

    // Simple badge-only view
    if (!showDetails) {
        return (
            <Badge variant={isPro ? "default" : "secondary"} className="gap-1">
                {isPro ? <Crown className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                {subscription.planName.charAt(0).toUpperCase() + subscription.planName.slice(1)}
            </Badge>
        );
    }

    // Detailed view
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Badge variant={isPro ? "default" : "secondary"} className="gap-1">
                    {isPro ? <Crown className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                    {subscription.planName.charAt(0).toUpperCase() + subscription.planName.slice(1)}
                </Badge>
                <Badge variant={subscription.isActive ? "success" : "destructive"}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </Badge>
            </div>
            {showDetails && (
                <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">{subscription.planDescription}</p>
                    {subscription.currentPeriodEnd && (
                        <p className="text-xs text-muted-foreground">
                            Valid until: {format(new Date(subscription.currentPeriodEnd), 'PPP')}
                        </p>
                    )}
                    <div className="mt-2">
                        <h4 className="text-sm font-medium mb-1">Features:</h4>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                            {Object.entries(subscription.features).map(([key, value]) => (
                                <li key={key} className="flex items-center gap-2">
                                    <span>
                                        {key.split('_').map(word => 
                                            word.charAt(0).toUpperCase() + word.slice(1)
                                        ).join(' ')}:
                                    </span>
                                    <span>
                                        {typeof value === 'boolean' 
                                            ? (value ? 'Yes' : 'No')
                                            : value === -1 
                                                ? 'Unlimited' 
                                                : value}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
} 