"use client"

import Logout from "@/components/ui/Logout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import DarkModeToggle from "@/components/Dashboard/DarkModeToggle"

export default function TopNav() {
    return (
        <div className="w-full py-2 px-2 flex flex-row justify-between">
            <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
            </Link>
                <div className="flex justify-end w-full">
                <DarkModeToggle />
                <Logout />
            </div>
        </div>
    )
}