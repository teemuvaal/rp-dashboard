"use client"

import Image from "next/image";
import Link from "next/link";
import { Github, Twitter } from "lucide-react";

const footerLinks = [
    {
        title: "Product",
        links: [
            { label: "Features", href: "#features" },
            { label: "FAQ", href: "#faq" },
            { label: "About", href: "#about" },
        ]
    },
    {
        title: "Resources",
        links: [
            { label: "Documentation", href: "#" },
            { label: "Privacy Policy", href: "#" },
            { label: "Terms of Service", href: "#" },
        ]
    },
    {
        title: "Community",
        links: [
            { label: "Discord", href: "#", icon: <Twitter className="h-4 w-4" /> },
            { label: "Twitter", href: "#", icon: <Twitter className="h-4 w-4" /> },
            { label: "GitHub", href: "#", icon: <Github className="h-4 w-4" /> },
        ]
    }
];

export default function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Image 
                                src="/dice.png" 
                                alt="AdventureHub.ai Logo" 
                                height={40} 
                                width={40}
                                className="rounded-lg"
                            />
                            <span 
                                style={{ fontFamily: 'var(--font-departure-mono)' }}
                                className="text-lg font-semibold"
                            >
                                AdventureHub.ai
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Plan, manage and run your adventures with help from AI
                        </p>
                    </div>

                    {/* Links Sections */}
                    {footerLinks.map((section) => (
                        <div key={section.title} className="space-y-4">
                            <h3 className="text-sm font-semibold">{section.title}</h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link 
                                            href={link.href}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                                        >
                                            {link.icon && link.icon}
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 pt-8 border-t">
                    <p className="text-sm text-muted-foreground text-center">
                        © {new Date().getFullYear()} AdventureHub.ai. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}