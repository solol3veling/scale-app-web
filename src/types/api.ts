// API Types generated from OpenAPI schema

// Enums
export enum Platform {
    FACEBOOK = 'FACEBOOK',
    TWITTER = 'TWITTER',
    INSTAGRAM = 'INSTAGRAM',
    LINKEDIN = 'LINKEDIN',
    GOOGLE = 'GOOGLE'
}

export enum PostStatus {
    DRAFT = 'DRAFT',
    SCHEDULED = 'SCHEDULED',
    PUBLISHING = 'PUBLISHING',
    PUBLISHED = 'PUBLISHED',
    FAILED = 'FAILED'
}

export enum SocialAccountStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    PENDING = 'PENDING'
}

export enum PublishingEventStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}

export enum PlanType {
    FREE = 'FREE',
    PRO = 'PRO',
    ENTERPRISE = 'ENTERPRISE'
}

export enum SubscriptionStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    PENDING = 'PENDING'
}

export enum PlanStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    PENDING = 'PENDING',
    PAYMENT_PENDING = 'PAYMENT_PENDING',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
    PENDING_CANCELLATION = 'PENDING_CANCELLATION',
    CANCELLED = 'CANCELLED'
}

// OpenAPI Plan Details
export interface PlanDetails {
    name: string;
    description?: string;
    price: string;
}

// Dynamic Plan from backend (legacy)
export interface Plan {
    name: string;
    type: PlanType;
    description: string;
    price: number;
    currency: string;
    features: string; // Semicolon-separated features from backend
    upgradeUrl: string;
}

export interface PlansResponse {
    data: PlanDetails[];
}

export interface LegacyPlansResponse {
    data: Plan[];
}

// Base Types
export interface MediaItem {
    url: string;
    type: string;
    thumbnailUrl?: string; // For video thumbnails
    file?: File; // Added for client-side validation
}

export interface Engagement {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
}

export interface SocialAccount {
    id: string;
    platform: Platform;
    handle: string;
    displayName: string;
    followers: string | null;
    status: SocialAccountStatus;
    color: string | null;
    tags: string[];
    lastPost?: string | null;
    profileImage?: string;
    userId: string;
    isConnected: boolean;
    isFullyConnected: boolean;
    pageId?: string | null;
    // Deprecated fields - keeping for backward compatibility but marking as optional
    accessToken?: string;
    refreshToken?: string;
    consumerKey?: string;
    consumerSecret?: string;
    connected?: boolean;
}

export interface SocialAccountResponse {
    id: string;
    platform: Platform;
    handle: string;
    displayName: string;
    followers: string | null;
    status: SocialAccountStatus;
    color: string | null;
    tags: string[];
    lastPost?: string | null;
    profileImage?: string;
    isConnected: boolean;
    isFullyConnected: boolean;
    pageId?: string | null;
    userId: string;
}

export interface Post {
    id: string;
    content: string;
    media: MediaItem[];
    scheduledFor?: string;
    publishedAt?: string;
    status: PostStatus;
    accounts: SocialAccount[];
    createdAt: string;
    updatedAt: string;
    userId: string;
    displayDate?: string; // New field for calendar display
    events?: PublishingEventResponse[]; // Publishing events for draft posts
}

export interface PublishingEventResponse {
    id: string;
    postId: string;
    socialAccount: SocialAccountResponse;
    platform: Platform;
    status: PublishingEventStatus;
    scheduledFor: string; // When the event is scheduled to run
    errorMessage?: string;
    responseMetadata?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PlatformBreakdown {
    platform: Platform;
    reach: number;
    engagement: number;
    posts: number;
}

export interface TimeSeriesData {
    date: string;
    reach: number;
    engagement: number;
    posts: number;
    likes?: number;
    shares?: number;
    comments?: number;
    views?: number;
    impressions?: number;
    totalEngagement?: number;
}

// Enhanced analytics response structure
export interface EnhancedAnalyticsData {
    dateRange: string;
    overallMetrics: {
        totalPosts: number;
        totalLikes: number;
        totalShares: number;
        totalComments: number;
        totalViews: number;
        totalImpressions: number;
        totalEngagement: number;
        engagementRate: number;
        averageEngagementPerPost: number;
    };
    platformBreakdown: {
        platform: Platform;
        posts: number;
        likes: number;
        shares: number;
        comments: number;
        views: number;
        impressions: number;
        totalEngagement: number;
        engagementRate: number;
    }[];
    timeSeriesData: TimeSeriesData[];
    topPostsByEngagement: PostAnalytics[];
    topPostsByReach: PostAnalytics[];
    recentPosts: PostAnalytics[];
}

// Platform-specific analytics
export interface PlatformAnalyticsData {
    platform: Platform;
    dateRange: string;
    overallMetrics: {
        totalPosts: number;
        totalLikes: number;
        totalShares: number;
        totalComments: number;
        totalViews: number;
        totalImpressions: number;
        totalEngagement: number;
        engagementRate: number;
        averageEngagementPerPost: number;
    };
    timeSeriesData: TimeSeriesData[];
    topPosts: PostAnalytics[];
    recentPosts: PostAnalytics[];
}

// Post analytics from API
export interface PostAnalytics {
    postId: string;
    content: string;
    platform: string;
    publishedAt: string;
    engagement: {
        likes: number;
        shares: number;
        comments: number;
        views: number;
        impressions: number;
        totalEngagement: number;
        lastFetched: string;
    };
}

// Engagement Analytics Types
export interface EngagementOverallMetrics {
    totalPostsWithEngagement: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
    totalImpressions: number;
    totalEngagement: number;
    avgEngagementRate: number;
    avgLikesPerPost: number;
    avgSharesPerPost: number;
    avgCommentsPerPost: number;
    bestPerformingPlatform: string;
    mostEngagedContentType: string;
}

export interface HashtagPerformance {
    hashtag: string;
    useCount: number;
    avgEngagement: number;
    engagementScore: number;
}

export interface ContentInsights {
    mediaPerformance: {
        imagePostsAvgEngagement: number;
        videoPostsAvgEngagement: number;
        mixedMediaAvgEngagement: number;
        textOnlyAvgEngagement: number;
        bestPerformingMediaType: string;
        mediaVsTextEngagementRatio: number;
    };
    hashtagPerformance: {
        avgEngagementWithHashtags: number;
        avgEngagementWithoutHashtags: number;
        optimalHashtagCount: number;
        topPerformingHashtags: HashtagPerformance[];
        hashtagEngagementMultiplier: number;
    };
    lengthPerformance: {
        lengthRangeEngagement: Record<string, number>;
        optimalContentLength: number;
        shortVsLongEngagementRatio: number;
    };
    timingPerformance: {
        hourEngagement: Record<string, number>;
        dayEngagement: Record<string, number>;
        bestPostingHour: string;
        bestPostingDay: string;
        timingEngagementVariance: number;
    };
}

export interface TopPerformingPost {
    postId: string;
    contentPreview: string;
    platformCount: number;
    publishedAt: string;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
    totalImpressions: number;
    totalEngagement: number;
    engagementRate: number;
    platformBreakdown: {
        platform: Platform;
        likes: number;
        shares: number;
        comments: number;
        impressions: number;
        engagementRate: number;
    }[];
    hashtagCount: number;
    hasMedia: boolean;
    mediaTypes: string;
}

export interface EngagementTrends {
    engagementGrowthRate: number;
    trendDirection: string;
    insights: string[];
    consistencyScore: number;
    recommendedPostingStrategy: string;
}

export interface EngagementAnalyticsData {
    period: string;
    overallMetrics: EngagementOverallMetrics;
    platformBreakdown: {
        platform: Platform;
        posts: number;
        likes: number;
        shares: number;
        comments: number;
        views: number;
        impressions: number;
        totalEngagement: number;
        engagementRate: number;
    }[];
    timeSeriesData: TimeSeriesData[];
    contentInsights: ContentInsights;
    topPerformingPosts: TopPerformingPost[];
    trends: EngagementTrends;
}

// Content Analytics Types
export interface ContentOverallMetrics {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    scheduledPosts: number;
    publishingSuccessRate: number;
    avgContentLength: number;
    totalPlatformPosts: number;
    avgPostsPerDay: number;
    totalHashtags: number;
    totalMentions: number;
}

export interface ContentPlatformBreakdown {
    platform: Platform;
    totalPosts: number;
    successfulPosts: number;
    failedPosts: number;
    successRate: number;
    avgContentLength: number;
    postsWithMedia: number;
    totalHashtags: number;
    mostUsedHashtag: string;
}

export interface ContentComposition {
    postsWithImages: number;
    postsWithVideos: number;
    postsWithBoth: number;
    textOnlyPosts: number;
    mediaUsageRate: number;
    mediaTypeDistribution: Record<string, number>;
    avgHashtagsPerPost: number;
    avgMentionsPerPost: number;
    topHashtags: string[];
    topMentions: string[];
}

export interface PublishingBehavior {
    multiPlatformPosts: number;
    multiPlatformRate: number;
    immediatePublishPosts: number;
    scheduledPublishPosts: number;
    schedulingRate: number;
    postingTimeDistribution: Record<string, number>;
    postingDayDistribution: Record<string, number>;
    avgSchedulingLeadTimeHours: number;
    consistencyScore: number;
}

export interface TopContent {
    postId: string;
    contentPreview: string;
    platformCount: number;
    createdAt: string;
    hashtagCount: number;
    mentionCount: number;
    hasMedia: boolean;
    mediaTypes: string;
    engagementData: {
        totalLikes: number;
        totalShares: number;
        totalComments: number;
        totalImpressions: number;
        totalEngagement: number;
        avgEngagementRate: number;
        hasEngagementData: boolean;
    };
}

export interface ContentAnalyticsData {
    period: string;
    overallMetrics: ContentOverallMetrics;
    platformBreakdown: ContentPlatformBreakdown[];
    publishingActivity: TimeSeriesData[];
    contentComposition: ContentComposition;
    publishingBehavior: PublishingBehavior;
    topContent: TopContent[];
}

// Refresh Response Types
export interface RefreshEngagementResponse {
    id: string;
    postId: string;
    socialAccountId: string;
    platform: Platform;
    status: string;
    externalPostId: string;
    errorMessage: string;
    responseMetadata: string;
    createdAt: string;
    updatedAt: string;
}

// Enhanced Analytics Data with comprehensive metrics
export interface AnalyticsData {
    dateRange: string;
    totalPosts: number;
    totalPublishedPosts: number;
    totalScheduledPosts: number;
    totalDraftPosts: number;
    totalReach: number;
    totalEngagement: number;
    engagementRate: number;
    publishingStats: {
        totalPublishingEvents: number;
        successfulPublishes: number;
        failedPublishes: number;
        successRate: number;
        mostFailedPlatform: string;
        mostSuccessfulPlatform: string;
    };
    platformRankings: {
        platform: string;
        totalPosts: number;
        rank: number;
        percentage: number;
        reach: number;
        engagement: number;
        successfulPublishes: number;
        failedPublishes: number;
        successRate: number;
    }[];
    timeSeriesData: TimeSeriesData[];
    topPosts: Post[];
    mostActiveplatform: string;
    performance: {
        bestPerformingPost: Post;
        averageEngagementPerPost: number;
        averageEngagementRate: number;
    };
    postingTimeAnalysis: {
        topPostingTimes: {
            timeLabel: string;
            postCount: number;
            averageEngagement: number;
        }[];
        hourlyBreakdown: {
            hour: number;
            postCount: number;
            percentage: number;
        }[];
        dailyBreakdown: {
            dayOfWeek: string;
            postCount: number;
            percentage: number;
        }[];
        peakPostingHour: string;
        peakPostingDay: string;
    };
    schedulingAnalysis: {
        totalScheduledPosts: number;
        currentlyScheduled: number;
        publishedFromScheduled: number;
        schedulingRate: number;
        scheduledToPublishedRate: number;
        monthlyTrends: {
            month: string;
            scheduledCount: number;
            publishedCount: number;
            conversionRate: number;
        }[];
    };
    engagementAnalysis: {
        totalLikes: number;
        totalComments: number;
        totalShares: number;
        totalViews: number;
        totalSaves: number;
        averageLikesPerPost: number;
        averageCommentsPerPost: number;
        averageSharesPerPost: number;
        mostLikedPost: Post;
        mostCommentedPost: Post;
        mostSharedPost: Post;
        trends: {
            period: string;
            totalEngagement: number;
            engagementRate: number;
            posts: number;
        }[];
    };
}

// New comprehensive analytics overview
export interface AnalyticsOverview {
    dateRange: string;
    lastUpdated: string;
    totalPosts: number;
    totalEngagements: number;
    totalReach: number;
    totalImpressions: number;
    engagementRate: number;
    clickThroughRate: number;
    audienceGrowth: {
        current: number;
        previous: number;
        growthRate: number;
        trend: string;
    };
    engagementGrowth: {
        current: number;
        previous: number;
        growthRate: number;
        trend: string;
    };
    topPerformingPlatform: {
        name: string;
        type: string;
        engagements: number;
        engagementRate: number;
    };
    topPerformingAccount: {
        name: string;
        type: string;
        engagements: number;
        engagementRate: number;
    };
    topPerformingPost: {
        id: string;
        content: string;
        mediaType: string;
        totalEngagements: number;
        engagementRate: number;
        postedAt: string;
    };
    keyInsights: string[];
}

// Posts analytics with advanced filtering
export interface PostsAnalyticsData {
    posts: AnalyticsPost[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    summaryStats: {
        totalPosts: number;
        totalEngagements: number;
        averageEngagementRate: number;
        topMediaType: string;
        topPlatform: string;
    };
    availableFilters: {
        [key: string]: string[];
    };
}

export interface AnalyticsPost {
    postId: string;
    content: string;
    mediaType: string;
    platforms: string[];
    accounts: string[];
    postedAt: string;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalReach: number;
    totalImpressions: number;
    totalClicks: number;
    totalViews: number;
    totalSaves: number;
    engagementRate: number;
    clickThroughRate: number;
    hashtags: string[];
    characterCount: number;
    bestPerformingPlatform: string;
    performanceScore: number;
    dayOfWeek: string;
    hourOfDay: number;
    scheduled: boolean;
}

// Content insights analytics
export interface ContentInsights {
    dateRange: string;
    mediaTypePerformance: {
        mediaType: string;
        postCount: number;
        averageEngagementRate: number;
        totalEngagements: number;
        shareOfContent: number;
    }[];
    topHashtags: {
        hashtag: string;
        usageCount: number;
        averageEngagementRate: number;
        totalEngagements: number;
    }[];
    hashtagEngagementMap: Record<string, number>;
    bestPostingTimes: {
        dayOfWeek: string;
        timeOfDay: {
            hour: number;
            minute: number;
            second: number;
            nano: number;
        };
        averageEngagementRate: number;
        postCount: number;
    }[];
    dayOfWeekPerformance: Record<string, number>;
    hourOfDayPerformance: Record<string, number>;
    characterCountAnalysis: {
        lengthRanges: Record<string, number>;
        optimalLength: number;
        optimalEngagementRate: number;
    };
    hashtagCountVsEngagement: {
        correlationCoefficient: number;
        interpretation: string;
        recommendation: string;
    };
    postFrequencyVsEngagement: {
        correlationCoefficient: number;
        interpretation: string;
        recommendation: string;
    };
    recommendations: string[];
}

// Post-specific analytics
export interface PostSpecificAnalytics {
    postId: string;
    content: string;
    status: PostStatus;
    createdAt: string;
    publishedAt?: string;
    scheduledFor?: string;
    mediaType: string;
    characterCount: number;
    hashtags: string[];
    platformData: {
        platform: Platform;
        externalPostId?: string;
        publishingStatus: string;
        publishedAt?: string;
        errorMessage?: string;
        accountHandle: string;
    }[];
    publishingSummary: {
        totalPlatforms: number;
        successfulPublishes: number;
        failedPublishes: number;
        pendingPublishes: number;
        successRate: number;
        successfulPlatforms: string[];
        failedPlatforms: string[];
    };
    overallEngagement: {
        totalLikes: number;
        totalComments: number;
        totalShares: number;
        totalViews: number;
        totalReach: number;
        totalImpressions: number;
        totalClicks: number;
        totalSaves: number;
        totalEngagement: number;
        overallEngagementRate: number;
        averageEngagementPerPlatform: number;
    };
    platformEngagements: {
        platform: Platform;
        likes: number;
        comments: number;
        shares: number;
        views: number;
        reach: number;
        impressions: number;
        clicks: number;
        saves: number;
        totalEngagement: number;
        engagementRate: number;
        lastFetched: string;
        rankAmongPlatforms: string;
    }[];
    performance: {
        performanceRating: string;
        performanceScore: number;
        bestPerformingPlatform: string;
        worstPerformingPlatform: string;
        isTopPerformer: boolean;
        rankAmongAllPosts: number;
        engagementGrowthRate: number;
        insights: string[];
    };
    comparison: {
        vsAverageEngagement: number;
        vsAverageReach: number;
        comparisonSummary: string;
        isAboveAverage: boolean;
        betterThanXPosts: number;
        similarPosts: {
            postId: string;
            content: string;
            totalEngagement: number;
            similarity: string;
        }[];
    };
}

export interface OverviewStats {
    totalPosts: number;
    totalReach: number;
    totalEngagement: number;
    activeAccounts: number;
    scheduledPosts: number;
    recentPosts: Post[];
    topPerformingPost?: Post;
    engagementRate: number;
    growthRate: number;
}

// OpenAPI UserPlan (new secure schema - omits all sensitive data)
export interface UserPlan {
    id: string;
    userId: string;
    email: string;
    planType: PlanType;
    status: SubscriptionStatus;
    subscriptionEndDate?: string | null;
    createdAt: string;
    updatedAt: string;
}

// Legacy UserBilling (keep for backward compatibility)
export interface UserBilling {
    id: string;
    userId: string;
    email: string;
    planType: PlanType;
    status: PlanStatus;
    paystackCustomerId?: string;
    subscriptionId?: string;
    createdAt: string;
    updatedAt: string;
    // Keep legacy fields for backward compatibility
    subscriptionStatus?: SubscriptionStatus;
    paystackCustomerCode?: string;
    postsThisMonth?: number;
}

export interface UpgradeResponse {
    authorization_url?: string;
    message: string;
}

export interface SubscriptionManagementResponse {
    management_url: string;
    message: string;
}

export interface AuthInit {
    authorization_url: string,
    message: string
}

export interface UserBillingResponse {
    data: UserBilling;
}

export interface UserPlanResponse {
    data: UserPlan;
}

export interface UpdateUserBillingRequest {
    email?: string;
}

// Request Types
export interface CreatePostData {
    content: string;
    media: MediaItem[];
    scheduledFor?: string;
    accountIds: string[];
}

export interface UpdateSocialAccountRequest {
    displayName?: string;
    color?: string;
    tags?: string[];
}

export interface AccountSummary {
    active: number;
    pending: number;
    inactive: number;
    total: number;
}

export interface GetSocialAccountsParams {
    searchTerm?: string;
    status?: SocialAccountStatus;
    platform?: Platform;
    pageable: Pageable;
}

export interface ExtendPostRequest {
    postId: string;
    socialAccountIds: string[];
}

export interface Pageable {
    page: number;
    size: number;
    sort?: string[];
}

// Response Wrappers
export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
    errors?: string[];
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// Specific API Response Types
export type ApiResponseSocialAccount = ApiResponse<SocialAccount>;
export type ApiResponseListSocialAccount = ApiResponse<SocialAccount[]>;
export type ApiResponsePost = ApiResponse<Post>;
export type ApiResponseListPublishingEventResponse = ApiResponse<PublishingEventResponse[]>;
export type ApiResponsePublishingEventResponse = ApiResponse<PublishingEventResponse>;
export type ApiResponseAnalyticsData = ApiResponse<AnalyticsData>;
export type ApiResponseEnhancedAnalyticsData = ApiResponse<EnhancedAnalyticsData>;
export type ApiResponsePlatformAnalyticsData = ApiResponse<PlatformAnalyticsData>;
export type ApiResponseEngagementAnalyticsData = ApiResponse<EngagementAnalyticsData>;
export type ApiResponseContentAnalyticsData = ApiResponse<ContentAnalyticsData>;
export type ApiResponseRefreshEngagement = ApiResponse<RefreshEngagementResponse>;
export type ApiResponseRefreshGeneric = ApiResponse<Record<string, any>>;
export type ApiResponseOverviewStats = ApiResponse<OverviewStats>;
export type ApiResponseObject = ApiResponse<any>;
export type ApiResponseVoid = ApiResponse<void>;
export type PaginatedResponsePost = PaginatedResponse<Post>;
export type PaginatedResponseSocialAccount = PaginatedResponse<SocialAccount>;

// Query Parameters
export interface GetPostsParams {
    searchTerm?: string;
    status?: PostStatus;
    pageable: Pageable;
}

export interface OAuthInitParams {
    platform: string;
    account: string;
}

export interface OAuthInitResponse {
    redirectUri: string;
    oauth1_state: string;
}

export interface OAuthCallbackParams {
    oauth_verifier: string;
    oauth_request_token?: string;
}

// Page Selection Types
export interface PageInfo {
    id: string;
    name: string;
    category?: string;
    accessToken: string;
    pictureUrl?: string;
    followersCount?: number;
    description?: string;
}

export interface PageSelectionData {
    pages: PageInfo[];
    userInfo: {
        id: string;
        name: string;
        username?: string;
        profilePicture?: string;
    };
}

export interface OAuth2CallbackResponse {
    success: boolean;
    requiresPageSelection?: boolean;
    tempData?: string; // encrypted OAuth tokens + user info
    accountId?: string; // if direct creation
    platform?: Platform;
    userInfo?: {
        id: string;
        name: string;
        username?: string;
        profilePicture?: string;
    };
}

export interface CompleteWithPageRequest {
    tempData: string;
    selectedPageId: string;
    accountName: string;
}

// Calendar API Types
export interface CalendarPostsParams {
    startDate: string; // ISO date string
    endDate: string;   // ISO date string
    dateType?: 'created' | 'scheduled' | 'published';
}

export type ApiResponseCalendarPosts = ApiResponse<Post[]>;
