'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
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
    const segments = pathname.split('/').filter(Boolean);

    // Map segments to readable names
    const getSegmentName = (segment) => {
        if (segment === campaign.id) return campaign.name;
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    };

    // Build breadcrumb items
    const items = segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;

        // Skip the campaign ID in the breadcrumb text
        if (segment === campaign.id) return null;

        return (
            <BreadcrumbItem key={path}>
                {isLast ? (
                    <BreadcrumbPage>{getSegmentName(segment)}</BreadcrumbPage>
                ) : (
                    <>
                        <BreadcrumbLink asChild>
                            <Link href={path}>{getSegmentName(segment)}</Link>
                        </BreadcrumbLink>
                        <BreadcrumbSeparator />
                    </>
                )}
            </BreadcrumbItem>
        );
    }).filter(Boolean); // Remove null items

    return (
        <Breadcrumb className="py-2">
            <BreadcrumbList>
                {items}
            </BreadcrumbList>
        </Breadcrumb>
    );
} 