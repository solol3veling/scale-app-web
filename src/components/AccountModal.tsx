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
    if (!account.connected) {
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
      <DialogContent className="sm:max-w-[800px] lg:max-w-[900px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={account.profileImage} />
                <AvatarFallback className={`${platformConfig.color} text-white`}>
                  <PlatformIcon className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">{account.displayName}</DialogTitle>
                <DialogDescription className="text-base">
                  {account.handle} • {platformConfig.name}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusDisplay()}
              {mode === 'view' && !isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Platform Info */}
          <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
            <div className={`p-2 rounded-md ${platformConfig.bgColor}`}>
              <PlatformIcon className={`w-6 h-6 ${platformConfig.textColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Platform</h3>
              <p className="text-sm text-muted-foreground">{platformConfig.name}</p>
            </div>
            
            <Button variant="ghost" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View Profile
            </Button>
          </div>

          <Separator />

          {/* Account Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Account Details</h3>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                {isEditing ? (
                  <Input
                    id="displayName"
                    value={formData.displayName || ''}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Display name"
                  />
                ) : (
                  <div className="px-3 py-2 border rounded-md bg-muted/50">
                    {account.displayName}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="handle">Handle/Username</Label>
                <div className="px-3 py-2 border rounded-md bg-muted/50">
                  {account.handle}
                </div>
                <p className="text-xs text-muted-foreground">Handle cannot be modified</p>
              </div>

              

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                {isEditing ? (
                  <Textarea
                    id="tags"
                    value={formData.tags?.join(', ') || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                    })}
                    placeholder="Enter tags separated by commas"
                    rows={2}
                  />
                ) : (
                  <div className="px-3 py-2 border rounded-md bg-muted/50">
                    {account.tags && account.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {account.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs gap-1">
                            <TagIcon className="h-2 w-2" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No tags</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Connection Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Connection Information</h3>
            <div className="grid gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span>{getStatusDisplay()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Post:</span>
                <span>{account.lastPost || 'Never'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account ID:</span>
                <span className="font-mono text-xs">{account.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              <Eye className="h-4 w-4 mr-2" />
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}