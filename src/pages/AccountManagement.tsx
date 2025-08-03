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

  const { refetch } = useAccounts()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState("all")

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
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button className="gradient-primary hover-scale" onClick={() => setSearchParams({ action: 'add' })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
          <AddAccountDialog onAccountAdded={handleAccountAdded} open={action === 'add'} onOpenChange={(open) => !open && closeDialog()} platform={platform} />
        </div>
      </PageHeader>

      {/* Main content area */}
      <div className="space-y-6 p-6">
        {/* Filters */}
        <AccountsFilter 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
        />

        {/* Accounts Grid */}
        <AccountsList 
          searchTerm={searchTerm}
          selectedPlatform={selectedPlatform}
          action={action}
          accountId={accountId}
          setSearchParams={setSearchParams}
        />
      </div>
    </div>
  )
}