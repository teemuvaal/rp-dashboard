'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function DashboardBreadcrumb({ campaign }) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render anything until mounted to prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    const segments = pathname.split('/').filter(Boolean);

    // Map segments to readable names
    const getSegmentName = (segment) => {
        if (segment === campaign.id) return 'Dashboard';
        if (segment === 'dashboard') return null; // Skip the dashboard segment
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    };

    // Filter out the 'dashboard' segment and create breadcrumb items
    const breadcrumbItems = segments
        .map((segment, index) => {
            if (segment === 'dashboard') return null;
            
            const path = `/${segments.slice(0, index + 1).join('/')}`;
            const name = getSegmentName(segment);
            const isLast = index === segments.length - 1;
            
            // Skip if no name (happens for 'dashboard' segment)
            if (!name) return null;
            
            return {
                name,
                path,
                isLast
            };
        })
        .filter(Boolean);

    return (
        <Breadcrumb className="py-2">
            <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                    <BreadcrumbItem key={item.path}>
                        {item.isLast ? (
                            <BreadcrumbPage>{item.name}</BreadcrumbPage>
                        ) : (
                            <BreadcrumbLink asChild>
                                <Link href={item.path}>{item.name}</Link>
                            </BreadcrumbLink>
                        )}
                        {!item.isLast && <BreadcrumbSeparator />}
                    </BreadcrumbItem>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
} 