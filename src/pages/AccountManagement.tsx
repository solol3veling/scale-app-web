import { useState } from "react"
import { AccountsFilter } from "@/components/AccountsFilter"
import { AccountsList } from "@/components/AccountsList"
import { AddAccountDialog } from "@/components/AddAccountDialog"
import { useAccounts } from "@/hooks/useAccounts"
import { useQueryClient } from "@tanstack/react-query"
import { socialAccountKeys } from "@/hooks/api/useSocialAccounts"
import { PageHeader } from "@/components/PageHeader"


export default function AccountManagement() {
  const { refetch } = useAccounts()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState("all")

  const handleAccountAdded = async () => {
    // Force immediate refresh of all account data
    await queryClient.invalidateQueries({ queryKey: socialAccountKeys.all })
    await queryClient.refetchQueries({ queryKey: socialAccountKeys.all })
    await refetch()
  }

  return (
    <div className="space-y-0">
      {/* Header */}
      <PageHeader>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
            <p className="text-muted-foreground text-sm">Manage your connected social media accounts</p>
          </div>
          <AddAccountDialog onAccountAdded={handleAccountAdded} />
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
        />
      </div>
    </div>
  )
}