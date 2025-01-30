"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import DarkModeToggle from "@/components/Dashboard/DarkModeToggle"
import { getMainNavigation, getToolsNavigation } from "@/config/navigation"


export function AppSidebar({ userData, campaign, isOwner, params }) {
  const mainNavigation = getMainNavigation(params)
  const toolsNavigation = getToolsNavigation(params)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <DarkModeToggle />
        <TeamSwitcher userData={userData} campaign={campaign} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={mainNavigation} params={params} />
        <NavProjects tools={toolsNavigation} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser userData={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
