import { useState } from "react"
import { AccountsFilter } from "@/components/AccountsFilter"
import { AccountsList } from "@/components/AccountsList"
import { AccountsSummary } from "@/components/AccountsSummary"
import { AddAccountDialog } from "@/components/AddAccountDialog"
import { useAccounts } from "@/hooks/useAccounts"
import { useQueryClient } from "@tanstack/react-query"
import { socialAccountKeys } from "@/hooks/api/useSocialAccounts"


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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">Manage your connected social media accounts</p>
        </div>
        <AddAccountDialog onAccountAdded={handleAccountAdded} />
      </div>

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

      {/* Stats Summary */}
      <AccountsSummary />
    </div>
  )
}