import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { oauthApi } from "@/services/api/oauth"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { socialAccountKeys } from "@/hooks/api/useSocialAccounts"

const platformOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "pinterest", label: "Pinterest" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" }
]

interface AddAccountDialogProps {
  onAccountAdded?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddAccountDialog({ onAccountAdded, open, onOpenChange }: AddAccountDialogProps) {
  
  const [platform, setPlatform] = useState("")
  const [accountName, setAccountName] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleConnectAccount = async () => {
    if (!platform || !accountName) {
      toast({
        title: "Missing Information",
        description: "Please select a platform and enter an account name.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsConnecting(true)

      // Initialize OAuth flow
      const response = await oauthApi.initialize({
        platform: platform.toUpperCase(),
        account: accountName
      })

      const { redirectUri } = response

      // Open popup window for OAuth
      const popup = window.open(
        redirectUri, 
        "_blank", 
        "width=600,height=800,scrollbars=yes,resizable=yes"
      )

      if (!popup) {
        throw new Error("Unable to open popup. Please allow popups for this site.")
      }

      // Close modal immediately and show progress toast
      onOpenChange?.(false)
      setIsConnecting(false)
      setPlatform("")
      setAccountName("")
      toast({
        title: "Connecting Account...",
        description: `Connecting ${accountName} on ${platform}. Please complete the authorization in the popup window.`,
      })

      // Track if we received a message to prevent false cancellation
      let popupClosed = false
      let checkClosed: NodeJS.Timeout

      // Listen for messages from the popup
      const handlePopupMessage = async (event: MessageEvent) => {
        // Only handle messages from our OAuth popup
        if (!event.data || !event.data.status) return
        
        console.log('AddAccountDialog: Received message from popup:', event.data)
        const { status, message } = event.data
        
        // Mark that we received a message to prevent cancellation toast
        popupClosed = true

        if (status === "OK") {
          toast({
            title: "Account Connected!",
            description: "Your social media account has been connected successfully.",
          })
          
          // Small delay to ensure backend has processed the account
          setTimeout(async () => {
            // Invalidate all social account queries to force refresh
            await queryClient.invalidateQueries({ queryKey: socialAccountKeys.all })
            
            // Also force refetch to ensure immediate update
            await queryClient.refetchQueries({ queryKey: socialAccountKeys.all })
            
            // Notify parent component to refresh data
            onAccountAdded?.()
          }, 100)
        } else if (status === "ERROR") {
          toast({
            title: "Connection Failed",
            description: `Error: ${message}`,
            variant: "destructive",
          })
        } else if (status === "UNAUTHORIZED") {
          toast({
            title: "Authorization Failed",
            description: "The authorization was denied or cancelled.",
            variant: "destructive",
          })
        } else if (status === "INTERNAL_SERVER_ERROR") {
          toast({
            title: "Server Error",
            description: `Error: ${message}`,
            variant: "destructive",
          })
        }

        // Clean up event listener and interval
        window.removeEventListener("message", handlePopupMessage)
        if (checkClosed) {
          clearInterval(checkClosed)
        }
      }

      // Add message listener
      window.addEventListener("message", handlePopupMessage)

      // Handle popup close
      checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          window.removeEventListener("message", handlePopupMessage)
          
          // Only show cancellation if we haven't received a success/error message
          if (!popupClosed) {
            popupClosed = true
            toast({
              title: "Connection Cancelled",
              description: "The account connection was cancelled.",
              variant: "default",
            })
          }
        }
      }, 1000)

    } catch (error) {
      console.error('OAuth initialization error:', error)
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to initialize account connection.",
        variant: "destructive",
      })
      setIsConnecting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange?.(false)
    setPlatform("")
    setAccountName("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect New Account</DialogTitle>
          <DialogDescription>
            Add a new social media account to your dashboard
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {platformOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-name">Account Name</Label>
            <Input 
              id="account-name" 
              placeholder="Enter account name or handle" 
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>When you click "Connect Account", a popup window will open for you to authorize the connection to your social media account.</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isConnecting}
          >
            Cancel
          </Button>
          <Button 
            className="gradient-primary" 
            onClick={handleConnectAccount}
            disabled={isConnecting || !platform || !accountName}
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Account"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}