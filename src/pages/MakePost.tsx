import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Image as ImageIcon, 
  Video, 
  Calendar, 
  Send, 
  Plus,
  X,
  Eye,
  Heart,
  MessageSquare,
  Share2
} from "lucide-react"

const socialPlatforms = [
  { id: "instagram", name: "Instagram", color: "bg-gradient-to-r from-purple-500 to-pink-500", handle: "@mycompany" },
  { id: "facebook", name: "Facebook", color: "bg-facebook", handle: "My Company" },
  { id: "twitter", name: "Twitter", color: "bg-twitter", handle: "@mycompany" },
  { id: "linkedin", name: "LinkedIn", color: "bg-linkedin", handle: "My Company" },
  { id: "pinterest", name: "Pinterest", color: "bg-pinterest", handle: "@mycompany" },
  { id: "tiktok", name: "TikTok", color: "bg-tiktok", handle: "@mycompany" }
]

const mockPostPreview = {
  content: "Check out our latest product update! 🚀 We've been working hard to bring you the best experience possible. What do you think? #innovation #tech #startup",
  author: "My Company",
  handle: "@mycompany",
  time: "2m",
  image: "/placeholder-post-preview.jpg"
}

export default function MakePost() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "twitter"])
  const [postContent, setPostContent] = useState("")
  const [scheduledPost, setScheduledPost] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    )
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // In a real app, you'd upload these files and get URLs
      const newImages = Array.from(files).map(file => URL.createObjectURL(file))
      setUploadedImages(prev => [...prev, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Post</h1>
          <p className="text-muted-foreground">Share your content across multiple social media platforms</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Post Creation Form */}
        <div className="space-y-6">
          {/* Platform Selection */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Select Platforms
              </CardTitle>
              <CardDescription>Choose where to publish your post</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {socialPlatforms.map((platform) => (
                  <div
                    key={platform.id}
                    className={`relative border rounded-lg p-4 cursor-pointer transition-all hover-lift ${
                      selectedPlatforms.includes(platform.id)
                        ? "ring-2 ring-primary bg-accent/20"
                        : "hover:bg-accent/50"
                    }`}
                    onClick={() => handlePlatformToggle(platform.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedPlatforms.includes(platform.id)}
                        onChange={() => handlePlatformToggle(platform.id)}
                        className="pointer-events-none"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${platform.color}`} />
                          <span className="font-medium text-sm">{platform.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{platform.handle}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedPlatforms.map((platformId) => {
                  const platform = socialPlatforms.find(p => p.id === platformId)
                  return platform ? (
                    <Badge key={platformId} variant="secondary" className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded ${platform.color}`} />
                      {platform.name}
                    </Badge>
                  ) : null
                })}
              </div>
            </CardContent>
          </Card>

          {/* Post Content */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="content">Message</Label>
                <Textarea
                  id="content"
                  placeholder="What's on your mind?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">
                    {postContent.length}/280 characters
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      Schedule
                    </Button>
                  </div>
                </div>
              </div>

              {/* Media Upload */}
              <div className="space-y-3">
                <Label>Media</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <ImageIcon className="h-4 w-4 mr-1" />
                    Add Images
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4 mr-1" />
                    Add Video
                  </Button>
                </div>

                {/* Uploaded Images */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Post Actions */}
          <Card className="shadow-medium">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Button className="flex-1 gradient-primary hover-scale">
                  <Send className="h-4 w-4 mr-2" />
                  Publish Now
                </Button>
                <Button variant="outline" className="hover-lift">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
                <Button variant="outline" className="hover-lift">
                  Save Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview
              </CardTitle>
              <CardDescription>See how your post will look</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="instagram" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="instagram">Instagram</TabsTrigger>
                  <TabsTrigger value="twitter">Twitter</TabsTrigger>
                  <TabsTrigger value="facebook">Facebook</TabsTrigger>
                </TabsList>
                
                <TabsContent value="instagram" className="mt-4">
                  <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                    {/* Instagram Post Header */}
                    <div className="flex items-center gap-3 p-3 border-b">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">MC</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">mycompany</p>
                        <p className="text-xs text-gray-500">2m</p>
                      </div>
                    </div>
                    
                    {/* Post Image */}
                    {uploadedImages.length > 0 && (
                      <img
                        src={uploadedImages[0]}
                        alt="Post"
                        className="w-full aspect-square object-cover"
                      />
                    )}
                    
                    {/* Post Actions */}
                    <div className="p-3 space-y-2">
                      <div className="flex items-center gap-4">
                        <Heart className="h-6 w-6" />
                        <MessageSquare className="h-6 w-6" />
                        <Share2 className="h-6 w-6" />
                      </div>
                      <p className="font-semibold text-sm">42 likes</p>
                      <p className="text-sm">
                        <span className="font-semibold">mycompany</span>{" "}
                        {postContent || "Your post content will appear here..."}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="twitter" className="mt-4">
                  <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-full bg-twitter flex items-center justify-center">
                        <span className="text-white font-bold">MC</span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">My Company</span>
                          <span className="text-gray-500">@mycompany</span>
                          <span className="text-gray-500">·</span>
                          <span className="text-gray-500">2m</span>
                        </div>
                        <p className="text-sm">
                          {postContent || "Your post content will appear here..."}
                        </p>
                        {uploadedImages.length > 0 && (
                          <img
                            src={uploadedImages[0]}
                            alt="Post"
                            className="w-full rounded-lg max-h-64 object-cover"
                          />
                        )}
                        <div className="flex items-center justify-between pt-2 text-gray-500">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-sm">12</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="h-4 w-4" />
                            <span className="text-sm">8</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span className="text-sm">45</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="facebook" className="mt-4">
                  <div className="bg-white border rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 p-4 border-b">
                      <div className="w-10 h-10 rounded-full bg-facebook flex items-center justify-center">
                        <span className="text-white font-bold">MC</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">My Company</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <p className="text-sm">
                        {postContent || "Your post content will appear here..."}
                      </p>
                      
                      {uploadedImages.length > 0 && (
                        <img
                          src={uploadedImages[0]}
                          alt="Post"
                          className="w-full rounded-lg max-h-64 object-cover"
                        />
                      )}
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Heart className="h-4 w-4" />
                            <span className="text-sm">Like</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-sm">Comment</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Share2 className="h-4 w-4" />
                            <span className="text-sm">Share</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}