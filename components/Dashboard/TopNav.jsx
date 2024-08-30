import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "@/components/ui/navigation-menu"
import CampaignTile from "@/components/Dashboard/CampaignTile"
import Logout from "@/components/ui/Logout"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TopNav({ campaigns }) {
    return (
        <div className="w-full py-2 px-2 flex flex-row justify-between">
            <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
            </Link>
            <NavigationMenu className="w-full">
                <NavigationMenuList className="">
                    <NavigationMenuItem className="">
                        <NavigationMenuTrigger>My Campaigns</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <div className="w-[400px] p-2 flex flex-col gap-2">
                                {campaigns.map((campaign) => (
                                    <NavigationMenuLink key={campaign.id} asChild>
                                        <Link href={`/dashboard/${campaign.id}`} passHref legacyBehavior>
                                            <a>
                                                <CampaignTile
                                                    name={campaign.name}
                                                    description={campaign.description}
                                                    role={campaign.role}
                                                    id={campaign.id}
                                                />
                                            </a>
                                        </Link>
                                    </NavigationMenuLink>
                                ))}
                            </div>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
                <div className="flex justify-end w-full">
                    <Logout />
                </div>
            </NavigationMenu>
        </div>
    )
}