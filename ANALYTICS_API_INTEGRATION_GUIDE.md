# Analytics API Integration Guide

## 📊 Complete Analytics API Documentation for Frontend Integration

This guide provides comprehensive information for integrating with the ScaleApp Analytics API, including all endpoints, data models, request/response formats, and export functionality.

## 🚀 Base URL
```
/api/v1/analytics
```

## 📋 Table of Contents
- [Authentication](#authentication)
- [Date Range Handling](#date-range-handling)
- [Platform Enums](#platform-enums)
- [Overview Analytics](#overview-analytics)
- [Platform-Specific Analytics](#platform-specific-analytics)
- [Post-Specific Analytics](#post-specific-analytics)
- [Export Functionality](#export-functionality)
- [Error Handling](#error-handling)
- [Frontend Implementation Examples](#frontend-implementation-examples)

---

## 🔐 Authentication

All analytics endpoints require authentication via JWT token in the Authorization header:
```http
Authorization: Bearer {jwt_token}
```

---

## 📅 Date Range Handling

### DateRangeRequest Model
```typescript
interface DateRangeRequest {
  presetRange?: string;      // "7d" | "30d" | "90d" | "365d"
  startDate?: string;        // ISO 8601 format: "2024-01-01T00:00:00"
  endDate?: string;          // ISO 8601 format: "2024-01-31T23:59:59"
}
```

### Preset Ranges
- `"7d"` - Last 7 days
- `"30d"` - Last 30 days (default)
- `"90d"` - Last 90 days  
- `"365d"` - Last year

### Custom Date Range
For custom ranges, use both `startDate` and `endDate` with ISO 8601 format.

**Validation Rules:**
- Custom range: `startDate` must be before `endDate`
- `endDate` cannot be in the future
- `startDate` cannot be more than 2 years ago

---

## 🌐 Platform Enums

```typescript
enum Platform {
  FACEBOOK = "FACEBOOK",
  INSTAGRAM = "INSTAGRAM", 
  TWITTER = "TWITTER",
  LINKEDIN = "LINKEDIN",
  YOUTUBE = "YOUTUBE",
  PINTEREST = "PINTEREST"
}
```

---

## 📊 Overview Analytics

### GET /overview
Simple overview with preset date range.

**Request:**
```http
GET /api/v1/analytics/overview?dateRange=30d
```

**Response:**
```typescript
interface AnalyticsOverview {
  generalStats: {
    totalPosts: number;
    scheduledPosts: number;
    draftedPosts: number;
    publishedPosts: number;
    totalEngagements: number;
    publishingSuccessRate: number;  // percentage
    topPlatform: Platform;
    topPlatformPosts: number;
  };
  platformRankings: Array<{
    platform: Platform;
    totalPosts: number;
    totalEngagements: number;
    successRate: number;           // percentage
    avgLikesPerPost: number;
    avgCommentsPerPost: number;
    avgSharesPerPost: number;
  }>;
  engagementTimeSeries: Array<{
    timestamp: string;             // ISO 8601
    platform: Platform;
    engagements: number;
    successRate: number;           // percentage
  }>;
  engagementBreakdown: {
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalViews: number;
    totalSaves: number;
    percentages: {
      likes: number;               // percentage
      comments: number;
      shares: number;
      views: number;
      saves: number;
    };
  };
  postTimeAnalysis: {
    hourlyDistribution: Record<number, number>;  // hour (0-23) -> post count
    dayOfWeekDistribution: Record<string, number>; // day name -> post count
    peakPerformanceTime: string;   // ISO 8601
    mostPostTime: string;          // ISO 8601
    schedulingRate: number;        // percentage
  };
  topPerformingPosts: Array<{
    post: Post;                    // Full post object
    totalEngagements: number;
    engagementRate: number;
    platform: Platform;
  }>;
  performanceMetrics: {
    avgLikesPerPost: number;
    avgCommentsPerPost: number;
    avgSharesPerPost: number;
    avgViewsPerPost: number;
    avgSavesPerPost: number;
    overallEngagementRate: number;
  };
  bestTimeToPost: {
    bestHour: number;              // 0-23
    bestDayOfWeek: string;         // "Monday", "Tuesday", etc.
    successRateAtBestTime: number; // percentage
    hourlySuccessRates: Record<number, number>;
    dailySuccessRates: Record<string, number>;
  };
}
```

### POST /overview
Advanced overview with custom date ranges.

**Request:**
```http
POST /api/v1/analytics/overview
Content-Type: application/json

{
  "presetRange": "30d"
}
```

**Or with custom range:**
```json
{
  "startDate": "2024-01-01T00:00:00",
  "endDate": "2024-01-31T23:59:59"
}
```

**Response:** Same as GET /overview

---

## 🎯 Platform-Specific Analytics

### GET /platform/{platform}/overview
Simple platform analytics with preset date range.

**Request:**
```http
GET /api/v1/analytics/platform/INSTAGRAM/overview?dateRange=30d
```

### POST /platform/{platform}/overview
Advanced platform analytics with custom date ranges.

**Request:**
```http
POST /api/v1/analytics/platform/INSTAGRAM/overview
Content-Type: application/json

{
  "presetRange": "90d"
}
```

**Response:**
```typescript
interface PlatformAnalyticsOverview {
  platform: Platform;
  dateRange: string;             // Human readable: "Last 30 days"
  startDate: string;             // ISO 8601
  endDate: string;               // ISO 8601
  platformStats: {
    totalPosts: number;
    publishedPosts: number;
    failedPosts: number;
    scheduledPosts: number;
    successRate: number;          // percentage
    totalEngagements: number;
    avgEngagementPerPost: number;
    avgLikesPerPost: number;
    avgCommentsPerPost: number;
    avgSharesPerPost: number;
    avgViewsPerPost: number;
    avgSavesPerPost: number;
  };
  engagementTimeSeries: Array<{
    timestamp: string;            // ISO 8601, daily aggregation
    engagements: number;
    successRate: number;          // percentage
    postsPublished: number;
  }>;
  topPosts: Array<{
    post: Post;                   // Full post object
    totalEngagements: number;
    engagementRate: number;
    publishedAt: string;          // ISO 8601
  }>;
  mostFailedPosts: Array<{
    post: Post;                   // Full post object
    errorMessage: string;
    failedAt: string;             // ISO 8601
    retryCount: number;
  }>;
  bestTimeAnalysis: {
    bestHourToPost: number;       // 0-23
    bestDayToPost: string;        // "Monday", etc.
    bestTimeSuccessRate: number;  // percentage
    hourlySuccessRates: Array<{
      hour: number;               // 0-23
      successRate: number;        // percentage
      totalPosts: number;
      successfulPosts: number;
    }>;
    dailySuccessRates: Array<{
      dayName: string;            // "Monday", etc.
      successRate: number;        // percentage
      totalPosts: number;
      successfulPosts: number;
    }>;
    mostSuccessfulPostTime: string; // ISO 8601
    peakEngagementTime: string;   // ISO 8601
  };
  engagementBreakdown: {
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalViews: number;
    totalSaves: number;
    percentages: Record<string, number>; // engagement type -> percentage
  };
  performanceComparison: {
    platformSuccessRate: number;  // percentage
    overallAverageSuccessRate: number; // percentage
    isAboveAverage: boolean;
    engagementRankAmongPlatforms: number; // percentage ranking
    performanceLevel: string;     // "Excellent" | "Good" | "Average" | "Poor"
  };
}
```

---

## 📝 Post-Specific Analytics

### GET /post/{postId}/overview
Individual post analytics.

**Request:**
```http
GET /api/v1/analytics/post/550e8400-e29b-41d4-a716-446655440000/overview
```

**Response:**
```typescript
interface PostAnalyticsOverview {
  post: Post;                     // Full post object
  postStats: {
    totalEngagements: number;
    overallEngagementRate: number;
    totalPlatformsPublished: number;
    successfulPublications: number;
    failedPublications: number;
    publishingSuccessRate: number; // percentage
    firstPublishedAt: string;      // ISO 8601
    lastEngagementUpdate: string;  // ISO 8601
    isScheduled: boolean;
    scheduledFor: string;          // ISO 8601
  };
  platformPerformances: Array<{
    platform: Platform;
    published: boolean;
    publishingSuccessful: boolean;
    publishingStatus: string;      // "success" | "failed" | "pending"
    errorMessage: string;
    publishedAt: string;           // ISO 8601
    likes: number;
    comments: number;
    shares: number;
    views: number;
    saves: number;
    totalEngagements: number;
    engagementRate: number;
    platformRanking: number;       // 0-100 percentile
  }>;
  engagementHistory: Array<{
    timestamp: string;             // ISO 8601
    platform: Platform;
    likes: number;
    comments: number;
    shares: number;
    views: number;
    saves: number;
    totalEngagements: number;
  }>;
  publishingHistory: {
    publishingAttempts: Array<{
      platform: Platform;
      attemptTime: string;         // ISO 8601
      successful: boolean;
      status: string;              // "success" | "failed" | "unknown"
      errorMessage: string;
      isRetry: boolean;
      externalPostId: string;
    }>;
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    retryAttempts: number;
    firstAttempt: string;          // ISO 8601
    lastAttempt: string;           // ISO 8601
  };
  performanceInsights: {
    bestPerformingPlatform: Platform;
    worstPerformingPlatform: Platform;
    highestEngagementCount: number;
    highestEngagementRate: number;
    performanceLevel: string;      // "Excellent" | "Good" | "Average" | "Poor"
    recommendations: string[];
    comparisonToUserAverage: Record<string, any>;
  };
  optimalTiming: {
    publishedAtOptimalTime: boolean;
    actualPublishHour: number;     // 0-23
    actualPublishDay: string;      // "MONDAY", etc.
    recommendedHour: number;       // 0-23
    recommendedDay: string;        // "Monday", etc.
    actualTimeSuccessRate: number; // percentage
    recommendedTimeSuccessRate: number; // percentage
    timingInsight: string;         // Human readable insight
  };
}
```

---

## 💾 Export Functionality

All analytics data can be exported in multiple formats: **JSON**, **CSV**, **EXCEL**.

### Export Overview

**GET Request:**
```http
GET /api/v1/analytics/export/overview?dateRange=30d&format=CSV
```

**POST Request:**
```http
POST /api/v1/analytics/export/overview?format=JSON
Content-Type: application/json

{
  "presetRange": "90d"
}
```

### Export Platform Analytics

**GET Request:**
```http
GET /api/v1/analytics/export/platform/INSTAGRAM?dateRange=30d&format=CSV
```

**POST Request:**
```http
POST /api/v1/analytics/export/platform/INSTAGRAM?format=JSON
Content-Type: application/json

{
  "startDate": "2024-01-01T00:00:00",
  "endDate": "2024-01-31T23:59:59"
}
```

### Export Post Analytics

```http
GET /api/v1/analytics/export/post/550e8400-e29b-41d4-a716-446655440000?format=CSV
```

### Export Formats

| Format | Content-Type | File Extension |
|--------|-------------|----------------|
| JSON   | application/json | .json |
| CSV    | text/csv | .csv |
| EXCEL  | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | .xlsx |

### Export Response
All export endpoints return binary data with appropriate headers:
```http
Content-Disposition: attachment; filename="analytics_overview_user1234_30d_20241201_143022.csv"
Content-Type: text/csv
Content-Length: 1024
```

---

## ❌ Error Handling

### Standard Error Response
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
}
```

### HTTP Status Codes
- **200 OK** - Success
- **400 Bad Request** - Invalid date range or parameters
- **401 Unauthorized** - Missing or invalid JWT token
- **404 Not Found** - Post not found
- **500 Internal Server Error** - Server error

### Common Error Scenarios

**Invalid Date Range:**
```json
{
  "success": false,
  "message": "Invalid date range provided",
  "errors": ["Start date must be before end date"]
}
```

**Post Not Found:**
```json
{
  "success": false,
  "message": "Post not found",
  "errors": ["Post with ID 550e8400-e29b-41d4-a716-446655440000 does not exist"]
}
```

---

## 💻 Frontend Implementation Examples

### React TypeScript Example

```typescript
import axios from 'axios';

interface AnalyticsService {
  // Overview Analytics
  getOverview: (dateRange?: string) => Promise<AnalyticsOverview>;
  getOverviewCustom: (request: DateRangeRequest) => Promise<AnalyticsOverview>;
  
  // Platform Analytics
  getPlatformOverview: (platform: Platform, dateRange?: string) => Promise<PlatformAnalyticsOverview>;
  getPlatformOverviewCustom: (platform: Platform, request: DateRangeRequest) => Promise<PlatformAnalyticsOverview>;
  
  // Post Analytics
  getPostOverview: (postId: string) => Promise<PostAnalyticsOverview>;
  
  // Export Functions
  exportOverview: (format: ExportFormat, dateRange?: string) => Promise<Blob>;
  exportPlatformOverview: (platform: Platform, format: ExportFormat, request?: DateRangeRequest) => Promise<Blob>;
  exportPostOverview: (postId: string, format: ExportFormat) => Promise<Blob>;
}

class AnalyticsServiceImpl implements AnalyticsService {
  private baseUrl = '/api/v1/analytics';
  
  async getOverview(dateRange: string = '30d'): Promise<AnalyticsOverview> {
    const response = await axios.get(`${this.baseUrl}/overview?dateRange=${dateRange}`);
    return response.data.data;
  }
  
  async getOverviewCustom(request: DateRangeRequest): Promise<AnalyticsOverview> {
    const response = await axios.post(`${this.baseUrl}/overview`, request);
    return response.data.data;
  }
  
  async getPlatformOverview(platform: Platform, dateRange: string = '30d'): Promise<PlatformAnalyticsOverview> {
    const response = await axios.get(`${this.baseUrl}/platform/${platform}/overview?dateRange=${dateRange}`);
    return response.data.data;
  }
  
  async getPlatformOverviewCustom(platform: Platform, request: DateRangeRequest): Promise<PlatformAnalyticsOverview> {
    const response = await axios.post(`${this.baseUrl}/platform/${platform}/overview`, request);
    return response.data.data;
  }
  
  async getPostOverview(postId: string): Promise<PostAnalyticsOverview> {
    const response = await axios.get(`${this.baseUrl}/post/${postId}/overview`);
    return response.data.data;
  }
  
  async exportOverview(format: ExportFormat, dateRange: string = '30d'): Promise<Blob> {
    const response = await axios.get(`${this.baseUrl}/export/overview?dateRange=${dateRange}&format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }
  
  async exportPlatformOverview(platform: Platform, format: ExportFormat, request?: DateRangeRequest): Promise<Blob> {
    if (request) {
      const response = await axios.post(`${this.baseUrl}/export/platform/${platform}?format=${format}`, request, {
        responseType: 'blob'
      });
      return response.data;
    } else {
      const response = await axios.get(`${this.baseUrl}/export/platform/${platform}?format=${format}&dateRange=30d`, {
        responseType: 'blob'
      });
      return response.data;
    }
  }
  
  async exportPostOverview(postId: string, format: ExportFormat): Promise<Blob> {
    const response = await axios.get(`${this.baseUrl}/export/post/${postId}?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }
}
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

export const useAnalytics = () => {
  const [analyticsService] = useState(() => new AnalyticsServiceImpl());
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchOverview = async (dateRange?: string): Promise<AnalyticsOverview | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getOverview(dateRange);
      return data;
    } catch (err) {
      setError('Failed to fetch analytics overview');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const downloadExport = async (blob: Blob, filename?: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'analytics_export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };
  
  return {
    analyticsService,
    loading,
    error,
    fetchOverview,
    downloadExport
  };
};
```

### Vue 3 Composition API Example

```typescript
import { ref, computed } from 'vue';

export const useAnalytics = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const analyticsService = new AnalyticsServiceImpl();
  
  const fetchPlatformAnalytics = async (platform: Platform, request?: DateRangeRequest) => {
    try {
      loading.value = true;
      error.value = null;
      
      if (request) {
        return await analyticsService.getPlatformOverviewCustom(platform, request);
      } else {
        return await analyticsService.getPlatformOverview(platform);
      }
    } catch (err) {
      error.value = 'Failed to fetch platform analytics';
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchPlatformAnalytics
  };
};
```

---

## 📈 Chart.js Integration Examples

### Engagement Time Series Chart

```typescript
import { Chart } from 'chart.js';

const createEngagementChart = (timeSeries: AnalyticsOverview['engagementTimeSeries']) => {
  const ctx = document.getElementById('engagementChart') as HTMLCanvasElement;
  
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: timeSeries.map(item => new Date(item.timestamp).toLocaleDateString()),
      datasets: [{
        label: 'Engagements',
        data: timeSeries.map(item => item.engagements),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Engagement Over Time'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Engagements'
          }
        }
      }
    }
  });
};
```

### Platform Performance Pie Chart

```typescript
const createPlatformChart = (breakdown: AnalyticsOverview['engagementBreakdown']) => {
  const ctx = document.getElementById('platformChart') as HTMLCanvasElement;
  
  return new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(breakdown.percentages),
      datasets: [{
        data: Object.values(breakdown.percentages),
        backgroundColor: [
          '#FF6384',
          '#36A2EB', 
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Engagement Breakdown'
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  });
};
```

---

## 🎨 UI Component Examples

### Date Range Picker

```typescript
interface DateRangePickerProps {
  onChange: (range: DateRangeRequest) => void;
  defaultRange?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onChange, defaultRange = '30d' }) => {
  const [selectedRange, setSelectedRange] = useState(defaultRange);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  
  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
    setIsCustom(range === 'custom');
    
    if (range !== 'custom') {
      onChange({ presetRange: range });
    }
  };
  
  const handleCustomRangeSubmit = () => {
    if (customStart && customEnd) {
      onChange({
        startDate: new Date(customStart).toISOString(),
        endDate: new Date(customEnd).toISOString()
      });
    }
  };
  
  return (
    <div className="date-range-picker">
      <div className="preset-buttons">
        {['7d', '30d', '90d', '365d', 'custom'].map(range => (
          <button
            key={range}
            className={selectedRange === range ? 'active' : ''}
            onClick={() => handleRangeChange(range)}
          >
            {range === 'custom' ? 'Custom' : `Last ${range.replace('d', ' days')}`}
          </button>
        ))}
      </div>
      
      {isCustom && (
        <div className="custom-range">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            placeholder="Start Date"
          />
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            placeholder="End Date"
          />
          <button onClick={handleCustomRangeSubmit}>Apply</button>
        </div>
      )}
    </div>
  );
};
```

---

## 🔧 Best Practices

### 1. **Caching Strategy**
- Cache analytics data for 5-10 minutes to reduce API calls
- Use React Query or Vue Query for automatic caching and background updates

### 2. **Loading States**
- Show skeleton loaders for charts and metrics
- Provide clear loading indicators for export operations

### 3. **Error Handling**
- Display user-friendly error messages
- Provide retry mechanisms for failed requests
- Handle network timeouts gracefully

### 4. **Performance Optimization**
- Use pagination for large time series data
- Implement virtual scrolling for long lists
- Lazy load chart components

### 5. **Export UX**
- Show progress indicators for export operations
- Validate file downloads
- Provide format selection UI

---

## 📚 Summary

This comprehensive guide covers:
- ✅ **10 Analytics Endpoints** - Complete coverage of overview, platform, and post analytics
- ✅ **Multiple Export Formats** - JSON, CSV, Excel support with proper file handling
- ✅ **Flexible Date Ranges** - Preset and custom date range support with validation
- ✅ **Complete TypeScript Models** - Fully typed interfaces for all responses
- ✅ **Frontend Integration Examples** - React, Vue, and Chart.js implementations
- ✅ **Error Handling** - Comprehensive error scenarios and responses
- ✅ **Best Practices** - Performance, UX, and caching recommendations

The API provides everything needed to build a comprehensive analytics dashboard with rich visualizations and export capabilities.