"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { UserMode, Mission, GlobalControls } from "@/lib/types"

interface TopBarProps {
  controls: GlobalControls
  onControlsChange: (controls: GlobalControls) => void
  isInferenceRunning?: boolean
}

export function TopBar({ controls, onControlsChange, isInferenceRunning = false }: TopBarProps) {
  const updateControls = (updates: Partial<GlobalControls>) => {
    onControlsChange({ ...controls, ...updates })
  }

  const updateExplainability = (key: keyof GlobalControls["explainability"], value: boolean) => {
    onControlsChange({
      ...controls,
      explainability: {
        ...controls.explainability,
        [key]: value,
      },
    })
  }

  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-6">
          {/* Top row: Mode and Mission */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="mode" className="text-sm font-medium">
                Mode
              </Label>
              <Select
                value={controls.mode}
                onValueChange={(value: UserMode) => updateControls({ mode: value })}
                disabled={isInferenceRunning}
              >
                <SelectTrigger id="mode" className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="explorer">Explorer</SelectItem>
                  <SelectItem value="researcher">Researcher</SelectItem>
                  <SelectItem value="upload">
                    <span className="flex items-center gap-2">
                      Upload
                      <Badge variant="secondary" className="text-xs">
                        Power
                      </Badge>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="mission" className="text-sm font-medium">
                Mission
              </Label>
              <Select
                value={controls.mission}
                onValueChange={(value: Mission) => updateControls({ mission: value })}
                disabled={isInferenceRunning}
              >
                <SelectTrigger id="mission" className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kepler">Kepler</SelectItem>
                  <SelectItem value="k2">K2</SelectItem>
                  <SelectItem value="tess">TESS</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Second row: Threshold slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="threshold" className="text-sm font-medium">
                Decision Threshold
              </Label>
              <span className="text-sm font-mono text-muted-foreground">{controls.threshold.toFixed(2)}</span>
            </div>
            <Slider
              id="threshold"
              min={0}
              max={1}
              step={0.01}
              value={[controls.threshold]}
              onValueChange={([value]) => updateControls({ threshold: value })}
              disabled={isInferenceRunning}
              className="w-full max-w-md"
            />
          </div>

          {/* Third row: Explainability options */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="feature-importances"
                checked={controls.explainability.featureImportances}
                onCheckedChange={(checked) => updateExplainability("featureImportances", checked === true)}
                disabled={isInferenceRunning}
              />
              <Label htmlFor="feature-importances" className="text-sm font-normal cursor-pointer">
                Feature importances
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="nearest-examples"
                checked={controls.explainability.nearestExamples}
                onCheckedChange={(checked) => updateExplainability("nearestExamples", checked === true)}
                disabled={isInferenceRunning}
              />
              <Label htmlFor="nearest-examples" className="text-sm font-normal cursor-pointer">
                Nearest known examples
              </Label>
            </div>

            {controls.mode === "researcher" && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="raw-features"
                  checked={controls.returnRawFeatures}
                  onCheckedChange={(checked) => updateControls({ returnRawFeatures: checked === true })}
                  disabled={isInferenceRunning}
                />
                <Label htmlFor="raw-features" className="text-sm font-normal cursor-pointer">
                  Return raw features
                </Label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
