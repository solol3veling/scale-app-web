import { FC } from 'react';
import { MediaItem } from '@/types/api';
import { PlayCircle } from 'lucide-react';

const getThumbnailUrl = (videoUrl: string) => {
  return videoUrl.replace(/\.mp4$/, '.jpg');
};

interface MediaGridProps {
  mediaItems: MediaItem[];
  aspectRatio?: string; // New prop for aspect ratio
}

const MediaFile: FC<{ media: MediaItem }> = ({ media }) => {
  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {media.type === 'image' ? (
        <img src={media.url} alt="preview" className="w-full h-full object-cover" />
      ) : (
        <>
          <img src={getThumbnailUrl(media.url)} alt="preview" className="w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayCircle className="h-12 w-12 text-white/80" />
          </div>
        </>
      )}
    </div>
  );
};

export const MediaGrid: FC<MediaGridProps> = ({ mediaItems, aspectRatio = "aspect-[16/9]" }) => {
  const count = mediaItems.length;

  if (count === 0) return null;

  if (count === 1) {
    return (
      <div className={`w-full ${aspectRatio}`}>
        <MediaFile media={mediaItems[0]} />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className={`grid grid-cols-2 gap-px w-full ${aspectRatio}`}>
        <MediaFile media={mediaItems[0]} />
        <MediaFile media={mediaItems[1]} />
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className={`grid grid-cols-2 grid-rows-2 gap-px w-full ${aspectRatio}`}>
        <div className="col-span-1 row-span-2">
          <MediaFile media={mediaItems[0]} />
        </div>
        <div className="col-span-1 row-span-1">
          <MediaFile media={mediaItems[1]} />
        </div>
        <div className="col-span-1 row-span-1">
          <MediaFile media={mediaItems[2]} />
        </div>
      </div>
    );
  }

  // For 4 or more items, show a 2x2 grid of the first 4
  return (
    <div className={`grid grid-cols-2 grid-rows-2 gap-px w-full ${aspectRatio}`}>
      <MediaFile media={mediaItems[0]} />
      <MediaFile media={mediaItems[1]} />
      <MediaFile media={mediaItems[2]} />
      <MediaFile media={mediaItems[3]} />
    </div>
  );
};