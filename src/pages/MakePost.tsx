import { useState, useMemo, useCallback } from "react"
import { MediaItem } from "@/types/api"
import { PostComposer } from "@/components/PostComposer"
import { PostPreviewTabs } from "@/components/PostPreviewTabs";
import { PageHeader } from "@/components/PageHeader"
import { AccountSelector } from "@/components/AccountSelector"
import { ValidationStack } from "@/components/validation/ValidationStack"
import { usePostValidation } from "@/hooks/usePostValidation"
import { useSocialAccounts } from "@/hooks/api/useSocialAccounts"


export default function MakePost() {
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([])
  const [postContent, setPostContent] = useState("")
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem[]>([])
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [scheduledTime, setScheduledTime] = useState("")
  const [isMediaUploading, setIsMediaUploading] = useState(false)

  // Get all social accounts and filter selected ones
  const { data: allAccounts = [] } = useSocialAccounts()
  const selectedAccounts = useMemo(() => 
    allAccounts.filter(account => selectedAccountIds.includes(account.id)),
    [allAccounts, selectedAccountIds]
  )

  // Real-time validation
  const validation = usePostValidation({
    content: postContent,
    media: uploadedMedia,
    selectedAccounts: selectedAccounts,
  })

  const handleSelectionChange = useCallback((accountIds: string[]) => {
    setSelectedAccountIds(accountIds)
  }, [])


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

      {/* Main content area - Enhanced Layout with Validation */}
      <div className="grid gap-6 lg:grid-cols-3 p-6">
        {/* Post Creation Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Selector */}
          <AccountSelector 
            selectedAccountIds={selectedAccountIds}
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

          {/* Preview Panel - Mobile/Tablet */}
          <div className="lg:hidden">
            <PostPreviewTabs 
              postContent={postContent}
              uploadedMedia={uploadedMedia}
            />
          </div>
        </div>

        {/* Right Sidebar - Validation & Preview */}
        <div className="space-y-6">
          {/* Real-time Validation Stack */}
          <ValidationStack 
            validationResult={validation.result}
            isValidating={validation.isValidating}
          />

          {/* Preview Panel - Desktop */}
          <div className="hidden lg:block">
            <PostPreviewTabs 
              postContent={postContent}
              uploadedMedia={uploadedMedia}
            />
          </div>
        </div>
      </div>
    </div>
  )
}