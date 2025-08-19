import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

interface EngagementTimeSeriesData {
  timestamp: string
  engagements: number
  successRate: number
  postsPublished: number
}

interface EngagementTimeSeriesChartProps {
  data: EngagementTimeSeriesData[]
  title?: string
  description?: string
  className?: string
}

export const EngagementTimeSeriesChart: React.FC<EngagementTimeSeriesChartProps> = ({
  data,
  title = "Engagement Over Time",
  description = "Track engagement trends and success rates",
  className = ""
}) => {
  // Format data for the chart
  const chartData = data.map(item => ({
    date: format(new Date(item.timestamp), 'MMM dd'),
    engagements: item.engagements,
    successRate: item.successRate,
    posts: item.postsPublished
  }))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
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
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-semibold">{label}</p>
                        {payload.map((item, index) => (
                          <p key={index} style={{ color: item.color }}>
                            {item.name}: {
                              item.name === 'Success Rate' 
                                ? `${item.value}%` 
                                : item.value?.toLocaleString()
                            }
                          </p>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <Line
                yAxisId="engagements"
                type="monotone"
                dataKey="engagements"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Engagements"
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="rate"
                type="monotone"
                dataKey="successRate"
                stroke="#10b981"
                strokeWidth={2}
                name="Success Rate"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}