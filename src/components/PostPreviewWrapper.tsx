import { useSocialAccounts } from "@/hooks/api/useSocialAccounts"
import { PostPreview } from "./PostPreview"
import { MediaItem } from "@/types/api"

interface PostPreviewWrapperProps {
  postContent: string
  uploadedMedia: MediaItem[]
  selectedAccountIds: string[]
  isScheduled: boolean
  scheduledDate?: Date
}

export function PostPreviewWrapper({
  postContent,
  uploadedMedia,
  selectedAccountIds,
  isScheduled,
  scheduledDate,
}: PostPreviewWrapperProps) {
  const { data: socialAccounts } = useSocialAccounts()
  
  const selectedAccounts = socialAccounts?.filter(account => 
    selectedAccountIds.includes(account.id)
  ) || []

  return (
    <PostPreview 
      postContent={postContent}
      uploadedMedia={uploadedMedia}
      selectedAccounts={selectedAccounts}
      isScheduled={isScheduled}
      scheduledDate={scheduledDate}
    />
  )
}