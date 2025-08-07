/**
 * Utility functions for media handling
 */

/**
 * Derives a thumbnail URL from a video URL by changing the extension to .jpg
 * @param videoUrl - The URL of the video file
 * @returns The thumbnail URL with .jpg extension
 */
export const getVideoThumbnailUrl = (videoUrl: string): string => {
  return videoUrl.replace(/\.[^/.]+$/, '.jpg');
};

/**
 * Checks if a media item is a video based on its type
 * @param mediaType - The media type string
 * @returns True if the media is a video
 */
export const isVideoType = (mediaType: string): boolean => {
  return mediaType === 'video' || mediaType.startsWith('video/');
};

/**
 * Gets the appropriate thumbnail URL for a media item
 * For videos: returns the derived thumbnail URL
 * For images: returns the original URL
 * @param mediaUrl - The media URL
 * @param mediaType - The media type
 * @returns The thumbnail URL to display
 */
export const getMediaThumbnailUrl = (mediaUrl: string, mediaType: string): string => {
  return isVideoType(mediaType) ? getVideoThumbnailUrl(mediaUrl) : mediaUrl;
};