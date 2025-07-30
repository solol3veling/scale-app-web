import { useState } from "react"
import { format } from "date-fns"
import { Calendar, Clock, Copy, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Post, PostStatus } from "@/types/api"

interface ScheduleConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  post: Post | null
  targetDate: Date | null
  onConfirm: () => void
}

export function ScheduleConfirmationModal({
  isOpen,
  onClose,
  post,
  targetDate,
  onConfirm
}: ScheduleConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!post || !targetDate) return null

  const isDraft = post.status === PostStatus.DRAFT
  const isScheduled = post.status === PostStatus.SCHEDULED
  const isPublishing = post.status === PostStatus.PUBLISHING
  const isPublished = post.status === PostStatus.PUBLISHED

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Error scheduling post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getModalContent = () => {
    if (isDraft) {
      return {
        title: "Schedule Draft Post",
        description: "This will create a copy of your draft post and schedule it for the selected date. Your original draft will remain unchanged.",
        icon: <Copy className="h-5 w-5 text-blue-500" />,
        warningText: "A copy of this draft will be created and scheduled. The original draft will remain in your drafts.",
        buttonText: "Continue & Schedule Copy"
      }
    } else if (isScheduled) {
      return {
        title: "Reschedule Post",
        description: "This will move your scheduled post to the new date and time.",
        icon: <Clock className="h-5 w-5 text-orange-500" />,
        warningText: "The post will be rescheduled to the new date and time.",
        buttonText: "Reschedule Post"
      }
    } else if (isPublished) {
      return {
        title: "Cannot Move Published Post",
        description: "This post has already been published and cannot be moved.",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        warningText: "Published posts cannot be rescheduled.",
        buttonText: "Cannot Move"
      }
    }
    
    return {
      title: "Schedule Post",
      description: "Schedule this post for the selected date.",
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      warningText: "",
      buttonText: "Schedule Post"
    }
  }

  const content = getModalContent()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {content.icon}
            {content.title}
          </DialogTitle>
          <DialogDescription>
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Post preview */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Post Content:
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {post.content.length > 100 
                ? `${post.content.substring(0, 100)}...` 
                : post.content
              }
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500">Current status:</span>
              <span className={`text-xs px-2 py-1 rounded ${
                post.status === PostStatus.DRAFT ? 'bg-gray-100 text-gray-700' :
                post.status === PostStatus.SCHEDULED ? 'bg-blue-100 text-blue-700' :
                post.status === PostStatus.PUBLISHING ? 'bg-yellow-100 text-yellow-700' :
                post.status === PostStatus.PUBLISHED ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              }`}>
                {post.status}
              </span>
            </div>
          </div>

          {/* Target date info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Target Date:
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              {format(targetDate, 'EEEE, MMMM d, yyyy')}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Note: You'll be able to set the specific time in the next step
            </div>
          </div>

          {/* Warning */}
          {content.warningText && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  {content.warningText}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-4">
          {!isPublished && (
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isDraft ? "Scheduling..." : "Updating..."}
                </div>
              ) : (
                content.buttonText
              )}
            </Button>
          )}
          
          <Button onClick={onClose} variant="ghost" className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}