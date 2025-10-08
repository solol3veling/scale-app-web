import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  Save, 
  X, 
  Edit3, 
  Eye, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Tag as TagIcon
} from "lucide-react"
import { SocialAccount, UpdateSocialAccountRequest } from "@/types/api"
import { getPlatformConfig } from "@/utils/platform"
import { useToast } from "@/hooks/use-toast"
import { socialAccountsApi } from "@/services/api/social-accounts"

interface AccountModalProps {
  account: SocialAccount | null
  isOpen: boolean
  onClose: () => void
  mode: 'edit' | 'view'
  onSave?: () => Promise<void>
}

export function AccountModal({ account, isOpen, onClose, mode, onSave }: AccountModalProps) {
  const [isEditing, setIsEditing] = useState(mode === 'edit')
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<UpdateSocialAccountRequest>({})
  const { toast } = useToast()

  useEffect(() => {
    if (account) {
      setFormData({
        displayName: account.displayName,

        tags: account.tags
      })
    }
    setIsEditing(mode === 'edit')
  }, [account, mode])

  if (!account) return null

  const platformConfig = getPlatformConfig(account.platform)
  const PlatformIcon = platformConfig.icon

  const handleSave = async () => {
    if (!account) return
    
    try {
      setIsSaving(true)
      await socialAccountsApi.update(account.id, formData)
      toast({
        title: "Account Updated",
        description: "Account details have been saved successfully.",
      })
      setIsEditing(false)
      if (onSave) {
        await onSave() // This will trigger refetch and close modal in parent
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save account details.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      displayName: account.displayName,
      tags: account.tags
    })
    setIsEditing(false)
  }

  const getStatusDisplay = () => {
    if (!account.isConnected) {
      return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Disconnected</Badge>
    }
    
    switch (account.status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 gap-1"><CheckCircle className="h-3 w-3" />Connected</Badge>
      case "inactive":
        return <Badge variant="secondary" className="gap-1">Inactive</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 gap-1"><AlertCircle className="h-3 w-3" />Pending</Badge>
      default:
        return <Badge variant="outline" className="gap-1">Unknown</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={account.profileImage} />
              <AvatarFallback className="bg-muted">
                <PlatformIcon className="w-5 h-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg">{account.displayName}</DialogTitle>
              <DialogDescription className="text-sm truncate">
                {account.handle} • {platformConfig.name}
              </DialogDescription>
            </div>
            {account.isConnected && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
                Connected
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Display Name</Label>
              <div className="px-3 py-2 text-sm rounded-md bg-muted">
                {account.displayName}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Handle</Label>
              <div className="px-3 py-2 text-sm rounded-md bg-muted text-muted-foreground">
                {account.handle}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Tags</Label>
              <div className="px-3 py-2 rounded-md bg-muted min-h-[36px] flex items-center">
                {account.tags && account.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {account.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs h-5">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No tags</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Platform</Label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted">
                  <PlatformIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{platformConfig.name}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Last Post</Label>
                <div className="px-3 py-2 text-sm rounded-md bg-muted">
                  {account.lastPost || 'Never'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}