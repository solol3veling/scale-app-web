import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Send, 
  Clock,
  Save,
  Loader2
} from "lucide-react"
import { format } from "date-fns"
import { useCreatePost } from "@/hooks/api/usePosts"
import { CreatePostData, MediaItem } from "@/types/api"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { AccountSelector } from "@/components/AccountSelector"
import { PostComposer } from "@/components/PostComposer"
import { PostPreviewWrapper } from "@/components/PostPreviewWrapper"
import { PageHeader } from "@/components/PageHeader"


export default function MakePost() {
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([])
  const [postContent, setPostContent] = useState("")
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem[]>([])
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [scheduledTime, setScheduledTime] = useState("")
  const [isMediaUploading, setIsMediaUploading] = useState(false)
  
  const createPost = useCreatePost()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleAccountToggle = (accountId: string) => {
    setSelectedAccountIds(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    )
  }

  const handleSelectionChange = (accountIds: string[]) => {
    setSelectedAccountIds(accountIds)
  }

  const buildScheduledDateTime = (): string | undefined => {
    if (!isScheduled || !scheduledDate || !scheduledTime) return undefined
    
    const [hours, minutes] = scheduledTime.split(':')
    const dateTime = new Date(scheduledDate)
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    
    return dateTime.toISOString()
  }

  const handlePublishNow = async () => {
    if (!postContent.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your post.",
        variant: "destructive",
      })
      return
    }

    if (isMediaUploading) {
      toast({
        title: "Media uploading",
        description: "Please wait for media uploads to complete before publishing.",
        variant: "destructive",
      })
      return
    }

    const postData: CreatePostData = {
      content: postContent,
      media: uploadedMedia,
      accountIds: selectedAccountIds,
    }

    try {
      await createPost.mutateAsync(postData)
      if (selectedAccountIds.length > 0) {
        toast({
          title: "Post published!",
          description: `Your post has been published to ${selectedAccountIds.length} account${selectedAccountIds.length > 1 ? 's' : ''}.`,
        })
      } else {
        toast({
          title: "Draft saved!",
          description: "Your post has been saved as a draft. You can publish it later by selecting accounts.",
        })
      }
      navigate('/posts')
    } catch (error) {
      console.error('Failed to publish post:', error)
    }
  }

  const handleSchedulePost = async () => {
    if (!postContent.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your post.",
        variant: "destructive",
      })
      return
    }

    if (isMediaUploading) {
      toast({
        title: "Media uploading",
        description: "Please wait for media uploads to complete before scheduling.",
        variant: "destructive",
      })
      return
    }

    const scheduledFor = buildScheduledDateTime()
    if (!scheduledFor) {
      toast({
        title: "Schedule date required",
        description: "Please select a date and time for scheduling.",
        variant: "destructive",
      })
      return
    }

    const postData: CreatePostData = {
      content: postContent,
      media: uploadedMedia,
      scheduledFor,
      accountIds: selectedAccountIds,
    }

    try {
      await createPost.mutateAsync(postData)
      if (selectedAccountIds.length > 0) {
        toast({
          title: "Post scheduled!",
          description: `Your post has been scheduled for ${format(new Date(scheduledFor), 'PPP p')} on ${selectedAccountIds.length} account${selectedAccountIds.length > 1 ? 's' : ''}.`,
        })
      } else {
        toast({
          title: "Draft scheduled!",
          description: `Your post draft has been scheduled for ${format(new Date(scheduledFor), 'PPP p')}. Select accounts to publish it.`,
        })
      }
      navigate('/posts')
    } catch (error) {
      console.error('Failed to schedule post:', error)
    }
  }


  return (
    <div className="space-y-0">
      {/* Header */}
      <PageHeader>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Post</h1>
            <p className="text-muted-foreground text-sm">Share your content across multiple social media platforms</p>
          </div>
        </div>
      </PageHeader>

      {/* Main content area */}
      <div className="grid gap-6 lg:grid-cols-2 p-6">
        {/* Post Creation Form */}
        <div className="space-y-6">
          <AccountSelector 
            selectedAccountIds={selectedAccountIds}
            onAccountToggle={handleAccountToggle}
            onSelectionChange={handleSelectionChange}
          />

          <PostComposer 
            postContent={postContent}
            setPostContent={setPostContent}
            uploadedMedia={uploadedMedia}
            setUploadedMedia={setUploadedMedia}
            isScheduled={isScheduled}
            setIsScheduled={setIsScheduled}
            scheduledDate={scheduledDate}
            setScheduledDate={setScheduledDate}
            scheduledTime={scheduledTime}
            setScheduledTime={setScheduledTime}
            onUploadStateChange={setIsMediaUploading}
          />

          {/* Post Actions */}
          <Card className="shadow-medium">
            <CardContent className="pt-6">
              {selectedAccountIds.length === 0 && (
                <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-muted">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">💡 Tip:</span> No accounts selected. Your post will be saved as a draft and can be published later.
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                {isScheduled ? (
                  <Button 
                    className="flex-1 gradient-primary hover-scale"
                    onClick={handleSchedulePost}
                    disabled={createPost.isPending || isMediaUploading}
                  >
                    {createPost.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : isMediaUploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Clock className="h-4 w-4 mr-2" />
                    )}
                    {isMediaUploading ? "Uploading Media..." : selectedAccountIds.length > 0 ? "Schedule Post" : "Schedule Draft"}
                  </Button>
                ) : (
                  <Button 
                    className="flex-1 gradient-primary hover-scale"
                    onClick={handlePublishNow}
                    disabled={createPost.isPending || isMediaUploading}
                  >
                    {createPost.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : isMediaUploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : selectedAccountIds.length > 0 ? (
                      <Send className="h-4 w-4 mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isMediaUploading ? "Uploading Media..." : selectedAccountIds.length > 0 ? "Publish Now" : "Save as Draft"}
                  </Button>
                )}
                <Button variant="outline" className="hover-lift">
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <PostPreviewWrapper 
            postContent={postContent}
            uploadedMedia={uploadedMedia}
            selectedAccountIds={selectedAccountIds}
            isScheduled={isScheduled}
            scheduledDate={scheduledDate}
          />
        </div>
      </div>
    </div>
  )
}