"use client";

import * as React from "react";
import { useAuth } from "@/domains/auth";
import { api } from "@/core/api/api";
import { useAppDispatch } from "@/store/hooks";
import { logout, updateCurrentUser } from "@/domains/auth/store/auth.slice";
import { useAdminLogoutMutation, useUpdateAdminProfileMutation } from "@/domains/admin/api/admin.api";
import { useRouter } from "@/i18n/routing";
import { formatRoleLabel } from "@/shared/utils/format-role";
import {
  Avatar,
  AvatarFallback,
} from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { ChevronsUpDown, LogOut, Settings, User, Eye, EyeOff } from "lucide-react";

export function NavUser() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isMobile } = useSidebar();
  const [adminLogout] = useAdminLogoutMutation();
  const [updateAdminProfile] = useUpdateAdminProfileMutation();

  const [showLogoutAlert, setShowLogoutAlert] = React.useState(false);
  const [showProfileDialog, setShowProfileDialog] = React.useState(false);

  // Profile Form States
  const [fullName, setFullName] = React.useState(user?.fullName || "");
  const [email, setEmail] = React.useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
    }
    setShowNewPassword(false);
    setShowCurrentPassword(false);
  }, [user, showProfileDialog]);

  const handleLogout = async () => {
    try {
      await adminLogout().unwrap();
    } catch {
      // Local logout should still clear auth state if the token is expired or the backend is unavailable.
    }
    dispatch(api.util.resetApiState());
    dispatch(logout());
    router.push("/admin/login");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const payload: any = { fullName, email };
      if (newPassword) {
        if (!currentPassword) {
          setErrorMsg("Current password is required to change password.");
          setIsSubmitting(false);
          return;
        }
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      const response = await updateAdminProfile(payload).unwrap();
      const updatedUser = response.data ?? response;
      dispatch(updateCurrentUser(updatedUser));
      setSuccessMsg("Profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setShowNewPassword(false);
      setShowCurrentPassword(false);
      setTimeout(() => {
        setShowProfileDialog(false);
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.data?.message || err?.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "AD";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground" />
            }
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold">{user.fullName}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.fullName}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email} · {formatRoleLabel(user.role)}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Admin profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowLogoutAlert(true)} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      {/* Logout Alert Dialog */}
      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of your account?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to enter your email and password to log back in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white rounded-xl"
              onClick={handleLogout}
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Admin Profile Update Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="rounded-2xl max-w-md p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-white">Admin Profile</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update your account details and password below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateProfile} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Full Name</label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Super Admin"
                required
                className="w-full text-sm rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full text-sm rounded-lg"
              />
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800 my-4 pt-3 space-y-3">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Change Password (Optional)</h4>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">New Password</label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className="w-full text-sm rounded-lg pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none p-1 border-none bg-transparent cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {newPassword && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Current Password</label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password to confirm"
                      required
                      className="w-full text-sm rounded-lg pr-9 border-orange-200 dark:border-orange-950 focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none p-1 border-none bg-transparent cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {errorMsg && (
              <p className="text-xs font-medium text-destructive bg-destructive/10 p-2.5 rounded-lg">
                {errorMsg}
              </p>
            )}

            {successMsg && (
              <p className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-lg">
                {successMsg}
              </p>
            )}

            <DialogFooter className="mt-6 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProfileDialog(false)}
                className="rounded-lg text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5"
              >
                {isSubmitting ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarMenu>
  );
}
