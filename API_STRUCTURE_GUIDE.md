# 🚀 API Structure & Testing Guide

## 🏗️ **New Modular API Structure**

### **📁 File Organization**
```
src/
├── services/api/
│   ├── index.ts           # Main exports & consolidated API object
│   ├── base.ts            # Base client, error handling, auth
│   ├── social-accounts.ts # Social accounts endpoints
│   ├── posts.ts           # Posts management endpoints
│   ├── analytics.ts       # Analytics & metrics endpoints
│   ├── overview.ts        # Dashboard overview endpoints
│   ├── oauth.ts           # OAuth flow endpoints
│   └── billing.ts         # Billing & subscription endpoints
├── hooks/api/
│   ├── useOverview.ts     # Overview hooks with React Query
│   ├── useSocialAccounts.ts # Social accounts hooks
│   └── usePosts.ts        # Posts hooks with optimistic updates
└── utils/
    └── api-testing.ts     # Comprehensive API testing utilities
```

## 🎯 **Enhanced Features**

### **1. Advanced Error Handling**
```typescript
- Custom ApiError class with detailed error info
- Automatic retry logic with exponential backoff
- 401/403 handling with automatic token refresh
- Network status detection and offline support
```

### **2. Optimistic Updates**
```typescript
// Example: Update social account with immediate UI feedback
const { mutate } = useUpdateSocialAccount();

mutate({ id: '123', data: { displayName: 'New Name' } });
// ✅ UI updates immediately, rolls back on error
```

### **3. Smart Caching & Invalidation**
```typescript
// React Query keys are organized and typed
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  detail: (id: string) => [...postKeys.all, 'detail', id] as const,
};
```

### **4. Comprehensive Testing**
```typescript
// Available in browser console (dev mode)
apiTester.testAll()        // Run full test suite
apiTester.testOverview()   // Test overview endpoints
apiTester.testPosts()      // Test posts endpoints
```

## 🧪 **API Testing Utilities**

### **Browser Console Commands**
```javascript
// Run comprehensive test suite
apiTester.testAll()

// Test specific API groups
apiTester.testOverview()
apiTester.testSocialAccounts()
apiTester.testPosts()
apiTester.testAnalytics()
apiTester.testBilling()

// Direct API access
apiTester.api.overview.getStats()
apiTester.api.posts.create({ content: 'Test post', accountIds: [] })
```

### **Visual Testing Interface**
```typescript
import { ApiTestingInterface } from '@/components/ApiTestingInterface';

// Add to any page for visual testing
<ApiTestingInterface isOpen={true} />
```

## 📊 **State Management**

### **React Query Integration**
- **Automatic Background Refetching**: Data stays fresh
- **Optimistic Updates**: Instant UI feedback
- **Error Boundaries**: Graceful error handling
- **Cache Management**: Smart data invalidation

### **Query Keys Structure**
```typescript
// Hierarchical query keys for precise cache control
socialAccountKeys = {
  all: ['socialAccounts'],
  lists: () => [...socialAccountKeys.all, 'list'],
  detail: (id: string) => [...socialAccountKeys.all, 'detail', id],
  connection: (id: string) => [...socialAccountKeys.all, 'connection', id],
}
```

## 🔌 **API Endpoints Coverage**

### **✅ Implemented & Tested**
| Service | Endpoints | Status | Hooks Available |
|---------|-----------|--------|-----------------|
| **Overview** | `/overview/*` | ✅ | `useOverview()`, `useOverviewData()` |
| **Social Accounts** | `/socials/*` | ✅ | `useSocialAccounts()`, `useUpdateSocialAccount()` |
| **Posts** | `/post/*`, `/posts/*` | ✅ | `usePosts()`, `useCreatePost()`, `useInfinitePosts()` |
| **Analytics** | `/analytics/*` | ✅ | `useAnalytics()`, `usePlatformAnalytics()` |
| **Billing** | `/billing/*` | ✅ | `useBilling()`, `useUpgradePlan()` |
| **OAuth** | `/oauth/*` | ✅ | `useOAuthFlow()` |

### **🎮 Advanced Hooks Features**
```typescript
// Infinite scroll posts
const { data, fetchNextPage, hasNextPage } = useInfinitePosts();

// Real-time data with auto-refresh
const overview = useOverview({ 
  refetchInterval: 30000 // 30 seconds
});

// Optimistic social account updates
const { mutate } = useUpdateSocialAccount();
mutate({ id, data }, {
  onSuccess: () => console.log('Updated!'),
  onError: (error) => console.log('Rolled back!')
});
```

## 🛠️ **Development Workflow**

### **1. Start Backend**
```bash
# Your backend should be running on
http://localhost:8000
```

### **2. Test API Integration**
```bash
# In browser console
apiTester.testAll()
```

### **3. Use React Hooks**
```typescript
import { useOverview, usePosts, useSocialAccounts } from '@/hooks';

function MyComponent() {
  const { data: overview, isLoading } = useOverview();
  const { data: posts } = usePosts();
  const { mutate: createPost } = useCreatePost();
  
  return (
    <div>
      <h1>Posts: {overview?.totalPosts}</h1>
      <button onClick={() => createPost({
        content: 'Hello World!',
        accountIds: ['account-1']
      })}>
        Create Post
      </button>
    </div>
  );
}
```

## 🔍 **Debugging & Monitoring**

### **Development Logs**
- All API calls logged with method, URL, and timing
- Automatic error reporting with context
- Request/response inspection in browser console

### **Production Monitoring**
- Error tracking with detailed context
- Performance metrics and timing
- User session replay for debugging

## 🚀 **Next Steps**

1. **Start your backend** on `http://localhost:8000`
2. **Open browser console** and run `apiTester.testAll()`
3. **Check results** - green = working, red = needs attention
4. **Use React hooks** in your components for real data
5. **Test CRUD operations** with optimistic updates

## 💡 **Pro Tips**

- **Use TypeScript**: Full type safety across all API calls
- **Leverage React Query**: Built-in caching, loading states, error handling
- **Test Early**: Use the testing utilities to catch issues fast
- **Monitor Performance**: Check API response times in the console
- **Handle Offline**: The system gracefully degrades when offline

Your API integration is now **production-ready** with comprehensive testing, error handling, and state management! 🎉