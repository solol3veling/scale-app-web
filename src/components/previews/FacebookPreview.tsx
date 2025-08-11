import { FC } from 'react';
import { MediaItem } from '@/types/api';
import { User } from '@supabase/supabase-js';
import { MediaGrid } from './MediaGrid';
import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react';

interface FacebookPreviewProps {
  postContent: string;
  uploadedMedia: MediaItem[];
  user: User | null;
}

export const FacebookPreview: FC<FacebookPreviewProps> = ({ postContent, uploadedMedia, user }) => {
  const userName = user?.user_metadata?.full_name || "Your Name";
  const avatarUrl = user?.user_metadata?.avatar_url || "https://via.placeholder.com/32";
  const postTime = "[Time] ago"; // Placeholder for time

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden max-w-md mx-auto font-sans text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center p-3 pb-2">
        <img src={avatarUrl} alt="User Avatar" className="w-10 h-10 rounded-full mr-3" />
        <div>
          <p className="font-semibold text-sm">{userName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{postTime} • <span className="lucide-globe">Public</span></p>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-3 pb-2">
        <p className="text-sm whitespace-pre-wrap">{postContent || "[Your post content will appear here]"}</p>
      </div>
      
      {/* Media Preview */}
      {uploadedMedia.length > 0 && (
        <div className="mt-2 rounded-lg overflow-hidden">
          <MediaGrid mediaItems={uploadedMedia} aspectRatio="aspect-[16/9]" />
        </div>
      )}

      {/* Engagement Bar */}
      <div className="flex items-center justify-around p-2 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm">
        <div className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg flex-1 justify-center">
          <ThumbsUp className="h-4 w-4" />
          <span>Like</span>
        </div>
        <div className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg flex-1 justify-center">
          <MessageCircle className="h-4 w-4" />
          <span>Comment</span>
        </div>
        <div className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg flex-1 justify-center">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </div>
      </div>
    </div>
  );
};