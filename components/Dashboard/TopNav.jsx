"use client"

import Logout from "@/components/ui/Logout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import DarkModeToggle from "@/components/Dashboard/DarkModeToggle"
import { User } from "lucide-react"

export default function TopNav({ user }) {
    return (
        <div className="w-full py-2 px-2 flex flex-row justify-between">
            <span className="flex flex-row gap-2">
                <Link href="/dashboard">
                    <Button variant="outline">Dashboard</Button>
                </Link>
            <Link href="/dashboard/profile">
                <Button variant="outline" className="flex flex-row gap-2 items-center w-36">
                    <span className="flex flex-row gap-2 items-center">
                    {user.profile_picture ? <img src={user.profile_picture} alt="Profile picture" className="w-8 h-8 rounded-full" /> : <User className="w-8 h-8" />}
                    Profile
                    </span>
                </Button>
                </Link>
            </span>
            <div className="flex justify-end w-full">
                <span className="flex flex-row gap-2">
                    <DarkModeToggle />
                    <Logout />
                </span>
            </div>
        </div>
    )
}