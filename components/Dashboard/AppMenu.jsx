"use client";

import Link from 'next/link';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { Newspaper, NotebookPen, Notebook, Beer, Users } from "lucide-react"
import CreateSessionForm from "@/components/Dashboard/CreateSessionForm"
import { Separator } from "@/components/ui/separator"
import AddNoteButton from "@/components/Dashboard/AddNoteButton"

// TODO: REFACTOR EACH MENU ITEM TO BE A COMPONENT

export default function AppMenu({params}) {
    return (
        <nav
        className="my-4"
        >
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>Campaign</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <div className="flex flex-col gap-2 w-[500px] h-[600px] p-4">
                                <span className="flex flex-row gap-2 justify-between">
                                <Link href={`/dashboard/${params.id}/`}>
                                <NavigationMenuLink  className={navigationMenuTriggerStyle()}>
                                    <Newspaper className="w-4 h-4 mr-2" />
                                    Feed
                                </NavigationMenuLink>
                                </Link>
                                <p className="text-sm text-gray-500">
                                    Go to campaing feed page to view calendar and posts.
                                </p>
                                </span>
                                <Separator className="my-4"/>
                                <h3 className="text-sm font-semibold text-gray-500">Admin tools</h3>
                                <span className="flex flex-row gap-2 justify-between">
                                <Link href={`/dashboard/${params.id}/details/`}>                                
                                    <NavigationMenuLink  className={navigationMenuTriggerStyle()}>
                                    <Newspaper className="w-4 h-4 mr-2" />
                                    Details
                                </NavigationMenuLink>
                                </Link>
                                <p className="text-sm text-gray-500">
                                    View & manage campaign details.
                                </p>
                                </span>
                                <span className="flex flex-row gap-2 justify-between">
                                <Link href={`/dashboard/${params.id}/members/`}>                                
                                    <NavigationMenuLink  className={navigationMenuTriggerStyle()}>
                                    <Users className="w-4 h-4 mr-2" />
                                    Members
                                </NavigationMenuLink>
                                </Link>
                                <p className="text-sm text-gray-500">
                                    Manage campaign members and invite users.
                                </p>
                                </span>
                            </div>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>Notes</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <div className="flex flex-col gap-2 w-[500px] h-[150px] p-4">
                                <span className="flex flex-row gap-2 justify-between">
                                <Link href={`/dashboard/${params.id}/notes/`}>
                                <NavigationMenuLink  className={navigationMenuTriggerStyle()}>
                                    <span className="flex flex-row items-center">
                                        <Notebook className="w-4 h-4 mr-2" />
                                        View Notes
                                    </span>
                                </NavigationMenuLink>
                                </Link>
                                <p className="text-sm text-gray-500">
                                    View all your notes, and public notes.
                                </p>
                                </span>
                                <span className="flex flex-row gap-2 justify-between">
                                <NavigationMenuLink  className={navigationMenuTriggerStyle()}>
                                    <AddNoteButton campaignId={params.id} type="ghost" asChild/>                           
                                </NavigationMenuLink>
                                <p className="text-sm text-gray-500">
                                    Create a new note to share with the team.
                                </p>
                                </span>
                            </div>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>Sessions</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <div className="flex flex-col gap-2 w-[500px] h-[150px] p-4">
                                <span className="flex flex-row gap-2 justify-between">
                                <Link href={`/dashboard/${params.id}/sessions/`}>
                                <NavigationMenuLink  className={navigationMenuTriggerStyle()}>
                                    <Beer className="w-4 h-4 mr-2" />
                                    View Sessions
                                </NavigationMenuLink>
                                </Link>
                                <p className="text-sm text-gray-500">
                                    View all your upcoming and previous sessions.
                                </p>
                                </span>
                                <span className="flex flex-row gap-2 justify-between">
                                <CreateSessionForm campaignId={params.id} buttonStyle="outline" />
                                <p className="text-sm text-gray-500">
                                    Quickly schedule a new session.
                                </p>
                                </span>
                            </div>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>

        </nav>
    )
}