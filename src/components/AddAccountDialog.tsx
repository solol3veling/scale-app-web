import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getPlatformConfig } from "@/utils/platform"
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
    defaultPlatform?: string | null;
}

export function AddAccountDialog({ onAccountAdded, open, onOpenChange, defaultPlatform }: AddAccountDialogProps) {

    const [platform, setPlatform] = useState("")
    const [accountName, setAccountName] = useState("")
    const [isConnecting, setIsConnecting] = useState(false)
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const navigate = useNavigate()


    useEffect(() => {
        if (defaultPlatform && platformOptions.some(option => option.value === defaultPlatform)) {
            setPlatform(defaultPlatform);
        } else if (defaultPlatform) {
            setPlatform("");
        }
    }, [defaultPlatform]);

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

            let redirectUri: string;

            // Check if platform uses OAuth2 (Facebook, Instagram, LinkedIn) or OAuth1 (Twitter)
            if (platform.toLowerCase() === 'twitter') {
                // Use OAuth1 flow for Twitter
                const response = await oauthApi.initialize({
                    platform: platform.toUpperCase(),
                    account: accountName
                })
                redirectUri = response.redirectUri
            } else {
                // Use OAuth2 flow for all other platforms (Facebook, Instagram, LinkedIn, etc.)
                const response = await oauthApi.initializeOAuth2(
                    platform.toUpperCase(),
                    accountName,
                    window.location.origin + '/oauth-callback'
                )
                redirectUri = response.authorizationUrl || response.redirectUri
            }

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
            // onOpenChange?.(false) // Removed to delay closure
            setIsConnecting(false)
            setPlatform("")
            setAccountName("")
            toast({
                title: "Connecting Account...",
                description: `Connecting ${accountName} on ${platform}. Please complete the authorization in the popup window.`,
            })

            // Track if we received a message to prevent false cancellation
            let popupClosed = false
            let checkClosed: NodeJS.Timeout | null = null // Initialize as null

            // Listen for messages from the popup
            const handlePopupMessage = async (event: MessageEvent) => {
                // Only handle messages from our OAuth popup and ensure it has a status
                if (!event.data || !event.data.status) return

                console.log('AddAccountDialog: Received message from popup:', event.data)

                // Immediately mark that a message was received
                popupClosed = true

                // Clear the interval as soon as a message is received
                if (checkClosed) {
                    clearInterval(checkClosed)
                    checkClosed = null // Clear reference
                }

                const { status, message } = event.data

                if (status === "OK") {
                    const { platformId, platform, username, name } = event.data
                    toast({
                        title: "Account Connected!",
                        description: `Successfully connected ${name || username} on ${platform}.`,
                    })
                    onOpenChange?.(false) // Close modal on success
                    navigate(`/accounts?action=view&accountId=${platformId}`)
                } else if (status === "ERROR") {
                    toast({
                        title: "Connection Failed",
                        description: `Error: ${message}`,
                        variant: "destructive",
                    })
                    onOpenChange?.(false) // Close modal on error
                } else if (status === "UNAUTHORIZED") {
                    toast({
                        title: "Authorization Failed",
                        description: "The authorization was denied or cancelled.",
                        variant: "destructive",
                    })
                    onOpenChange?.(false) // Close modal on unauthorized
                } else if (status === "INTERNAL_SERVER_ERROR") {
                    toast({
                        title: "Server Error",
                        description: `Error: ${message}`,
                        variant: "destructive",
                    })
                    onOpenChange?.(false) // Close modal on server error
                }

                // Clean up event listener
                window.removeEventListener("message", handlePopupMessage)
            }

            console.log('AddAccountDialog: Setting up message listener and interval.');
            // Add message listener
            window.addEventListener("message", handlePopupMessage)

            // Introduce a small delay before starting the interval to allow postMessage to be processed
            setTimeout(() => {
                // Handle popup close
                checkClosed = setInterval(() => {
                    console.log('AddAccountDialog: Checking popup status. popup.closed:', popup.closed, 'popupClosed flag:', popupClosed);
                    if (popup.closed) {
                        clearInterval(checkClosed)
                        checkClosed = null // Clear reference
                        window.removeEventListener("message", handlePopupMessage)

                        // Only show cancellation if no message was received
                        if (!popupClosed) {
                            window.location.href = '/accounts';
                        }
                    }
                }, 200) // Reduced interval to 200ms
            }, 100); // Small delay (e.g., 100ms)

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
                                    <SelectItem key={option.value} value={option.value} className="flex items-center gap-2">
                                        {(() => {
                                            const config = getPlatformConfig(option.value);
                                            const Icon = config.icon;
                                            return (
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4" />
                                                    {option.label}
                                                </div>
                                            );
                                        })()}
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
        </Dialog >
    )
}
