import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useProfile } from "@/hooks/useProfile"

interface DashboardLayoutProps {
  children: React.ReactNode
}

function DashboardContent({ children }: DashboardLayoutProps) {
  const { profile, getDisplayName, getInitials } = useProfile()
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  
  return (
    <div 
      className="min-h-screen flex w-full bg-background"
      style={{
        "--sidebar-width": "200px",
        "--sidebar-width-icon": "60px"
      } as React.CSSProperties}
    >
      <AppSidebar />
      
      <div className="flex-1 flex flex-col" >
          {/* Header */}
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="hover:bg-accent/50 hover-scale" />
              
              <div className="flex-1 flex items-center gap-4 max-w-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search posts, accounts, analytics..." 
                    className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative hover-scale">
                  <Bell className="h-5 w-5" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                  >
                    3
                  </Badge>
                </Button>
                
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-6 animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
  )
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  )
}
