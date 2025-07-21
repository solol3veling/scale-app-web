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
    followers: string;
    status: SocialAccountStatus;
    color: string;
    tags: string[];
    lastPost?: string;
    profileImage?: string;
    accessToken?: string;
    refreshToken?: string;
    consumerKey?: string;
    consumerSecret?: string;
    userId: string;
    connected: boolean;
}

export interface SocialAccountResponse {
    id: string;
    platform: Platform;
    handle: string;
    displayName: string;
    followers: string;
    status: SocialAccountStatus;
    color: string;
    tags: string[];
    lastPost?: string;
    profileImage?: string;
    isConnected: boolean;
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
    engagement?: Engagement;
    createdAt: string;
    updatedAt: string;
    userId: string;
}

export interface PublishingEventResponse {
    id: string;
    postId: string;
    socialAccount: SocialAccountResponse;
    platform: Platform;
    status: PublishingEventStatus;
    errorMessage?: string;
    responseMetadata?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PlatformBreakdown {
    platform: string;
    reach: number;
    engagement: number;
    posts: number;
}

export interface TimeSeriesData {
    date: string;
    reach: number;
    engagement: number;
    posts: number;
}

export interface AnalyticsData {
    dateRange: string;
    totalReach: number;
    totalEngagement: number;
    engagementRate: number;
    platformBreakdown: PlatformBreakdown[];
    timeSeriesData: TimeSeriesData[];
    topPosts: Post[];
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

// OpenAPI UserPlan (new schema)
export interface UserPlan {
    userId: string;
    email?: string | null;
    planType: PlanType;
    status: SubscriptionStatus;
    paystackCustomerId?: string | null;
    subscriptionId?: string | null;
    reference?: string | null;
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

// Calendar API Types
export interface CalendarPostsParams {
    startDate: string; // ISO date string
    endDate: string;   // ISO date string
    dateType?: 'created' | 'scheduled';
}

export type ApiResponseCalendarPosts = ApiResponse<Post[]>;
