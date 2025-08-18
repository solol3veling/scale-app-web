import { Images, Play } from "lucide-react";

// Media Count Component (same as Posts page)
export function MediaCount({ media }: { media: any[] }) {
  if (!media || media.length === 0) return null;
  
  // Count images and videos
  const imageCount = media.filter(item => item.type === 'image').length;
  const videoCount = media.filter(item => item.type === 'video').length;
  
  return (
    <div className="flex items-center gap-3">
      {imageCount > 0 && (
        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
          <Images className="h-4 w-4" />
          <span className="text-sm font-semibold">{imageCount}</span>
        </div>
      )}
      {videoCount > 0 && (
        <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
          <Play className="h-4 w-4 fill-current" />
          <span className="text-sm font-semibold">{videoCount}</span>
        </div>
      )}
    </div>
  );
}
