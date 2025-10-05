"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MorphingText } from "@/components/ui/morphing-text"
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
    <div className="sticky top-0 z-40 border-b border-border/40 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          {/* Top row: Mode and Mission */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <Label htmlFor="mode" className="text-sm font-semibold text-foreground">
                Mode
              </Label>
              <Select
                value={controls.mode}
                onValueChange={(value: UserMode) => updateControls({ mode: value })}
                disabled={isInferenceRunning}
              >
                <SelectTrigger id="mode" className="w-[160px] bg-background/50 border-border/60 hover:bg-background/80 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="explorer">Explorer</SelectItem>
                  <SelectItem value="researcher">Researcher</SelectItem>
                  <SelectItem value="upload">
                    <span className="flex items-center gap-2">
                      Upload
                      <Badge variant="secondary" className="text-xs bg-violet-500/20 text-violet-300 border-violet-500/30">
                        Power
                      </Badge>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Label htmlFor="mission" className="text-sm font-semibold text-foreground">
                Mission
              </Label>
              <Select
                value={controls.mission}
                onValueChange={(value: Mission) => updateControls({ mission: value })}
                disabled={isInferenceRunning}
              >
                <SelectTrigger id="mission" className="w-[140px] bg-background/50 border-border/60 hover:bg-background/80 transition-colors">
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
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="threshold" className="text-sm font-semibold text-foreground">
                Decision Threshold
              </Label>
              <span className="text-sm font-mono text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
                {controls.threshold.toFixed(2)}
              </span>
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
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-3 group">
              <Checkbox
                id="feature-importances"
                checked={controls.explainability.featureImportances}
                onCheckedChange={(checked) => updateExplainability("featureImportances", checked === true)}
                disabled={isInferenceRunning}
                className="border-border/60 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
              />
              <Label htmlFor="feature-importances" className="text-sm font-normal cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors">
                Feature importances
              </Label>
            </div>

            <div className="flex items-center gap-3 group">
              <Checkbox
                id="nearest-examples"
                checked={controls.explainability.nearestExamples}
                onCheckedChange={(checked) => updateExplainability("nearestExamples", checked === true)}
                disabled={isInferenceRunning}
                className="border-border/60 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
              />
              <Label htmlFor="nearest-examples" className="text-sm font-normal cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors">
                Nearest known examples
              </Label>
            </div>

            {controls.mode === "researcher" && (
              <div className="flex items-center gap-3 group">
                <Checkbox
                  id="raw-features"
                  checked={controls.returnRawFeatures}
                  onCheckedChange={(checked) => updateControls({ returnRawFeatures: checked === true })}
                  disabled={isInferenceRunning}
                  className="border-border/60 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                />
                <Label htmlFor="raw-features" className="text-sm font-normal cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors">
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
