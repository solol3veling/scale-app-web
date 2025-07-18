import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ImageIcon, 
  Video, 
  X, 
  Upload, 
  AlertCircle, 
  CheckCircle2,
  Loader2 
} from "lucide-react";
import { MediaUploadItem } from '@/hooks/useMediaUpload';

interface MediaUploadProps {
  mediaItems: MediaUploadItem[];
  onFileUpload: (files: File[]) => void;
  onRemoveItem: (id: string) => void;
  isUploading?: boolean;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  mediaItems,
  onFileUpload,
  onRemoveItem,
  isUploading = false,
}) => {
  const [previewItem, setPreviewItem] = useState<MediaUploadItem | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      onFileUpload(Array.from(files));
    }
    // Reset input value to allow uploading the same file again
    event.target.value = '';
  };

  const handleMediaClick = (item: MediaUploadItem) => {
    if (item.uploadState.progress === 100 && !item.uploadState.error) {
      setPreviewItem(item);
    }
  };


  return (
    <div className="space-y-3">
      {/* Media Items - Slack-like inline thumbnails */}
      {mediaItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {mediaItems.map((item) => (
            <div key={item.id} className="relative group">
              <div 
                className="relative overflow-hidden rounded-md border border-border bg-muted cursor-pointer"
                onClick={() => handleMediaClick(item)}
              >
                {/* Media Preview */}
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={`Upload ${item.id}`}
                    className="w-16 h-16 object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted flex items-center justify-center">
                    <Video className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                
                {/* Upload Progress Overlay */}
                {item.uploadState.isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  </div>
                )}
                
                {/* Error Overlay */}
                {item.uploadState.error && (
                  <div className="absolute inset-0 bg-destructive/80 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-white" />
                  </div>
                )}
                
                {/* Success Indicator */}
                {item.uploadState.progress === 100 && !item.uploadState.error && (
                  <div className="absolute top-1 right-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500 bg-white rounded-full" />
                  </div>
                )}
                
                {/* Progress Bar */}
                {item.uploadState.isUploading && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${item.uploadState.progress}%` }}
                    />
                  </div>
                )}
              </div>
              
              {/* Remove Button - Fixed positioning */}
              <Button
                variant="secondary"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 hover:bg-gray-900 border-2 border-white shadow-md z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveItem(item.id);
                }}
              >
                <X className="h-3 w-3 text-white" />
              </Button>
              
              {/* Error tooltip on hover */}
              {item.uploadState.error && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-destructive text-destructive-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                  {item.uploadState.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button - More subtle, inline with content */}
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative text-muted-foreground hover:text-foreground h-8 px-3"
          disabled={isUploading}
        >
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          {isUploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4 mr-2" />
          )}
          Attach files
        </Button>
        
        {mediaItems.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {mediaItems.filter(item => item.uploadState.progress === 100).length}/{mediaItems.length} uploaded
          </span>
        )}
      </div>

      {/* Media Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Media Preview</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center">
            {previewItem && previewItem.type === 'image' ? (
              <img
                src={previewItem.url}
                alt="Preview"
                className="max-w-full max-h-[70vh] object-contain"
              />
            ) : previewItem && previewItem.type === 'video' ? (
              <video
                src={previewItem.url}
                controls
                className="max-w-full max-h-[70vh]"
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};