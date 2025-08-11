import { useState } from "react"
import { MediaItem } from "@/types/api"
import { PostComposer } from "@/components/PostComposer"
import { PostPreviewTabs } from "@/components/PostPreviewTabs";
import { PageHeader } from "@/components/PageHeader"
import { AccountSelector } from "@/components/AccountSelector"


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
          {/* Account Selector */}
          <AccountSelector 
            selectedAccountIds={selectedAccountIds}
            onAccountToggle={handleAccountToggle}
            onSelectionChange={handleSelectionChange}
          />
          
          {/* Post Composer */}
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
          <PostPreviewTabs 
            postContent={postContent}
            uploadedMedia={uploadedMedia}
          />
        </div>
      </div>
    </div>
  )
}