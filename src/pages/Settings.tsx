import { useSearchParams } from "react-router-dom";
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  CreditCard, 
  Download,
  Crown,
  Zap,
  Shield,
  Calendar,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { PageHeader } from "@/components/PageHeader"
import { useAuth } from "@/hooks/useAuth"
import { useCurrentUserPlan, useUserBilling, useBillingPlans, useUpgradePlan, useCancelSubscription, useResubscribe, useUpdatePaymentMethod, useSubscriptionManagement } from "@/hooks/useUserBilling"
import { useToast } from "@/hooks/use-toast"
import { PlanType, SubscriptionStatus, PlanStatus, Plan } from "@/types/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Helper functions for plan data
const getPlanFeatures = (plan: Plan): string[] => {
  return plan.features.split(';').map(f => f.trim()).filter(f => f.length > 0);
}

const getPlanIcon = (planType: PlanType) => {
  switch (planType) {
    case PlanType.FREE:
      return Zap;
    case PlanType.PRO:
      return Crown;
    case PlanType.ENTERPRISE:
      return Shield;
    default:
      return Zap;
  }
}

const formatPrice = (price: number, currency: string) => {
  if (price === 0) {
    return 'Free';
  }
  
  // Format currency symbol
  const currencySymbol = currency === 'USD' ? '$' : currency;
  
  // Format price (remove .00 if it's a whole number)
  const formattedPrice = price % 1 === 0 ? price.toString() : price.toFixed(2);
  
  return `${currencySymbol}${formattedPrice}`;
}

const getStatusBadge = (status: PlanStatus | SubscriptionStatus) => {
  switch (status) {
    case PlanStatus.ACTIVE:
    case SubscriptionStatus.ACTIVE:
      return <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 gap-1"><CheckCircle2 className="h-3 w-3" />Active</Badge>
    case PlanStatus.PENDING:
    case SubscriptionStatus.PENDING:
      return <Badge className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 gap-1"><Loader2 className="h-3 w-3 animate-spin" />Pending</Badge>
    case PlanStatus.PAYMENT_PENDING:
      return <Badge className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 gap-1"><Loader2 className="h-3 w-3 animate-spin" />Payment Pending</Badge>
    case PlanStatus.PAYMENT_FAILED:
      return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Payment Failed</Badge>
    case PlanStatus.PENDING_CANCELLATION:
      return <Badge className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 gap-1"><AlertCircle className="h-3 w-3" />Pending Cancellation</Badge>
    case PlanStatus.CANCELLED:
    case SubscriptionStatus.CANCELLED:
      return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Cancelled</Badge>
    case PlanStatus.INACTIVE:
    case SubscriptionStatus.INACTIVE:
      return <Badge variant="secondary" className="gap-1"><AlertCircle className="h-3 w-3" />Inactive</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export default function Settings() {
  const { user, session, signOut } = useAuth()
  const { data: billing, isLoading: billingLoading, error: billingError } = useCurrentUserPlan()
  const { data: plansData, isLoading: plansLoading, error: plansError } = useBillingPlans()
  const upgradePlan = useUpgradePlan()
  const cancelSubscription = useCancelSubscription()
  const resubscribe = useResubscribe()
  const updatePaymentMethod = useUpdatePaymentMethod()
  const subscriptionManagement = useSubscriptionManagement()
  const { toast } = useToast()
  
  const plans = plansData?.data || []
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";
  const [showCancelModal, setShowCancelModal] = useState(false)


  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };
  


  const handleUpgrade = async () => {
    if (upgradePlan.isPending) return;
    
    try {
      await upgradePlan.mutateAsync()
    } catch (error) {
      // Error is already handled by the mutation's onError
      console.error('Upgrade failed:', error)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription.mutateAsync()
      setShowCancelModal(false)
    } catch (error) {
      // Error is already handled by the mutation's onError
      console.error('Cancel subscription failed:', error)
    }
  }

  const handleUpdatePaymentMethod = async () => {
    try {
      await updatePaymentMethod.mutateAsync()
    } catch (error) {
      console.error('Update payment method failed:', error)
    }
  }

  const handleSubscriptionManagement = async () => {
    try {
      await subscriptionManagement.mutateAsync()
    } catch (error) {
      console.error('Subscription management failed:', error)
    }
  }

  const handleResubscribe = async () => {
    if (confirm('Are you sure you want to resubscribe to the service?')) {
      try {
        await resubscribe.mutateAsync()
      } catch (error) {
        // Error is already handled by the mutation's onError
        console.error('Resubscribe failed:', error)
      }
    }
  }

  const getCurrentPlan = () => billing?.planType || PlanType.FREE
  const getCurrentStatus = () => billing?.status || SubscriptionStatus.ACTIVE
  
  const getCurrentPlanData = () => plans.find(p => p.type === getCurrentPlan())
  const getPlanByType = (type: PlanType) => plans.find(p => p.type === type)

  return (
    <div className="space-y-0">
      {/* Header */}
      <PageHeader>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground text-sm">Manage your account and subscription preferences</p>
          </div>
        </div>
      </PageHeader>

      {/* Main content area */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Profile Information
              </CardTitle>
              <CardDescription>Your account information from Supabase authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 ring-4 ring-blue-100 dark:ring-blue-900">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">{user?.user_metadata?.full_name || 'User'}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <Badge variant="outline" className="gap-1">
                    <Mail className="h-3 w-3" />
                    {user?.email_confirmed_at ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</Label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{user?.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Managed by Supabase authentication
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Created</Label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Member since
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">User ID</Label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-mono text-sm text-gray-900 dark:text-gray-100">{user?.id}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Unique identifier
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Sign In</Label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Latest activity
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => signOut()} className="hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 dark:hover:border-red-800">
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          {billingLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading billing information...</span>
              </CardContent>
            </Card>
          ) : billingError ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <span className="ml-2">Failed to load billing information</span>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Current Plan Overview */}
              <Card className="border border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-slate-100">
                    <CreditCard className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                        {(() => {
                          const IconComponent = getPlanIcon(getCurrentPlan());
                          return <IconComponent className="h-5 w-5 text-slate-600 dark:text-slate-400" />;
                        })()}
                      </div>
                      <div>
                        <div className="font-semibold text-lg text-slate-900 dark:text-slate-100">{getCurrentPlan()}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {getCurrentPlanData() ? (
                            `${formatPrice(getCurrentPlanData()!.price, getCurrentPlanData()!.currency)}${getCurrentPlanData()!.price !== 0 ? '/month' : ''}`
                          ) : (
                            'Free forever'
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      {getStatusBadge(getCurrentStatus())}
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {billing?.updatedAt ? new Date(billing.updatedAt).toLocaleDateString() : 'Active'}
                      </p>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Billing Information */}
              <Card className="border border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Billing Details</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">Account and payment information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Email</Label>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">{billing?.email || 'Not set'}</p>
                    </div>
                    
                    <div className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Status</Label>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">{getCurrentStatus()}</p>
                    </div>
                    
                    <div className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Created</Label>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">
                        {billing?.createdAt ? new Date(billing.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    
                    <div className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Updated</Label>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">
                        {billing?.updatedAt ? new Date(billing.updatedAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    
                    {billing?.subscriptionEndDate && (
                      <div className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Subscription Ends</Label>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">
                          {new Date(billing.subscriptionEndDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Payment information is now handled securely and not exposed to client */}
                </CardContent>
              </Card>

              {/* Billing Actions */}
              <Card className="border border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Billing Actions</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">Manage your subscription and payment methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3 flex-wrap">
                    {/* Payment Method Management - Show for all users */}
                    <Button
                      variant="outline"
                      onClick={handleUpdatePaymentMethod}
                      disabled={updatePaymentMethod.isPending}
                      className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                    >
                      {updatePaymentMethod.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      Update Payment Method
                    </Button>
                    
                    {/* Subscription Management - Show for paid users */}
                    {getCurrentPlan() !== PlanType.FREE && (
                      <Button
                        variant="outline"
                        onClick={handleSubscriptionManagement}
                        disabled={subscriptionManagement.isPending}
                        className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        {subscriptionManagement.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Shield className="h-4 w-4 mr-2" />
                        )}
                        Manage Subscription
                      </Button>
                    )}
                    
                    {/* Show Cancel button if user has an active paid plan */}
                    {getCurrentPlan() !== PlanType.FREE && getCurrentStatus() !== PlanStatus.CANCELLED && getCurrentStatus() !== SubscriptionStatus.CANCELLED && getCurrentStatus() !== PlanStatus.PENDING_CANCELLATION && (
                      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Cancel Subscription
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-red-500" />
                              Cancel Subscription
                            </DialogTitle>
                            <DialogDescription>
                              Are you sure you want to cancel your subscription? This will:
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3 py-4">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm">Downgrade to FREE plan</p>
                                <p className="text-sm text-muted-foreground">You'll lose access to premium features</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm">End billing cycle</p>
                                <p className="text-sm text-muted-foreground">No further charges will be made</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm">Keep your data</p>
                                <p className="text-sm text-muted-foreground">Your account and data remain safe</p>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setShowCancelModal(false)}
                              disabled={cancelSubscription.isPending}
                            >
                              Keep Subscription
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleCancelSubscription}
                              disabled={cancelSubscription.isPending}
                            >
                              {cancelSubscription.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Cancel Subscription
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    {/* Show Resubscribe button if subscription is cancelled */}
                    {(getCurrentStatus() === PlanStatus.CANCELLED || getCurrentStatus() === SubscriptionStatus.CANCELLED || getCurrentStatus() === PlanStatus.PAYMENT_FAILED) && (
                      <Button
                        onClick={handleResubscribe}
                        disabled={resubscribe.isPending}
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                      >
                        {resubscribe.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Resubscribe
                      </Button>
                    )}
                    
                    {/* Always show Upgrade button */}
                    <Button
                      onClick={handleUpgrade}
                      disabled={upgradePlan.isPending}
                      className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white"
                    >
                      {upgradePlan.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Upgrade Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Plan Options */}
              <Card className="border border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Available Plans</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">Choose the plan that fits your needs</CardDescription>
                </CardHeader>
                <CardContent>
                  {plansLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                      <span className="ml-2 text-slate-600 dark:text-slate-400">Loading plans...</span>
                    </div>
                  ) : plansError ? (
                    <div className="flex items-center justify-center h-64">
                      <AlertCircle className="h-8 w-8 text-red-500" />
                      <span className="ml-2 text-red-600 dark:text-red-400">Failed to load plans</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {plans.map((plan) => {
                        const isCurrentPlan = getCurrentPlan() === plan.type;
                        const IconComponent = getPlanIcon(plan.type);
                        const features = getPlanFeatures(plan);
                        
                        return (
                          <Card 
                            key={plan.type} 
                            className={`relative transition-all duration-200 ${
                              isCurrentPlan 
                                ? 'border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800' 
                                : 'border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm dark:bg-slate-900'
                            }`}
                          >
                            {isCurrentPlan && (
                              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                                <Badge className="bg-slate-600 dark:bg-slate-500 text-white text-xs">Current</Badge>
                              </div>
                            )}
                            
                            <CardHeader className="text-center pb-4">
                              <div className="flex items-center justify-center mb-2">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                  <IconComponent className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </div>
                              </div>
                              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {plan.type}
                              </CardTitle>
                              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {formatPrice(plan.price, plan.currency)}
                                {plan.price !== 0 && (
                                  <span className="text-sm font-normal text-slate-600 dark:text-slate-400">/month</span>
                                )}
                              </div>
                              {plan.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{plan.description}</p>
                              )}
                            </CardHeader>
                            
                            <CardContent className="space-y-3 pt-0">
                              <div className="space-y-2">
                                {features.map((feature, index) => (
                                  <div key={index} className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                                  </div>
                                ))}
                              </div>
                              
                              {!isCurrentPlan && (
                                <div className="pt-3">
                                  {plan.type === PlanType.FREE ? (
                                    <Button 
                                      variant="outline"
                                      className="w-full border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                      onClick={handleCancelSubscription}
                                      disabled={cancelSubscription.isPending}
                                    >
                                      {cancelSubscription.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      ) : null}
                                      Switch to Free
                                    </Button>
                                  ) : (
                                    <Button 
                                      className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white"
                                      onClick={() => handleUpgrade()}
                                      disabled={upgradePlan.isPending}
                                    >
                                      {upgradePlan.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      ) : null}
                                      {getCurrentPlan() === PlanType.FREE ? 'Upgrade' : 'Switch Plan'}
                                    </Button>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

            </>
          )}
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card className="shadow-lg border-0 dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Your data protection and privacy controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="space-y-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">Export Data</div>
                  <div className="text-sm text-muted-foreground">Download all your posts, analytics, and account data</div>
                </div>
                <Button variant="outline" className="hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-200 dark:hover:border-blue-800">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
                <div className="space-y-1">
                  <div className="font-medium text-red-800 dark:text-red-200">Delete Account</div>
                  <div className="text-sm text-red-600 dark:text-red-400">Permanently delete your account and all associated data</div>
                </div>
                <Button variant="destructive">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}