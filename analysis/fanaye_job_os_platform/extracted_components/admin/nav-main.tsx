"use client";

import { usePathname } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { adminNavGroups } from "@/config/sidebar.config";
import { can } from "@/core/permissions/can";
import { Role } from "@/core/permissions/roles";
import { useAppSelector } from "@/store/hooks";
import { useAbility } from "@/shared/providers/ability-provider";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/sidebar";

export function NavMain() {
  const pathname = usePathname();
  const role = useAppSelector((state) => state.auth.user?.role as Role | undefined);
  const ability = useAbility();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      {adminNavGroups.map((group) => {
        const visibleItems = group.items.filter((item) => {
          if (item.requiredRole && (!role || !can(role, item.requiredRole))) {
            return false;
          }
          if (item.requiredSubject && !ability.can("read", item.requiredSubject)) {
            return false;
          }
          return true;
        });

        if (visibleItems.length === 0) return null;

        return (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest text-muted-foreground/70 px-2 mb-1">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={`${group.label}-${item.label}`}>
                    <SidebarMenuButton
                      tooltip={item.label}
                      isActive={isActive}
                      render={<Link href={item.href} onClick={handleLinkClick} />}
                      className={
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground/70 hover:text-foreground"
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        );
      })}
    </>
  );
}
