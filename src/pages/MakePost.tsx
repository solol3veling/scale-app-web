import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Share2,
  Expand
} from "lucide-react"
import { MediaItem } from "@/types/api"
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

      {/* Main content area - Simplified Layout */}
      <div className="grid gap-6 lg:grid-cols-2 p-6">
        {/* Post Creation Form */}
        <div className="space-y-6">
          {/* Account Selector with Inline Basic View + Expand Option */}
          <Card className="shadow-medium">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Share2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Select Accounts</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAccountIds.length > 0 
                        ? `${selectedAccountIds.length} account${selectedAccountIds.length > 1 ? 's' : ''} selected`
                        : "Choose accounts to post to"
                      }
                    </p>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <Expand className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Select Accounts</DialogTitle>
                    </DialogHeader>
                    <div className="p-4">
                      <AccountSelector 
                        selectedAccountIds={selectedAccountIds}
                        onAccountToggle={handleAccountToggle}
                        onSelectionChange={handleSelectionChange}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* Inline Basic Account Selection */}
              <AccountSelector 
                selectedAccountIds={selectedAccountIds}
                onAccountToggle={handleAccountToggle}
                onSelectionChange={handleSelectionChange}
              />
            </CardContent>
          </Card>

          {/* Enhanced PostComposer */}
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
            selectedAccountIds={selectedAccountIds}
          />
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