import { FC } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MediaItem } from '@/types/api';
import { User } from '@supabase/supabase-js';
import { MediaGrid } from './MediaGrid';
import { MessageCircle, Repeat2, Heart, Share } from 'lucide-react';

interface TwitterPreviewProps {
  postContent: string;
  uploadedMedia: MediaItem[];
  user: User | null;
}

export const TwitterPreview: FC<TwitterPreviewProps> = ({ postContent, uploadedMedia, user }) => {
  const userName = user?.user_metadata?.full_name || "Your Name";
  const userHandle = user?.email ? `@${user.email.split('@')[0]}` : "@yourhandle";
  const avatarUrl = user?.user_metadata?.avatar_url || "https://via.placeholder.com/48";
  const postTime = "[Time] ago"; // Placeholder for time

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-black max-w-xl mx-auto font-sans text-gray-900 dark:text-gray-100">
      <div className="flex space-x-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={avatarUrl} alt={userHandle} />
          <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-1">
            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{userName}</h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">{userHandle} • {postTime}</span>
          </div>
          <div className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
            {postContent || "[Your tweet content will appear here]"}
          </div>

          {/* Media Preview */}
          {uploadedMedia.length > 0 && (
            <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 aspect-[16/9]">
              <MediaGrid mediaItems={uploadedMedia} aspectRatio="aspect-[16/9]" />
            </div>
          )}

          {/* Engagement Bar */}
          <div className="flex items-center justify-between mt-3 text-gray-500 dark:text-gray-400 text-xs">
            <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">
              <MessageCircle className="h-4 w-4" />
              <span>0</span>
            </div>
            <div className="flex items-center space-x-1 cursor-pointer hover:text-green-400">
              <Repeat2 className="h-4 w-4" />
              <span>0</span>
            </div>
            <div className="flex items-center space-x-1 cursor-pointer hover:text-red-400">
              <Heart className="h-4 w-4" />
              <span>0</span>
            </div>
            <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">
              <Share className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};