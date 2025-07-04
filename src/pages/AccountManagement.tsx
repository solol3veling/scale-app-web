import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Plus, 
  Settings as SettingsIcon, 
  Trash2, 
  Edit3, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Tag,
  Search
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const socialAccounts = [
  {
    id: 1,
    platform: "Instagram",
    handle: "@mycompany",
    displayName: "My Company",
    followers: "2.1K",
    status: "active",
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
    tags: ["Business", "Main"],
    lastPost: "2h ago",
    profileImage: "/placeholder-ig.jpg"
  },
  {
    id: 2,
    platform: "Twitter",
    handle: "@mycompany",
    displayName: "My Company",
    followers: "1.8K",
    status: "active",
    color: "bg-twitter",
    tags: ["Business", "Updates"],
    lastPost: "5h ago",
    profileImage: "/placeholder-twitter.jpg"
  },
  {
    id: 3,
    platform: "Facebook",
    handle: "mycompany",
    displayName: "My Company Page",
    followers: "3.2K",
    status: "inactive",
    color: "bg-facebook",
    tags: ["Business"],
    lastPost: "2d ago",
    profileImage: "/placeholder-fb.jpg"
  },
  {
    id: 4,
    platform: "LinkedIn",
    handle: "my-company",
    displayName: "My Company",
    followers: "945",
    status: "active",
    color: "bg-linkedin",
    tags: ["Professional", "B2B"],
    lastPost: "1d ago",
    profileImage: "/placeholder-linkedin.jpg"
  },
  {
    id: 5,
    platform: "Pinterest",
    handle: "@mycompany",
    displayName: "My Company",
    followers: "567",
    status: "active",
    color: "bg-pinterest",
    tags: ["Visual", "Marketing"],
    lastPost: "3d ago",
    profileImage: "/placeholder-pinterest.jpg"
  },
  {
    id: 6,
    platform: "TikTok",
    handle: "@mycompany",
    displayName: "My Company",
    followers: "1.2K",
    status: "pending",
    color: "bg-tiktok",
    tags: ["Video", "Creative"],
    lastPost: "1w ago",
    profileImage: "/placeholder-tiktok.jpg"
  }
]

const platformOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "pinterest", label: "Pinterest" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" }
]

export default function AccountManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState("")
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)

  const filteredAccounts = socialAccounts.filter(account => {
    const matchesSearch = account.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlatform = selectedPlatform === "" || account.platform.toLowerCase() === selectedPlatform
    return matchesSearch && matchesPlatform
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Management</h1>
          <p className="text-muted-foreground">Manage your connected social media accounts</p>
        </div>
        <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary hover-scale">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Connect New Account</DialogTitle>
              <DialogDescription>
                Add a new social media account to your dashboard
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-name">Account Name</Label>
                <Input id="account-name" placeholder="Enter account name or handle" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (optional)</Label>
                <Input id="tags" placeholder="e.g., Business, Personal, Marketing" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddAccountOpen(false)}>
                Cancel
              </Button>
              <Button className="gradient-primary">Connect Account</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All platforms</SelectItem>
                {platformOptions.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAccounts.map((account) => (
          <Card key={account.id} className="shadow-medium hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={account.profileImage} />
                    <AvatarFallback className={`${account.color} text-white`}>
                      {account.platform.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{account.displayName}</h3>
                    <p className="text-sm text-muted-foreground">{account.handle}</p>
                  </div>
                </div>
                {getStatusBadge(account.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Platform</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${account.color}`} />
                    <span className="font-medium">{account.platform}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Followers</p>
                  <p className="font-semibold">{account.followers}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {account.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  Last post: {account.lastPost}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover-scale">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover-scale">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover-scale">
                    <SettingsIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Summary */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
          <CardDescription>Overview of your connected accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {socialAccounts.filter(a => a.status === "active").length}
              </div>
              <div className="text-sm text-muted-foreground">Active Accounts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {socialAccounts.filter(a => a.status === "pending").length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {socialAccounts.filter(a => a.status === "inactive").length}
              </div>
              <div className="text-sm text-muted-foreground">Inactive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {socialAccounts.reduce((sum, account) => {
                  const followers = parseFloat(account.followers.replace('K', '')) * 1000
                  return sum + followers
                }, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Followers</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}