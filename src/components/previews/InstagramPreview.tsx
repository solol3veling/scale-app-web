import { FC } from 'react';
import { MediaItem } from '@/types/api';
import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { PlayCircle } from 'lucide-react';

interface InstagramPreviewProps {
  postContent: string;
  uploadedMedia: MediaItem[];
  user: User | null;
}

const getThumbnailUrl = (videoUrl: string) => {
  return videoUrl.replace(/\.mp4$/, '.jpg');
};

export const InstagramPreview: FC<InstagramPreviewProps> = ({ postContent, uploadedMedia, user }) => {
  const userName = user?.user_metadata?.full_name || "Your Name";
  const userHandle = user?.email ? user.email.split('@')[0] : "yourhandle";
  const avatarUrl = user?.user_metadata?.avatar_url || "https://via.placeholder.com/32";

  return (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg w-full max-w-sm mx-auto font-sans text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center p-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={avatarUrl} alt={`@${userHandle}`} />
          <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="ml-3 font-semibold text-sm text-gray-900 dark:text-gray-100">{userHandle}</span>
        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">...</span>
      </div>

      {/* Media Carousel */}
      {uploadedMedia.length > 0 && (
        <Carousel className="w-full">
          <CarouselContent>
            {uploadedMedia.map((media, index) => (
              <CarouselItem key={index}>
                <div className="aspect-square bg-gray-100 dark:bg-gray-900">
                  {media.type === 'image' ? (
                    <img src={media.url} alt={`preview ${index}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="relative w-full h-full">
                      <img src={getThumbnailUrl(media.url)} alt={`preview ${index}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <PlayCircle className="h-12 w-12 text-white/80" />
                      </div>
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {uploadedMedia.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
            </>
          )}
        </Carousel>
      )}

      {/* Action Bar & Caption */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Heart className="h-6 w-6 cursor-pointer" />
            <MessageCircle className="h-6 w-6 cursor-pointer" />
            <Send className="h-6 w-6 cursor-pointer" />
          </div>
          <Bookmark className="h-6 w-6 cursor-pointer" />
        </div>
        <div className="mt-2 text-sm">
          <p className="font-semibold">[Likes Count] likes</p>
          <p className="mt-1">
            <span className="font-semibold mr-1">{userHandle}</span>
            <span className="whitespace-pre-wrap">{postContent || "[Your caption will appear here]"}</span>
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">View all [Comments Count] comments</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">[Time] AGO</p>
        </div>
      </div>
    </div>
  );
};


