/**
 * Generates a thumbnail from a video file using HTML5 video and canvas
 */
export const generateVideoThumbnail = (
  videoFile: File,
  seekTime: number = 0.5
): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log('Starting thumbnail generation for:', videoFile.name, videoFile.type);
    
    // Create a video element
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      reject(new Error('Cannot get canvas 2d context'));
      return;
    }

    // Set video properties for better compatibility
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    let hasResolved = false;

    const cleanup = () => {
      if (video.src && video.src.startsWith('blob:')) {
        URL.revokeObjectURL(video.src);
      }
      video.remove();
    };

    const handleError = (error: any) => {
      console.error('Video thumbnail generation error:', error);
      if (!hasResolved) {
        hasResolved = true;
        cleanup();
        reject(new Error(`Video loading error: ${error}`));
      }
    };

    video.addEventListener('loadedmetadata', () => {
      console.log('Video metadata loaded:', {
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });

      // Set canvas dimensions to video dimensions
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      // Seek to a safe time (either seekTime or 10% of duration, whichever is smaller)
      const safeSeekTime = Math.min(seekTime, video.duration * 0.1);
      video.currentTime = safeSeekTime;
      console.log('Seeking to time:', safeSeekTime);
    });

    video.addEventListener('seeked', () => {
      try {
        console.log('Video seeked successfully, drawing frame');
        
        // Draw the video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob URL
        canvas.toBlob((blob) => {
          if (blob && !hasResolved) {
            hasResolved = true;
            const thumbnailUrl = URL.createObjectURL(blob);
            console.log('Thumbnail generated successfully');
            cleanup();
            resolve(thumbnailUrl);
          } else if (!hasResolved) {
            handleError('Failed to create thumbnail blob');
          }
        }, 'image/jpeg', 0.8);
      } catch (error) {
        handleError(error);
      }
    });

    video.addEventListener('error', handleError);
    video.addEventListener('abort', () => handleError('Video loading aborted'));

    // Set timeout to prevent hanging
    setTimeout(() => {
      if (!hasResolved) {
        handleError('Thumbnail generation timeout');
      }
    }, 10000);

    try {
      // Set video source and load
      video.src = URL.createObjectURL(videoFile);
      video.load();
    } catch (error) {
      handleError(error);
    }
  });
};

/**
 * Generates a thumbnail blob for upload
 */
export const generateVideoThumbnailBlob = (
  videoFile: File,
  width: number = 300,
  height: number = 300,
  seekTime: number = 0.5
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      reject(new Error('Cannot get canvas 2d context'));
      return;
    }

    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    let hasResolved = false;

    const cleanup = () => {
      if (video.src && video.src.startsWith('blob:')) {
        URL.revokeObjectURL(video.src);
      }
      video.remove();
    };

    const handleError = (error: any) => {
      if (!hasResolved) {
        hasResolved = true;
        cleanup();
        reject(new Error(`Video loading error: ${error}`));
      }
    };

    video.addEventListener('loadedmetadata', () => {
      canvas.width = width;
      canvas.height = height;
      const safeSeekTime = Math.min(seekTime, video.duration * 0.1);
      video.currentTime = safeSeekTime;
    });

    video.addEventListener('seeked', () => {
      try {
        // Calculate aspect ratio and cropping
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
        
        context.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
        
        canvas.toBlob((blob) => {
          if (blob && !hasResolved) {
            hasResolved = true;
            cleanup();
            resolve(blob);
          } else if (!hasResolved) {
            handleError('Failed to create thumbnail blob');
          }
        }, 'image/jpeg', 0.8);
      } catch (error) {
        handleError(error);
      }
    });

    video.addEventListener('error', handleError);
    video.addEventListener('abort', () => handleError('Video loading aborted'));

    setTimeout(() => {
      if (!hasResolved) {
        handleError('Thumbnail generation timeout');
      }
    }, 10000);

    try {
      video.src = URL.createObjectURL(videoFile);
      video.load();
    } catch (error) {
      handleError(error);
    }
  });
};

/**
 * Generates a thumbnail with specific dimensions
 */
export const generateVideoThumbnailWithSize = (
  videoFile: File,
  width: number = 64,
  height: number = 64,
  seekTime: number = 0.5
): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(`Generating ${width}x${height} thumbnail for:`, videoFile.name);
    
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      reject(new Error('Cannot get canvas 2d context'));
      return;
    }

    // Set video properties for better compatibility
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    let hasResolved = false;

    const cleanup = () => {
      if (video.src && video.src.startsWith('blob:')) {
        URL.revokeObjectURL(video.src);
      }
      video.remove();
    };

    const handleError = (error: any) => {
      console.error('Video thumbnail generation error:', error);
      if (!hasResolved) {
        hasResolved = true;
        cleanup();
        reject(new Error(`Video loading error: ${error}`));
      }
    };

    video.addEventListener('loadedmetadata', () => {
      console.log('Thumbnail generation - metadata loaded:', {
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });

      // Set canvas to desired thumbnail size
      canvas.width = width;
      canvas.height = height;
      
      // Seek to a safe time
      const safeSeekTime = Math.min(seekTime, video.duration * 0.1);
      video.currentTime = safeSeekTime;
      console.log('Thumbnail generation - seeking to:', safeSeekTime);
    });

    video.addEventListener('seeked', () => {
      try {
        console.log('Thumbnail generation - seeked successfully');
        
        // Calculate aspect ratio and cropping
        const videoAspect = video.videoWidth / video.videoHeight;
        const canvasAspect = width / height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (videoAspect > canvasAspect) {
          // Video is wider - crop horizontally
          drawHeight = height;
          drawWidth = height * videoAspect;
          offsetX = (width - drawWidth) / 2;
          offsetY = 0;
        } else {
          // Video is taller - crop vertically
          drawWidth = width;
          drawHeight = width / videoAspect;
          offsetX = 0;
          offsetY = (height - drawHeight) / 2;
        }
        
        console.log('Drawing video frame with dimensions:', { drawWidth, drawHeight, offsetX, offsetY });
        
        // Draw the video frame to canvas with aspect ratio preservation
        context.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
        
        canvas.toBlob((blob) => {
          if (blob && !hasResolved) {
            hasResolved = true;
            const thumbnailUrl = URL.createObjectURL(blob);
            console.log('Thumbnail with size generated successfully');
            cleanup();
            resolve(thumbnailUrl);
          } else if (!hasResolved) {
            handleError('Failed to create thumbnail blob');
          }
        }, 'image/jpeg', 0.8);
      } catch (error) {
        handleError(error);
      }
    });

    video.addEventListener('error', handleError);
    video.addEventListener('abort', () => handleError('Video loading aborted'));

    // Set timeout to prevent hanging
    setTimeout(() => {
      if (!hasResolved) {
        handleError('Thumbnail generation timeout');
      }
    }, 10000);

    try {
      video.src = URL.createObjectURL(videoFile);
      video.load();
    } catch (error) {
      handleError(error);
    }
  });
};

/**
 * Checks if a file is a video file
 */
export const isVideoFile = (file: File): boolean => {
  const isVideo = file.type.startsWith('video/');
  console.log(`File type check: ${file.name} (${file.type}) -> isVideo: ${isVideo}`);
  return isVideo;
};

/**
 * Gets supported video MIME types
 */
export const getSupportedVideoTypes = (): string[] => {
  return [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/mkv'
  ];
};