import React, { useState, useEffect } from 'react';
import { Video, Play } from 'lucide-react';

interface VideoThumbnailProps {
  url: string;
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
}

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  url,
  width = 64,
  height = 64,
  className = "",
  onClick
}) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateThumbnail = async () => {
      try {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.playsInline = true;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          setIsLoading(false);
          return;
        }

        canvas.width = width;
        canvas.height = height;

        video.addEventListener('loadedmetadata', () => {
          video.currentTime = Math.min(1, video.duration * 0.1);
        });

        video.addEventListener('seeked', () => {
          try {
            // Calculate aspect ratio
            const videoAspect = video.videoWidth / video.videoHeight;
            const canvasAspect = width / height;
            
            let drawWidth, drawHeight, offsetX, offsetY;
            
            if (videoAspect > canvasAspect) {
              drawHeight = height;
              drawWidth = height * videoAspect;
              offsetX = (width - drawWidth) / 2;
              offsetY = 0;
            } else {
              drawWidth = width;
              drawHeight = width / videoAspect;
              offsetX = 0;
              offsetY = (height - drawHeight) / 2;
            }

            ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
            const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
            setThumbnail(thumbnailUrl);
            setIsLoading(false);
            
            // Cleanup
            if (video.src) {
              URL.revokeObjectURL(video.src);
            }
          } catch (error) {
            console.warn('Failed to generate thumbnail:', error);
            setIsLoading(false);
          }
        });

        video.addEventListener('error', () => {
          setIsLoading(false);
        });

        video.src = url;
        video.load();

        // Cleanup timeout
        setTimeout(() => {
          setIsLoading(false);
        }, 5000);

      } catch (error) {
        console.warn('Thumbnail generation failed:', error);
        setIsLoading(false);
      }
    };

    generateThumbnail();
  }, [url, width, height]);

  return (
    <div 
      className={`relative overflow-hidden rounded cursor-pointer ${className}`}
      style={{ width, height }}
      onClick={onClick}
    >
      {thumbnail ? (
        <>
          <img
            src={thumbnail}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Play className="h-4 w-4 text-white" fill="white" />
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <Video className={`h-6 w-6 text-muted-foreground ${isLoading ? 'animate-pulse' : ''}`} />
        </div>
      )}
    </div>
  );
};