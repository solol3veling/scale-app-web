import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Share2, Save, Loader2, CheckCircle } from "lucide-react"
import { useSocialAccounts } from "@/hooks/api/useSocialAccounts"
import { Platform } from "@/types/api"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"



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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {socialAccounts.map((account) => {
                const isSelected = selectedAccountIds.includes(account.id)
                const isDisabled = !account.connected || account.status !== 'ACTIVE'

                return (
                  <div
                    key={account.id}
                    className={`relative flex flex-col items-center p-2 rounded-lg transition-all duration-200
                      ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-accent/50"}
                    `}
                  >
                    <div className="relative">
                      <Avatar
                          className={`h-16 w-16 border-4 cursor-pointer transition-all duration-200
                            ${isSelected ? "border-primary" : "border-transparent hover:border-muted"}
                          `}
                          onClick={() => !isDisabled && onAccountToggle(account.id)}
                        >
                        <AvatarImage src={account.profileImage} alt={`${account.handle}'s avatar`} />
                        <AvatarFallback>{account.handle ? account.handle[0].toUpperCase() : '?'}</AvatarFallback>
                      </Avatar>
                      {isSelected && (
                        <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1">
                          <CheckCircle className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm mt-2 text-center font-medium truncate w-full px-1">{account.handle}</p>
                    {isDisabled && (
                      <Badge variant="secondary" className="mt-1">Disconnected</Badge>
                    )}
                  </div>
                )
              })}
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