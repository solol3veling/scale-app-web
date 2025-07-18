import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Trash2, 
  Edit3, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Tag,
  Settings as SettingsIcon,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useSocialAccountsPaginated } from "@/hooks/useAccounts"
import { getPlatformConfig } from "@/utils/platform"
import { AccountModal } from "@/components/AccountModal"
import { SocialAccount, SocialAccountStatus, Platform } from "@/types/api"
import { useToast } from "@/hooks/use-toast"
import { socialAccountsApi } from "@/services/api/social-accounts"

interface AccountsListProps {
  searchTerm: string
  selectedPlatform: string
}

export function AccountsList({ searchTerm, selectedPlatform }: AccountsListProps) {
  const { toast } = useToast()
  const [selectedAccount, setSelectedAccount] = useState<SocialAccount | null>(null)
  const [modalMode, setModalMode] = useState<'edit' | 'view'>('view')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  // Prepare API parameters
  const apiParams = useMemo(() => {
    // Check if selectedPlatform is a valid Platform enum value
    const isValidPlatform = selectedPlatform !== "all" && 
      Object.values(Platform).includes(selectedPlatform.toUpperCase() as Platform);
    
    return {
      searchTerm: searchTerm || undefined,
      platform: isValidPlatform ? (selectedPlatform.toUpperCase() as Platform) : undefined,
      pageable: {
        page: currentPage,
        size: 12, // Show 12 accounts per page
        sort: ['updatedAt,desc']
      }
    };
  }, [searchTerm, selectedPlatform, currentPage])

  const { data: paginatedData, isLoading, error, refetch } = useSocialAccountsPaginated(apiParams)
  
  const accounts = paginatedData?.data || []
  const totalAccounts = paginatedData?.total || 0
  const hasNext = paginatedData?.hasNext || false
  const hasPrev = paginatedData?.hasPrev || false
  const showPagination = totalAccounts > 10

  const handleEditAccount = (account: SocialAccount) => {
    setSelectedAccount(account)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleViewSettings = (account: SocialAccount) => {
    setSelectedAccount(account)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAccount(null)
  }

  const handleSaveAccount = async () => {
    try {
      // After successful save, refetch accounts and close modal
      await refetch()
      handleCloseModal()
    } catch (error) {
      // Error handling is already done in the modal component
      console.error('Error in handleSaveAccount:', error)
    }
  }

  const handleDeleteClick = (accountId: string) => {
    setDeleteAccountId(accountId)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteAccountId) return
    
    try {
      setIsDeleting(true)
      await socialAccountsApi.delete(deleteAccountId)
      
      toast({
        title: "Account Deleted",
        description: "The account has been removed successfully.",
      })
      
      // After successful delete, refetch accounts
      await refetch()
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete account.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteAccountId(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteAccountId(null)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  // Reset to first page when search/filter changes
  useEffect(() => {
    if (currentPage !== 0) {
      setCurrentPage(0)
    }
  }, [searchTerm, selectedPlatform])

  const getStatusBadge = (status: string, connected: boolean) => {
    if (!connected) {
      return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Disconnected</Badge>
    }
    
    switch (status.toLowerCase()) {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading accounts...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error.message}</p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
        <Card key={account.id} className="shadow-medium hover-lift flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                  <AvatarImage src={account.profileImage} />
                  <AvatarFallback className={`${getPlatformConfig(account.platform).color} text-white`}>
                    {(() => {
                      const PlatformIcon = getPlatformConfig(account.platform).icon
                      return <PlatformIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    })()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base truncate">{account.displayName}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{account.handle}</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                {getStatusBadge(account.status, account.connected)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Platform</p>
                <div className="flex items-center gap-2">
                  {(() => {
                    const platformConfig = getPlatformConfig(account.platform)
                    const PlatformIcon = platformConfig.icon
                    return (
                      <>
                        <div className={`p-1 rounded-md ${platformConfig.bgColor}`}>
                          <PlatformIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${platformConfig.textColor}`} />
                        </div>
                        <span className={`text-sm font-medium truncate ${platformConfig.textColor}`}>
                          {platformConfig.name}
                        </span>
                      </>
                    )
                  })()}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Followers</p>
                <p className="text-sm font-semibold">{account.followers || '0'}</p>
              </div>
            </div>

            {account.tags && account.tags.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {account.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                      <span className="truncate max-w-[60px]">{tag}</span>
                    </Badge>
                  ))}
                  {account.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{account.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-2 border-t mt-auto">
              <span className="text-xs text-muted-foreground truncate">
                Last post: {account.lastPost || 'Never'}
              </span>
              <div className="flex gap-1 justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 sm:h-8 sm:w-8 hover-scale"
                      onClick={() => handleEditAccount(account)}
                    >
                      <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit account details</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 hover-scale">
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View profile on {getPlatformConfig(account.platform).name}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 sm:h-8 sm:w-8 hover-scale"
                      onClick={() => handleViewSettings(account)}
                    >
                      <SettingsIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Account settings</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteClick(account.id)}
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove account</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>
          ))}
        </div>

        {/* Pagination Controls - Only show if more than 10 accounts */}
        {showPagination && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {accounts.length} of {totalAccounts} accounts
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrev}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage + 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNext}
                className="gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <AccountModal
        account={selectedAccount}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        onSave={handleSaveAccount}
      />

      <AlertDialog open={!!deleteAccountId} onOpenChange={handleDeleteCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this account? This action cannot be undone and will permanently delete the account from your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}