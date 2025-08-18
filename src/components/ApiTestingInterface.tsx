import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Square, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity,
  Database,
  Zap,
  Code,
  Monitor
} from 'lucide-react';
import { apiTester, TestResult, TestSuite } from '@/utils/api-testing';
import { api } from '@/services/api';

interface ApiTestingInterfaceProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ApiTestingInterface: React.FC<ApiTestingInterfaceProps> = ({ 
  isOpen = true, 
  onClose 
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [results, setResults] = useState<TestSuite | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [customResponse, setCustomResponse] = useState<unknown>(null);

  const runAllTests = async () => {
    setIsRunning(true);
    setCurrentTest('Initializing...');
    setResults(null);
    
    try {
      const suite = await apiTester.runAllTests();
      setResults(suite);
    } catch (error) {
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const runSpecificTest = async (testName: string, testFn: () => Promise<unknown>) => {
    setIsRunning(true);
    setCurrentTest(testName);
    setCustomResponse(null);
    
    try {
      const result = await apiTester.testSingleEndpoint(testName, testFn);
      setCustomResponse(result);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setCustomResponse({ error: errorMessage });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'skipped':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      skipped: 'secondary',
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed inset-4 bg-background border rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              <h2 className="text-lg font-semibold">API Testing Interface</h2>
              <Badge variant="outline">localhost:8000</Badge>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="overview" className="h-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                <TabsTrigger value="overview" className="rounded-none">Overview</TabsTrigger>
                <TabsTrigger value="endpoints" className="rounded-none">Endpoints</TabsTrigger>
                <TabsTrigger value="results" className="rounded-none">Results</TabsTrigger>
                <TabsTrigger value="manual" className="rounded-none">Manual Testing</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="h-full p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Backend Status</CardTitle>
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {navigator.onLine ? 'Online' : 'Offline'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Connection status
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Last Test</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {results ? `${results.passed}/${results.passed + results.failed}` : 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {results ? `${results.duration}ms` : 'No tests run'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                      <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {results 
                          ? `${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">
                        API endpoints working
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Test Suite Controls</CardTitle>
                    <CardDescription>
                      Run comprehensive tests against your API endpoints
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isRunning && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span className="text-sm">{currentTest}</span>
                        </div>
                        <Progress value={33} className="w-full" />
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={runAllTests} 
                        disabled={isRunning}
                        className="flex items-center gap-2"
                      >
                        {isRunning ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                        Run All Tests
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => setResults(null)}
                        disabled={isRunning}
                      >
                        <Square className="h-4 w-4 mr-2" />
                        Clear Results
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Endpoints Tab */}
              <TabsContent value="endpoints" className="h-full p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                  <Card>
                    <CardHeader>
                      <CardTitle>Available Endpoints</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-96">
                        <div className="space-y-2">
                          {[
                            { name: 'Overview Stats', endpoint: 'GET /api/v1/overview', fn: () => api.overview.getStats() },
                            { name: 'Social Accounts', endpoint: 'GET /api/v1/socials', fn: () => api.socialAccounts.getAll() },
                            { name: 'Posts List', endpoint: 'GET /api/v1/posts', fn: () => api.posts.getAll({ pageable: { page: 0, size: 10 } }) },
                            { name: 'Analytics', endpoint: 'GET /api/v1/analytics', fn: () => api.analytics.getAnalytics() },
                            { name: 'Billing Status', endpoint: 'GET /api/billing/status', fn: () => api.billing.getStatus() },
                          ].map((endpoint, i) => (
                            <div 
                              key={i}
                              className={`p-3 border rounded cursor-pointer hover:bg-accent ${
                                selectedEndpoint === endpoint.endpoint ? 'bg-accent' : ''
                              }`}
                              onClick={() => setSelectedEndpoint(endpoint.endpoint)}
                            >
                              <div className="font-medium">{endpoint.name}</div>
                              <div className="text-sm text-muted-foreground font-mono">
                                {endpoint.endpoint}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Endpoint Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedEndpoint ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium">Endpoint</h4>
                            <code className="text-sm bg-muted p-2 rounded block">
                              {selectedEndpoint}
                            </code>
                          </div>
                          
                          <Button 
                            onClick={() => {
                              const endpoint = [
                                { name: 'Overview Stats', endpoint: 'GET /api/v1/overview', fn: () => api.overview.getStats() },
                                { name: 'Social Accounts', endpoint: 'GET /api/v1/socials', fn: () => api.socialAccounts.getAll() },
                                { name: 'Posts List', endpoint: 'GET /api/v1/posts', fn: () => api.posts.getAll({ pageable: { page: 0, size: 10 } }) },
                                { name: 'Analytics', endpoint: 'GET /api/v1/analytics', fn: () => api.analytics.getAnalytics() },
                                { name: 'Billing Status', endpoint: 'GET /api/billing/status', fn: () => api.billing.getStatus() },
                              ].find(e => e.endpoint === selectedEndpoint);
                              
                              if (endpoint) {
                                runSpecificTest(endpoint.name, endpoint.fn);
                              }
                            }}
                            disabled={isRunning}
                          >
                            Test This Endpoint
                          </Button>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Select an endpoint to see details</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Results Tab */}
              <TabsContent value="results" className="h-full p-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Test Results</CardTitle>
                    {results && (
                      <CardDescription>
                        Completed in {results.duration}ms • {results.passed} passed • {results.failed} failed • {results.skipped} skipped
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      {results ? (
                        <div className="space-y-2">
                          {results.results.map((result, i) => (
                            <div key={i} className="p-3 border rounded">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(result.status)}
                                  <span className="font-medium">{result.endpoint}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(result.status)}
                                  <span className="text-xs text-muted-foreground">
                                    {result.duration}ms
                                  </span>
                                </div>
                              </div>
                              {result.error && (
                                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                  {result.error}
                                </div>
                              )}
                              {result.response && (
                                <details className="mt-2">
                                  <summary className="text-sm cursor-pointer">Response</summary>
                                  <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                                    {JSON.stringify(result.response, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No test results yet. Run tests to see results here.</p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Manual Testing Tab */}
              <TabsContent value="manual" className="h-full p-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Manual Testing</CardTitle>
                    <CardDescription>
                      Manually test individual endpoints and inspect responses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {customResponse && (
                        <div className="p-4 border rounded">
                          <h4 className="font-medium mb-2">Response:</h4>
                          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-48">
                            {JSON.stringify(customResponse, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => runSpecificTest('Test Overview', () => api.overview.getStats())}
                          disabled={isRunning}
                        >
                          Test Overview
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => runSpecificTest('Test Accounts', () => api.socialAccounts.getAll())}
                          disabled={isRunning}
                        >
                          Test Accounts
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => runSpecificTest('Test Posts', () => api.posts.getAll({ pageable: { page: 0, size: 5 } }))}
                          disabled={isRunning}
                        >
                          Test Posts
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => runSpecificTest('Test Analytics', () => api.analytics.getAnalytics())}
                          disabled={isRunning}
                        >
                          Test Analytics
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};