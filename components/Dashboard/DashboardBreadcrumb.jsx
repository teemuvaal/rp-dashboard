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
        if (segment === campaign.id) return campaign.name;
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    };

    const breadcrumbItems = segments
        .map((segment, index) => {
            if (segment === campaign.id) return null;
            
            const path = `/${segments.slice(0, index + 1).join('/')}`;
            const isLast = index === segments.length - 1;
            
            return {
                segment,
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
                            <BreadcrumbPage>{getSegmentName(item.segment)}</BreadcrumbPage>
                        ) : (
                            <BreadcrumbLink asChild>
                                <Link href={item.path}>{getSegmentName(item.segment)}</Link>
                            </BreadcrumbLink>
                        )}
                        {!item.isLast && <BreadcrumbSeparator />}
                    </BreadcrumbItem>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
} 