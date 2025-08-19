import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface HourlyData {
  hour: string
  posts: number
  percentage: number
}

interface DailyData {
  day: string
  posts: number
  percentage: number
}

interface PostingTimeAnalysisChartProps {
  hourlyData: HourlyData[]
  dailyData: DailyData[]
  peakDay?: string
  peakHour?: string
  title?: string
  description?: string
  className?: string
}

export const PostingTimeAnalysisChart: React.FC<PostingTimeAnalysisChartProps> = ({
  hourlyData,
  dailyData,
  peakDay = 'Monday',
  peakHour = '10:00',
  title = "Posting Time Analysis",
  description = "Analyze your posting patterns and optimal timing",
  className = ""
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        
        {/* Peak timing insights */}
        <div className="flex flex-wrap gap-2 mt-2">
          <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
            Peak Day: {peakDay}
          </div>
          <div className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs">
            Peak Hour: {peakHour}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hourly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hourly">Hourly Distribution</TabsTrigger>
            <TabsTrigger value="daily">Daily Distribution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hourly" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as HourlyData
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-semibold">{label}</p>
                            <p className="text-blue-600">Posts: {data.posts}</p>
                            <p className="text-gray-600">
                              {data.percentage.toFixed(1)}% of total posts
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar 
                    dataKey="posts" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {hourlyData.slice(0, 8).map(item => (
                <div key={item.hour} className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>{item.hour}</span>
                  <span className="font-medium">{item.posts}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="daily" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as DailyData
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-semibold">{label}</p>
                            <p className="text-green-600">Posts: {data.posts}</p>
                            <p className="text-gray-600">
                              {data.percentage.toFixed(1)}% of total posts
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar 
                    dataKey="posts" 
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-7 gap-2 text-xs">
              {dailyData.map(item => (
                <div key={item.day} className="flex flex-col items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{item.day}</span>
                  <span className="text-gray-600">{item.posts}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}