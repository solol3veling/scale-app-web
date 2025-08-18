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
import { URLSearchParamsInit, URLSearchParamsSetter } from "react-router-dom"

interface AccountsListProps {
  searchTerm?: string;
  selectedPlatform?: string;
  action: string | null;
  accountId: string | null;
  setSearchParams: URLSearchParamsSetter;
}

export function AccountsList({ searchTerm, selectedPlatform, action, accountId, setSearchParams }: AccountsListProps) {
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
      Object.values(Platform).includes(selectedPlatform?.toUpperCase() as Platform);
    
    return {
      searchTerm: searchTerm || undefined,
      platform: isValidPlatform ? (selectedPlatform?.toUpperCase() as Platform) : undefined,
      pageable: {
        page: currentPage,
        size: 12, // Show 12 accounts per page
        sort: ['updatedAt,desc']
      }
    };
  }, [searchTerm, selectedPlatform, currentPage])

  const { data: paginatedData, isLoading, error, refetch } = useSocialAccountsPaginated(apiParams)
  
  const accounts = useMemo(() => paginatedData?.data || [], [paginatedData?.data])
  const totalAccounts = paginatedData?.total || 0
  const hasNext = paginatedData?.hasNext || false
  const hasPrev = paginatedData?.hasPrev || false
  const showPagination = totalAccounts > 0

  const handleEditAccount = (account: SocialAccount) => {
    setSearchParams({ action: 'edit', accountId: account.id });
  }

  const handleViewSettings = (account: SocialAccount) => {
    setSearchParams({ action: 'view', accountId: account.id });
  }

  const handleCloseModal = () => {
    setSearchParams(prev => {
      prev.delete("action");
      prev.delete("accountId");
      return prev;
    });
  }

  const handleSaveAccount = async () => {
    try {
      // After successful save, refetch accounts and close modal
      await refetch()
      handleCloseModal()
    } catch (error) {
      // Error handling is already done in the modal component
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

  useEffect(() => {
    if (action && accountId) {
      const account = accounts.find(acc => acc.id === accountId);
      if (account) {
        setSelectedAccount(account);
        setModalMode(action === 'edit' ? 'edit' : 'view');
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(false);
      setSelectedAccount(null);
    }
  }, [action, accountId, accounts]);

  useEffect(() => {
    if (currentPage !== 0) {
      setCurrentPage(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedPlatform]);

  const getStatusBadge = (status: string, isConnected: boolean) => {
    if (!isConnected) {
      return <Badge variant="destructive" className="gap-1 text-xs"><AlertCircle className="h-3 w-3" />Disconnected</Badge>
    }
    
    switch (status?.toLowerCase()) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" title="Connected" />
      case "inactive":
        return <Badge variant="secondary" className="gap-1 text-xs">Inactive</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 gap-1 text-xs"><AlertCircle className="h-3 w-3" />Pending</Badge>
      default:
        return <Badge variant="outline" className="gap-1 text-xs">Unknown</Badge>
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
        <p className="text-destructive">{error?.message}</p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    )
  }

  // Empty state when no accounts
  if (!isLoading && accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          className="text-gray-400 dark:text-gray-600 mb-6"
        >
          <path
            d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19 8L21 10L19 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 8L3 10L5 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No Social Accounts
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
          {searchTerm || selectedPlatform !== "all" 
            ? "No accounts match your current filters. Try adjusting your search or filters."
            : "Connect your social media accounts to start managing your posts across platforms."
          }
        </p>
        {!searchTerm && selectedPlatform === "all" && (
          <Button onClick={() => window.location.reload()} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Add Your First Account
          </Button>
        )}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {accounts.map((account) => (
        <Card key={account.id} className="shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] flex flex-col h-full border border-gray-200 dark:border-gray-700 p-4">
          <CardHeader className="pb-2 px-0 pt-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={account?.profileImage} />
                  <AvatarFallback className={`${getPlatformConfig(account?.platform).color} text-white`}>
                    {(() => {
                      const PlatformIcon = getPlatformConfig(account?.platform).icon
                      return <PlatformIcon className="w-5 h-5" />
                    })()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base leading-tight">{account?.displayName}</h3>
                  <p className="text-sm text-muted-foreground truncate">{account?.handle}</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                {getStatusBadge(account?.status, account?.isConnected)}
              </div>
            </div>
          </CardHeader>
          <div className="flex-1 px-0 pb-0 flex flex-col justify-between pt-3">
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                {(() => {
                  const platformConfig = getPlatformConfig(account?.platform)
                  const PlatformIcon = platformConfig.icon
                  return (
                    <>
                      <div className={`p-1 rounded-md ${platformConfig.bgColor}`}>
                        <PlatformIcon className={`w-3 h-3 ${platformConfig.textColor}`} />
                      </div>
                      <span className={`text-xs font-medium truncate ${platformConfig.textColor}`}>
                        {platformConfig.name}
                      </span>
                    </>
                  )
                })()}
              </div>
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 hover:scale-105 transition-transform"
                      onClick={() => handleViewSettings(account)}
                    >
                      <SettingsIcon className="h-3 w-3" />
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
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 hover:scale-105 transition-transform"
                      onClick={() => handleDeleteClick(account.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove account</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
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