import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PlatformRankingData {
  platform: string
  totalPosts: number
  totalEngagements: number
  successRate: number
  avgLikesPerPost: number
  avgCommentsPerPost: number
  avgSharesPerPost: number
}

interface PlatformRankingsChartProps {
  data: PlatformRankingData[]
  title?: string
  description?: string
  className?: string
}

const platformColors: Record<string, string> = {
  FACEBOOK: '#1877f2',
  INSTAGRAM: '#E4405F',
  TWITTER: '#1da1f2',
  LINKEDIN: '#0077b5',
  PINTEREST: '#bd081c',
  YOUTUBE: '#ff0000'
}

export const PlatformRankingsChart: React.FC<PlatformRankingsChartProps> = ({
  data,
  title = "Platform Performance Rankings",
  description = "Compare performance across social media platforms",
  className = ""
}) => {
  // Sort data by total engagements
  const sortedData = [...data]
    .sort((a, b) => b.totalEngagements - a.totalEngagements)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      color: platformColors[item.platform] || '#6b7280'
    }))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          <Badge variant="secondary" className="text-xs">
            {data.length} platforms
          </Badge>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Top performers summary */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {sortedData.slice(0, 3).map((platform, index) => (
            <div key={platform.platform} className="flex items-center gap-2 p-2 rounded-lg border">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: platform.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  #{index + 1} {platform.platform}
                </p>
                <p className="text-xs text-muted-foreground">
                  {platform.totalEngagements.toLocaleString()} engagements
                </p>
              </div>
              <div className="text-xs font-medium">
                {platform.successRate.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="platform" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                yAxisId="engagements"
                orientation="left"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="rate"
                orientation="right"
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as typeof sortedData[0]
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-semibold flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: data.color }}
                          />
                          {label}
                        </p>
                        <div className="mt-2 space-y-1 text-sm">
                          <p>Total Posts: {data.totalPosts.toLocaleString()}</p>
                          <p>Engagements: {data.totalEngagements.toLocaleString()}</p>
                          <p>Success Rate: {data.successRate.toFixed(1)}%</p>
                          <p>Avg Likes: {data.avgLikesPerPost.toFixed(1)}</p>
                          <p>Avg Comments: {data.avgCommentsPerPost.toFixed(1)}</p>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <Bar
                yAxisId="engagements"
                dataKey="totalEngagements"
                name="Total Engagements"
                fill={(entry: any) => entry.color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}