import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Share2, Save, Loader2 } from "lucide-react"
import { useSocialAccounts } from "@/hooks/api/useSocialAccounts"
import { Platform } from "@/types/api"
import { useNavigate } from "react-router-dom"

const platformColors = {
  [Platform.INSTAGRAM]: "bg-gradient-to-r from-purple-500 to-pink-500",
  [Platform.FACEBOOK]: "bg-blue-600",
  [Platform.TWITTER]: "bg-sky-500",
  [Platform.LINKEDIN]: "bg-blue-700",
}

interface AccountSelectorProps {
  selectedAccountIds: string[]
  onAccountToggle: (accountId: string) => void
  onSelectionChange: (accountIds: string[]) => void
}

export function AccountSelector({ 
  selectedAccountIds, 
  onAccountToggle, 
  onSelectionChange 
}: AccountSelectorProps) {
  const { data: socialAccounts, isLoading: accountsLoading } = useSocialAccounts()
  const navigate = useNavigate()

  const selectedAccounts = socialAccounts?.filter(account => 
    selectedAccountIds.includes(account.id)
  ) || []

  const handleSelectAll = () => {
    const activeAccountIds = socialAccounts
      ?.filter(account => account.connected && account.status === 'ACTIVE')
      .map(account => account.id) || []
    onSelectionChange(activeAccountIds)
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  if (accountsLoading) {
    return (
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Select Accounts (Optional)
          </CardTitle>
          <CardDescription>Choose which social media accounts to post to, or save as draft to publish later</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading social accounts...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Select Accounts (Optional)
        </CardTitle>
        <CardDescription>Choose which social media accounts to post to, or save as draft to publish later</CardDescription>
      </CardHeader>
      <CardContent>
        {socialAccounts && socialAccounts.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                {selectedAccountIds.length} of {socialAccounts.filter(acc => acc.connected).length} accounts selected
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSelectAll}
                >
                  Select All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearAll}
                >
                  Clear All
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {socialAccounts.map((account) => (
                <div
                  key={account.id}
                  className={`relative border rounded-lg p-4 cursor-pointer transition-all hover-lift ${
                    selectedAccountIds.includes(account.id)
                      ? "ring-2 ring-primary bg-accent/20"
                      : "hover:bg-accent/50"
                  } ${!account.connected ? "opacity-50" : ""}`}
                  onClick={() => account.connected && onAccountToggle(account.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedAccountIds.includes(account.id)}
                      disabled={!account.connected}
                      onChange={() => onAccountToggle(account.id)}
                      className="pointer-events-none"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${platformColors[account.platform] || 'bg-gray-400'}`} />
                        <div>
                          <span className="font-medium">{account.platform}</span>
                          <p className="text-sm text-muted-foreground">{account.handle}</p>
                        </div>
                      </div>
                    </div>
                    {!account.connected && (
                      <Badge variant="secondary">Disconnected</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedAccounts.length > 0 ? (
                selectedAccounts.map((account) => (
                  <Badge key={account.id} variant="secondary" className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded ${platformColors[account.platform] || 'bg-gray-400'}`} />
                    {account.platform}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Save className="w-3 h-3" />
                  Will be saved as draft
                </Badge>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="space-y-3">
              <p className="text-muted-foreground">No social media accounts connected yet.</p>
              <p className="text-sm text-muted-foreground">You can still create and save your post as a draft.</p>
              <Button onClick={() => navigate('/accounts')} variant="outline" size="sm">
                Connect Accounts
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}