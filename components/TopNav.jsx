import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "@/components/ui/navigation-menu"
import CampaignTile from "@/components/CampaignTile"
import Logout from "@/components/ui/Logout"

export default function TopNav() {
    return (
        <div className="w-full py-2 px-2">
            <NavigationMenu className="w-full">
                <NavigationMenuList className="">
                    <NavigationMenuItem className="">
                        <NavigationMenuTrigger>My Campaigns</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <div className="w-[400px] p-2 flex flex-col gap-2">
                            <NavigationMenuLink>
                                <CampaignTile />
                            </NavigationMenuLink>
                            <NavigationMenuLink>
                                <CampaignTile />
                            </NavigationMenuLink>
                            </div>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>My Profile</NavigationMenuTrigger>
                    </NavigationMenuItem>
                </NavigationMenuList>
                <div className="flex justify-end">
                    <Logout />
                </div>
            </NavigationMenu>
        </div>

    )
}