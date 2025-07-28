"use client"

import { 
  Settings2,
  Trash2,
  User,
} from "lucide-react"
import React from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const iconMap = {
  User,
  Settings2,
  Trash2,
}

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: keyof typeof iconMap
    badge?: React.ReactNode
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const IconComponent = iconMap[item.icon]
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <IconComponent />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
                {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
