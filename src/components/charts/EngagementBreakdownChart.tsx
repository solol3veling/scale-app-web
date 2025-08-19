import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface EngagementBreakdownData {
  totalLikes: number
  totalComments: number
  totalShares: number
  totalViews: number
  totalSaves: number
  percentages?: {
    likes?: number
    comments?: number
    shares?: number
    views?: number
    saves?: number
  }
}

interface EngagementBreakdownChartProps {
  data: EngagementBreakdownData
  title?: string
  description?: string
  className?: string
}

const COLORS = {
  likes: '#e11d48',
  comments: '#3b82f6', 
  shares: '#10b981',
  views: '#f59e0b',
  saves: '#8b5cf6'
}

const ENGAGEMENT_ICONS = {
  likes: '❤️',
  comments: '💬',
  shares: '🔄',
  views: '👁️',
  saves: '🔖'
}

export const EngagementBreakdownChart: React.FC<EngagementBreakdownChartProps> = ({
  data,
  title = "Engagement Breakdown",
  description = "Distribution of engagement types",
  className = ""
}) => {
  // Calculate total engagements
  const totalEngagements = data.totalLikes + data.totalComments + data.totalShares + data.totalViews + data.totalSaves

  // Prepare chart data
  const chartData = [
    { 
      name: 'Likes', 
      value: data.totalLikes, 
      percentage: data.percentages?.likes || (totalEngagements > 0 ? (data.totalLikes / totalEngagements) * 100 : 0),
      color: COLORS.likes,
      icon: ENGAGEMENT_ICONS.likes
    },
    { 
      name: 'Comments', 
      value: data.totalComments, 
      percentage: data.percentages?.comments || (totalEngagements > 0 ? (data.totalComments / totalEngagements) * 100 : 0),
      color: COLORS.comments,
      icon: ENGAGEMENT_ICONS.comments
    },
    { 
      name: 'Shares', 
      value: data.totalShares, 
      percentage: data.percentages?.shares || (totalEngagements > 0 ? (data.totalShares / totalEngagements) * 100 : 0),
      color: COLORS.shares,
      icon: ENGAGEMENT_ICONS.shares
    },
    { 
      name: 'Views', 
      value: data.totalViews, 
      percentage: data.percentages?.views || (totalEngagements > 0 ? (data.totalViews / totalEngagements) * 100 : 0),
      color: COLORS.views,
      icon: ENGAGEMENT_ICONS.views
    },
    { 
      name: 'Saves', 
      value: data.totalSaves, 
      percentage: data.percentages?.saves || (totalEngagements > 0 ? (data.totalSaves / totalEngagements) * 100 : 0),
      color: COLORS.saves,
      icon: ENGAGEMENT_ICONS.saves
    }
  ].filter(item => item.value > 0) // Only show categories with data

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Pie Chart */}
          <div className="flex-1">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-semibold flex items-center gap-2">
                              <span>{data.icon}</span>
                              {data.name}
                            </p>
                            <p className="text-lg font-bold">{data.value.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">{data.percentage.toFixed(1)}% of total</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stats List */}
          <div className="flex-1 space-y-3">
            <div className="text-center lg:text-left">
              <h3 className="font-semibold text-lg">Total Engagements</h3>
              <p className="text-2xl font-bold text-blue-600">
                {totalEngagements.toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.icon} {item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">
                      {item.value.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}