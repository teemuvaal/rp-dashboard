"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import DarkModeToggle from "@/components/Dashboard/DarkModeToggle"
import { motion } from "framer-motion";
import { getUserDetails } from "@/app/dashboard/actions";
import { useState, useEffect } from "react";
const links = [
    {
        label: "Home",
        href: "#top",
    },
    {
        label: "Features",
        href: "#features",
    },
    {
        label: "FAQ",
        href: "#faq",
    },
]

export default function LandingPageNav() {
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            const userDetails = await getUserDetails();
            setUserDetails(userDetails);
        };
        fetchUserDetails();
    }, []);
    console.log(userDetails);

    return (
        <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Brand */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center space-x-2">
                            <span 
                                style={{ fontFamily: 'var(--font-departure-mono)' }}
                                className="text-lg font-semibold"
                            >
                                AdventureHub.ai
                            </span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        <DarkModeToggle />
                        
                        {userDetails ? (
                            <Link href="/dashboard">
                                <Button variant="default" className="rounded-full" size="sm">
                                    Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <Button
                                variant="default"
                                className=""
                                size="sm"
                            >
                                Sign In
                            </Button>
                        </Link>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}