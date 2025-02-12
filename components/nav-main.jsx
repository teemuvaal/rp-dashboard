"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ChevronRight, Home, Users } from "lucide-react"
import AddNoteButton from "@/components/Dashboard/AddNoteButton"
import NavNotes from "@/components/nav-notes"
import NavAssets from "@/components/nav-assets"
import { usePathname } from "next/navigation"
import Link from "next/link"
import AiChatOpen from "@/components/Dashboard/AiChatOpen"
import ShinyText from "@/components/ui/shiny-text"

const DynamicComponent = ({ type, component, props }) => {
  switch (component) {
    case "AddNoteButton":
      return <AddNoteButton {...props} />
    case "NavNotes":
      return <NavNotes {...props} />
    case "NavAssets":
      return <NavAssets {...props} />
    case "AiChatOpen":
      return <AiChatOpen {...props} />
    default:
      return null
  }
}

export function NavMain({ items, params }) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Campaign</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={`/dashboard/${params.id}`}>
              <Home className="h-4 w-4" />
              <span>Feed</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <Separator className="my-2" />
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={`/dashboard/${params.id}/characters`}>
              <Users className="h-4 w-4" />
              <span>Characters</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <Separator className="my-2" />
        {items.filter(item => item.title !== "Feed").map((item) => (
          <Collapsible
            key={item.title}
            defaultOpen={item.isActive || pathname.startsWith(item.url)}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => {
                    if (subItem.type === "component") {
                      return (
                        <div key={subItem.title}>
                          <DynamicComponent
                            type={subItem.type}
                            component={subItem.component}
                            props={subItem.props}
                          />
                        </div>
                      )
                    }

                    const isActive = pathname === subItem.url
                    return (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link href={subItem.url}>
                            {subItem.icon && <subItem.icon className="h-4 w-4 mr-2" />}
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
        <Separator />
        <AiChatOpen params={params} />
      </SidebarMenu>
    </SidebarGroup>
  )
}
