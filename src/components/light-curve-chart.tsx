"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import type { TooltipProps } from "recharts"
import type { LightCurveData, DetrendMethod } from "@/lib/types"

interface LightCurveChartProps {
  data: LightCurveData
  detrendMethod?: DetrendMethod
  transitEvents?: Array<{ time: number; label: string }>
  title?: string
}

export function LightCurveChart({
  data,
  detrendMethod = "none",
  transitEvents,
  title = "Light Curve",
}: LightCurveChartProps) {
  const chartData = useMemo(() => {
    let processedFlux = [...data.flux]

    // Apply detrending
    if (detrendMethod === "median" && processedFlux.length > 0) {
      const median = [...processedFlux].sort((a, b) => a - b)[Math.floor(processedFlux.length / 2)]
      processedFlux = processedFlux.map((f) => f / median)
    } else if (detrendMethod === "spline" && processedFlux.length > 0) {
      // Simple linear detrend as approximation
      const n = processedFlux.length
      const meanFlux = processedFlux.reduce((sum, f) => sum + f, 0) / n
      const meanTime = data.time.reduce((sum, t) => sum + t, 0) / n

      let numerator = 0
      let denominator = 0
      for (let i = 0; i < n; i++) {
        numerator += (data.time[i] - meanTime) * (processedFlux[i] - meanFlux)
        denominator += (data.time[i] - meanTime) ** 2
      }
      const slope = denominator !== 0 ? numerator / denominator : 0
      const intercept = meanFlux - slope * meanTime

      processedFlux = processedFlux.map((f, i) => f - (slope * data.time[i] + intercept) + 1)
    }

    return data.time.map((time, idx) => ({
      time,
      flux: processedFlux[idx],
      fluxErr: data.fluxErr?.[idx],
    }))
  }, [data, detrendMethod])

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-xs font-mono text-muted-foreground">Time: {payload[0].payload.time.toFixed(4)}</p>
          {payload[0].value && <p className="text-xs font-mono">Flux: {payload[0].value.toFixed(6)}</p>}
          {payload[0].payload.fluxErr && (
            <p className="text-xs font-mono text-muted-foreground">Error: ±{payload[0].payload.fluxErr.toFixed(6)}</p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {detrendMethod !== "none" && (
            <Badge variant="secondary" className="text-xs">
              {detrendMethod === "median" ? "Median Detrended" : "Spline Detrended"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
            dataKey="time"
            stroke="white"  
            tick={{ fill: "white", fontSize: 11 }}  
            label={{
              value: "Time (BJD)",
              position: "insideBottom",
              offset: -5,
              fill: "white",  
            }}
            />
            <YAxis
              stroke="white"  
              tick={{ fill: "white", fontSize: 11 }}  
              label={{
                value: "Normalized Flux",
                angle: -90,
                position: "insideLeft",
                fill: "white",  
              }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Transit event markers */}
            {transitEvents?.map((event, idx) => (
              <ReferenceLine
                key={idx}
                x={event.time}
                stroke="hsl(var(--chart-1))"
                strokeDasharray="3 3"
                label={{
                  value: event.label,
                  position: "top",
                  fill: "white",  
                  fontSize: 10,
                }}
              />
            ))}

            <Line
              type="monotone"
              dataKey="flux"
              stroke="red"  
              strokeWidth={2.5}  
              dot={false}
              isAnimationActive={false}
              connectNulls={true}  
/>
          </LineChart>
        </ResponsiveContainer>

        {transitEvents && transitEvents.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">Detected Transits:</span>
            {transitEvents.map((event, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {event.label}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
