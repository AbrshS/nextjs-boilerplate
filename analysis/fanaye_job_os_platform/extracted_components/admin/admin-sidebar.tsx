"use client";

import * as React from "react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/shared/ui/sidebar";
import { TefTefLogo, TefTefIcon } from "@/shared/components/teftef-logo";

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-border/50">
      {/* Brand Header */}
      <SidebarHeader className="pb-3">
        <div className="flex items-center px-3 py-2">
          {/* Expanded view */}
          <div className="group-data-[collapsible=icon]:hidden">
            <TefTefLogo className="h-8 w-auto text-foreground shrink-0" />
          </div>
          {/* Collapsed view */}
          <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-full">
            <TefTefIcon className="h-7 w-auto shrink-0" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="mx-3 mb-1" />

      <SidebarContent className="px-1.5 py-0">
        <NavMain />
      </SidebarContent>

      <SidebarSeparator className="mx-3 mt-1" />

      <SidebarFooter className="pt-2">
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
