"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { CaretSortIcon, PlusIcon } from "@radix-ui/react-icons"
import { fetchUserCampaigns } from "@/app/dashboard/actions"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function TeamSwitcher({
  userData,
  campaign
}) {
  const [campaigns, setCampaigns] = React.useState([])
  const { isMobile } = useSidebar()
  const router = useRouter()

  React.useEffect(() => {
    const loadCampaigns = async () => {
      const { campaigns: userCampaigns } = await fetchUserCampaigns()
      if (userCampaigns) {
        setCampaigns(userCampaigns)
      }
    }
    loadCampaigns()
  }, [])

  return (
    (<SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div
                className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {campaign.name}
                </span>
              </div>
              <CaretSortIcon className="ml-auto" />
            </SidebarMenuButton>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Campaigns
            </DropdownMenuLabel>
            {campaigns.map((campaign) => (
              <DropdownMenuItem 
                key={campaign.id} 
                className="gap-2 p-2 cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault()
                  router.push(`/dashboard/${campaign.id}`)
                }}
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                </div>
                {campaign.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <Link href="/dashboard">
              <DropdownMenuItem className="gap-2 p-2">
                <div
                  className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <PlusIcon className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">Add campaign</div>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>)
  );
}
