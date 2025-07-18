import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAccountSummary } from "@/hooks/useAccountSummary"
import { useAccounts } from "@/hooks/useAccounts"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AccountsSummary() {
  const { data: summary, isLoading, error, refetch } = useAccountSummary()
  const { data: accounts = [] } = useAccounts()
  
  const totalFollowers = accounts.reduce((sum, account) => {
    if (!account.followers) return sum
    const followers = parseFloat(account.followers.replace('K', '')) * 1000
    return sum + followers
  }, 0)

  if (isLoading) {
    return (
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
          <CardDescription>Overview of your connected accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading summary...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
          <CardDescription>Overview of your connected accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-destructive text-center">{error.message}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle>Account Summary</CardTitle>
        <CardDescription>Overview of your connected accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {summary?.active || 0}
            </div>
            <div className="text-sm text-muted-foreground">Active Accounts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {summary?.pending || 0}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {summary?.inactive || 0}
            </div>
            <div className="text-sm text-muted-foreground">Inactive</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {totalFollowers.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Followers</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}