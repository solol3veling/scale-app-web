import { useState } from "react"
import {
    PenTool,
    BarChart3,
    TrendingUp,
    Users,
    Settings as SettingsIcon,
    LogOut,
    LayoutDashboard,
    ChevronRight,
    FileText,
    Plus,
    PanelLeft,
    Calendar
} from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/useAuth"
import { useProfile } from "@/hooks/useProfile"
import { useToast } from "@/hooks/use-toast"

const menuItems = [
    { title: "Overview", url: "/", icon: LayoutDashboard },
    { title: "Posts", url: "/posts", icon: FileText },
    { title: "Calendar", url: "/calendar", icon: Calendar },
    { title: "Analytics", url: "/analytics", icon: TrendingUp },
    { title: "Accounts", url: "/accounts", icon: Users },
    { title: "Settings", url: "/settings", icon: SettingsIcon },
]

export function AppSidebar() {
    const { state, isMobile } = useSidebar()
    const location = useLocation()
    const navigate = useNavigate()
    const currentPath = location.pathname
    const collapsed = state === "collapsed" && !isMobile
    const { signOut } = useAuth()
    const { profile, getDisplayName, getInitials } = useProfile()
    const { toast } = useToast()

    const handleLogout = async () => {
        const { error } = await signOut()
        if (error) {
            toast({
                title: "Error",
                description: "Failed to sign out. Please try again.",
                variant: "destructive",
            })
        } else {
            navigate('/auth')
            toast({
                title: "Signed out",
                description: "You've been successfully signed out.",
            })
        }
    }

    const isActive = (path: string) => {
        if (path === "/") return currentPath === "/"
        return currentPath.startsWith(path)
    }

    const getNavClass = (path: string) => {
        const active = isActive(path)
        return active
            ? "bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-sm"
            : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
    }

    return (
        <TooltipProvider>
            <Sidebar className="transition-all duration-300"
                collapsible="icon" style={{ width: collapsed ? "60px" : "200px" }}>
            <SidebarHeader className="p-4">
                <div className="flex items-center justify-between">
                    {!collapsed && (
                        <div className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer">
                            <img src="/favicon-s-white.png" alt="Logo" className="w-7 h-7 rounded-md" />
                        </div>
                    )}
                    {/* Only show trigger on desktop - mobile has it in the top bar */}
                    {!isMobile && (
                        <SidebarTrigger className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 rounded-lg p-2" />
                    )}
                </div>
            </SidebarHeader>

            {/* Create Post */}
            <div className={`${collapsed ? "px-2 pt-4 pb-2" : "px-4 pt-4 pb-2"}`}>
                {collapsed ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <NavLink
                                to="/make-post"
                                className="flex items-center justify-center w-full h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                            >
                                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                                    <Plus className="h-5 w-5 text-white" />
                                </div>
                            </NavLink>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>Create Post</p>
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    <NavLink
                        to="/make-post"
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                    >
                        <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                            <Plus className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">Create Post</span>
                    </NavLink>
                )}
            </div>

            <SidebarContent className="px-2">
                <SidebarGroup>
                    <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    {collapsed ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <SidebarMenuButton asChild>
                                                    <NavLink
                                                        to={item.url}
                                                        className={`${getNavClass(item.url)} flex items-center justify-center rounded-lg p-3 transition-all hover-lift`}
                                                    >
                                                        <item.icon className="h-7 w-7 flex-shrink-0" />
                                                    </NavLink>
                                                </SidebarMenuButton>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                <p>{item.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        <SidebarMenuButton asChild>
                                            <NavLink
                                                to={item.url}
                                                className={`${getNavClass(item.url)} flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover-lift`}
                                            >
                                                <item.icon className="h-5 w-5 flex-shrink-0" />
                                                <span className="flex-1">{item.title}</span>
                                                {isActive(item.url) && <ChevronRight className="h-4 w-4" />}
                                            </NavLink>
                                        </SidebarMenuButton>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <div className={`${collapsed ? "p-2" : "p-4"} border-t`}>
                <div className={`flex items-center ${collapsed ? "justify-center mb-3" : "gap-3 mb-4"}`}>
                    {collapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={profile?.avatar_url || undefined} />
                                    <AvatarFallback className="gradient-primary text-white">
                                        {getInitials()}
                                    </AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <div>
                                    <p className="font-medium">{getDisplayName()}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {profile?.company_name || "Free Plan"}
                                    </p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={profile?.avatar_url || undefined} />
                                <AvatarFallback className="gradient-primary text-white">
                                    {getInitials()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-sm font-medium">{getDisplayName()}</p>
                                <p className="text-xs text-muted-foreground">
                                    {profile?.company_name || "Free Plan"}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {collapsed ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="w-full justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>Logout</p>
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="ml-2">Logout</span>
                    </Button>
                )}
            </div>
        </Sidebar>
        </TooltipProvider>
    )
}
