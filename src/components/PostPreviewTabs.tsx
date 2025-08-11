import { FC } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TwitterPreview } from './previews/TwitterPreview';
import { InstagramPreview } from './previews/InstagramPreview';
import { FacebookPreview } from './previews/FacebookPreview';
import { FacebookMarketplacePreview } from './previews/FacebookMarketplacePreview';
import { MediaItem } from '@/types/api';

import { useAuth } from '@/hooks/useAuth';

interface PostPreviewTabsProps {
  postContent: string;
  uploadedMedia: MediaItem[];
}

type Platform = 'Twitter' | 'Instagram' | 'Facebook' | 'FacebookMarketplace';

const platformConfig = [
  { id: 'twitter', name: 'Twitter', Component: TwitterPreview },
  { id: 'instagram', name: 'Instagram', Component: InstagramPreview },
  { id: 'facebook', name: 'Facebook', Component: FacebookPreview },
  { id: 'facebook-marketplace', name: 'FB Marketplace', Component: FacebookMarketplacePreview },
];

export const PostPreviewTabs: FC<PostPreviewTabsProps> = ({ postContent, uploadedMedia }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Post Previews</h2>
        <Tabs defaultValue={platformConfig[0].id} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
            {platformConfig.map((platform) => (
            <TabsTrigger key={platform.id} value={platform.id}>
                {platform.name}
            </TabsTrigger>
            ))}
        </TabsList>

        {platformConfig.map((platform) => (
            <TabsContent key={platform.id} value={platform.id}>
            <div className="mt-4">
                <platform.Component 
                  postContent={postContent} 
                  uploadedMedia={uploadedMedia} 
                  user={user} 
                />
            </div>
            </TabsContent>
        ))}
        </Tabs>
    </div>
  );
};