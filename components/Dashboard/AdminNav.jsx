'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Database, Server, Code, AlignJustify, Gauge, Settings } from 'lucide-react';

const AdminNavItems = [
  {
    name: 'Embedding Management',
    description: 'Monitor and process text embeddings',
    href: '/dashboard/embedding-management',
    icon: Database,
  },
  {
    name: 'System Settings',
    description: 'Configure system parameters',
    href: '/dashboard/system-settings',
    icon: Settings,
    disabled: true,
  },
  {
    name: 'API Configuration',
    description: 'Manage API integrations',
    href: '/dashboard/api-config',
    icon: Code,
    disabled: true,
  },
  {
    name: 'Job Queue',
    description: 'View and manage background jobs',
    href: '/dashboard/job-queue',
    icon: AlignJustify,
    disabled: true,
  },
];

export default function AdminNav({ className }) {
  const pathname = usePathname();

  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
      <div className="flex flex-col space-y-1.5 p-4">
        <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
          <Server className="h-4 w-4" /> Admin Tools
        </h3>
        <p className="text-sm text-muted-foreground">System administration and management</p>
      </div>
      <div className="p-2">
        {AdminNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <div key={item.href} className="mb-1 last:mb-0">
              {item.disabled ? (
                <div 
                  className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground opacity-50"
                  title="Coming soon"
                >
                  <item.icon className="h-4 w-4" />
                  <div>
                    <div>{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors
                    ${isActive 
                      ? 'bg-accent text-accent-foreground' 
                      : 'hover:bg-accent/50 hover:text-accent-foreground'
                    }`}
                >
                  <item.icon className="h-4 w-4" />
                  <div>
                    <div>{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 