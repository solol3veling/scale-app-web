import { FC } from 'react';
import { MediaItem } from '@/types/api';
import { User } from '@supabase/supabase-js';
import { MediaGrid } from './MediaGrid';
import { MapPin } from 'lucide-react';

interface FacebookMarketplacePreviewProps {
  postContent: string;
  uploadedMedia: MediaItem[];
  user: User | null;
}

export const FacebookMarketplacePreview: FC<FacebookMarketplacePreviewProps> = ({ postContent, uploadedMedia, user }) => {
  const userName = user?.user_metadata?.full_name || "Your Name";
  const avatarUrl = user?.user_metadata?.avatar_url || "https://via.placeholder.com/32";

  // Placeholder data for Marketplace item
  const itemPrice = "$[Price]";
  const itemTitle = "[Item Title]";
  const itemLocation = "[Location]";

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden max-w-md mx-auto font-sans text-gray-900 dark:text-gray-100">
      {/* Product Image(s) */}
      {uploadedMedia.length > 0 && (
        <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <MediaGrid mediaItems={uploadedMedia} aspectRatio="aspect-square" />
        </div>
      )}

      {/* Item Details */}
      <div className="p-3">
        <h4 className="text-xl font-bold mb-1">{itemPrice}</h4>
        <h3 className="text-lg font-semibold mb-2">{itemTitle}</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3">{postContent || "[Item Description]"}</p>
        
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{itemLocation}</span>
        </div>

        {/* Seller Info */}
        <div className="flex items-center border-t border-gray-200 dark:border-gray-700 pt-3">
          <img src={avatarUrl} alt="Seller Avatar" className="w-8 h-8 rounded-full mr-2" />
          <p className="font-semibold text-sm">{userName}</p>
        </div>
      </div>

      {/* Action Buttons (Optional) */}
      <div className="flex border-t border-gray-200 dark:border-gray-700">
        <button className="flex-1 py-2 text-blue-600 dark:text-blue-400 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          Message
        </button>
        <button className="flex-1 py-2 text-blue-600 dark:text-blue-400 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-l border-gray-200 dark:border-gray-700">
          Make Offer
        </button>
      </div>
    </div>
  );
};