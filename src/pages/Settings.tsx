import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Download,
  Upload,
  Save,
  Edit3,
  Crown,
  Zap
} from "lucide-react"

const notificationSettings = [
  { id: "new_posts", label: "New post notifications", description: "Get notified when posts are published", enabled: true },
  { id: "engagement", label: "Engagement alerts", description: "Notifications for likes, comments, and shares", enabled: true },
  { id: "scheduled", label: "Scheduled post reminders", description: "Reminders before scheduled posts go live", enabled: false },
  { id: "analytics", label: "Weekly analytics reports", description: "Weekly performance summaries via email", enabled: true },
  { id: "account_issues", label: "Account connection issues", description: "Alerts when social accounts need attention", enabled: true },
]

const privacySettings = [
  { id: "public_profile", label: "Public profile", description: "Make your profile discoverable by others", enabled: false },
  { id: "usage_analytics", label: "Usage analytics", description: "Help improve our service with anonymous usage data", enabled: true },
  { id: "marketing_emails", label: "Marketing emails", description: "Receive updates about new features and tips", enabled: false },
]

export default function Settings() {
  const [notifications, setNotifications] = useState(notificationSettings)
  const [privacy, setPrivacy] = useState(privacySettings)
  const [isEditing, setIsEditing] = useState(false)

  const toggleNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(item => 
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    )
  }

  const togglePrivacy = (id: string) => {
    setPrivacy(prev => 
      prev.map(item => 
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Settings */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and profile settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="gradient-primary text-white text-xl">JD</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="hover-lift">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF (max. 2MB)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" disabled={!isEditing} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="john.doe@example.com" disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" defaultValue="My Company" disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell us about yourself..."
                  defaultValue="Social media manager and content creator passionate about building engaging online communities."
                  disabled={!isEditing}
                />
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button className="gradient-primary hover-scale" onClick={() => setIsEditing(false)}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(true)} className="hover-lift">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {/* Notification Settings */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/20 transition-colors">
                  <div className="space-y-1">
                    <div className="font-medium">{setting.label}</div>
                    <div className="text-sm text-muted-foreground">{setting.description}</div>
                  </div>
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={() => toggleNotification(setting.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          {/* Privacy Settings */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Control your privacy and data settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {privacy.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/20 transition-colors">
                  <div className="space-y-1">
                    <div className="font-medium">{setting.label}</div>
                    <div className="text-sm text-muted-foreground">{setting.description}</div>
                  </div>
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={() => togglePrivacy(setting.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Download or delete your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-1">
                  <div className="font-medium">Export Data</div>
                  <div className="text-sm text-muted-foreground">Download all your posts, analytics, and account data</div>
                </div>
                <Button variant="outline" className="hover-lift">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                <div className="space-y-1">
                  <div className="font-medium text-destructive">Delete Account</div>
                  <div className="text-sm text-muted-foreground">Permanently delete your account and all associated data</div>
                </div>
                <Button variant="destructive" className="hover-scale">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          {/* Billing Settings */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription & Billing
              </CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-accent/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Free Plan</div>
                    <div className="text-sm text-muted-foreground">Limited to 5 social accounts</div>
                  </div>
                </div>
                <Badge variant="secondary">Current Plan</Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-2 border-primary/20 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="gradient-primary">Most Popular</Badge>
                  </div>
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                      <Crown className="h-5 w-5 text-primary" />
                      Pro Plan
                    </CardTitle>
                    <div className="text-3xl font-bold">$19<span className="text-sm font-normal">/month</span></div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">✓ Unlimited social accounts</div>
                    <div className="text-sm">✓ Advanced analytics</div>
                    <div className="text-sm">✓ Post scheduling</div>
                    <div className="text-sm">✓ Team collaboration</div>
                    <div className="text-sm">✓ Priority support</div>
                    <Button className="w-full gradient-primary hover-scale mt-4">
                      Upgrade to Pro
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="text-center">
                    <CardTitle>Enterprise</CardTitle>
                    <div className="text-3xl font-bold">Custom</div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">✓ Everything in Pro</div>
                    <div className="text-sm">✓ White-label solution</div>
                    <div className="text-sm">✓ API access</div>
                    <div className="text-sm">✓ Custom integrations</div>
                    <div className="text-sm">✓ Dedicated support</div>
                    <Button variant="outline" className="w-full hover-lift mt-4">
                      Contact Sales
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 bg-primary rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">VISA</span>
                      </div>
                      <div>
                        <div className="font-medium">•••• •••• •••• 4242</div>
                        <div className="text-sm text-muted-foreground">Expires 12/25</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="hover-lift">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}