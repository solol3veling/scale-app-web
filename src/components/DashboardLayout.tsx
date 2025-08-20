import { SidebarProvider, useSidebar, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { ThemeToggle } from "./ThemeToggle"

interface DashboardLayoutProps {
  children: React.ReactNode
}

function DashboardContent({ children }: DashboardLayoutProps) {
  const { isMobile } = useSidebar()
  
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
            <div className="flex h-16 items-center justify-between px-6">
              {/* Mobile sidebar trigger - only show on mobile when sidebar is hidden */}
              {isMobile && (
                <SidebarTrigger className="hover:bg-accent/50 hover-scale" />
              )}
              
              {/* Push content to the right on desktop, center on mobile when trigger is present */}
              <div className={`flex items-center gap-3 ${isMobile ? '' : 'ml-auto'}`}>
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="animate-fade-in">
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
