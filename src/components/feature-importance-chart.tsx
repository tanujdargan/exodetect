"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

import type { TooltipProps } from "recharts"

interface FeatureImportanceChartProps {
  features: Array<{
    name: string
    contribution: number
  }>
}

export function FeatureImportanceChart({ features }: FeatureImportanceChartProps) {
  const chartData = features.map((f) => ({
    name: f.name.replace(/_/g, " "),
    value: Math.abs(f.contribution) * 100,
    contribution: f.contribution,
  }))

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-xs font-medium mb-1">{data.name}</p>
          <p className="text-xs font-mono">
            Contribution: {data.contribution > 0 ? "+" : ""}
            {(data.contribution * 100).toFixed(2)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Feature Importance</CardTitle>
        <p className="text-xs text-muted-foreground">Top features contributing to the prediction</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              label={{
                value: "Contribution (%)",
                position: "insideBottom",
                offset: -5,
                fill: "hsl(var(--muted-foreground))",
              }}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              width={95}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.contribution > 0 ? "hsl(var(--chart-1))" : "hsl(var(--chart-5))"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--chart-1))" }} />
            <span className="text-muted-foreground">Positive contribution</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--chart-5))" }} />
            <span className="text-muted-foreground">Negative contribution</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
