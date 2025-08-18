import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom"
import { AccountsFilter } from "@/components/AccountsFilter"
import { AccountsList } from "@/components/AccountsList"
import { AddAccountDialog } from "@/components/AddAccountDialog"
import { useAccounts } from "@/hooks/useAccounts"
import { useQueryClient } from "@tanstack/react-query"
import { socialAccountKeys } from "@/hooks/api/useSocialAccounts"
import { PageHeader } from "@/components/PageHeader"


export default function AccountManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const action = searchParams.get("action");
  const accountId = searchParams.get("accountId");
  const platform = searchParams.get("platform");

  const { refetch, isFetching } = useAccounts()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({
    searchTerm: "",
    selectedPlatform: "all",
  });

  const handleAccountAdded = async () => {
    // Force immediate refresh of all account data
    await queryClient.invalidateQueries({ queryKey: socialAccountKeys.all })
    await queryClient.refetchQueries({ queryKey: socialAccountKeys.all })
    await refetch()
    closeDialog();
  }

  const closeDialog = () => {
    setSearchParams(prev => {
      prev.delete("action");
      prev.delete("accountId");
      return prev;
    });
  };

  return (
    <div className="space-y-0">
      {/* Header */}
      <PageHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
              <p className="text-muted-foreground text-sm">Manage your connected social media accounts</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={isFetching}
                className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Refresh accounts"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
              <Button className="gradient-primary hover-scale" onClick={() => setSearchParams({ action: 'add' })}>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </div>
            <AddAccountDialog onAccountAdded={handleAccountAdded} open={action === 'add'} onOpenChange={(open) => !open && closeDialog()} platform={platform} />
          </div>
          {/* Filters */}
          <AccountsFilter 
            filters={filters}
            setFilters={setFilters}
          />
        </div>
      </PageHeader>

      {/* Main content area */}
      <div className="space-y-6 p-6">

        {/* Accounts Grid */}
        <AccountsList 
          searchTerm={filters.searchTerm}
          selectedPlatform={filters.selectedPlatform}
          action={action}
          accountId={accountId}
          setSearchParams={setSearchParams}
        />
      </div>
    </div>
  )
}