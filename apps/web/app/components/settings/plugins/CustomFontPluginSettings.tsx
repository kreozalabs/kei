import { useState } from "react";
import { Type, Check, SlidersHorizontal, Code } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Switch,
  cn
} from "@kreozalabs/kei-ui";
import {
  GOOGLE_FONT_PRESETS,
  MONO_FONT_PRESETS
} from "@kreozalabs/kei-plugin-custom-font";
import { usePlugins } from "@/providers/PluginProvider";

export function CustomFontPluginSettings({ id }: { id?: string }) {
  const { customFont } = usePlugins();
  const { config, updateConfig } = customFont;
  const [customInput, setCustomInput] = useState(config.customFamily);

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      updateConfig({ mode: "custom", customFamily: customInput.trim() });
    }
  };

  return (
    <Card id={id} className="border-border/60 bg-card/60 backdrop-blur-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Type className="text-primary size-4" />
              Typography & Google Fonts
            </CardTitle>
            <span className="bg-primary/10 text-primary border-primary/20 rounded-full border px-2 py-0.5 text-xs font-medium">
              Plugin
            </span>
          </div>
          <CardDescription>
            Customize your workspace typography using curated Google Fonts presets, custom font families, and monospace code fonts
          </CardDescription>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(checked) => updateConfig({ enabled: checked })}
        />
      </CardHeader>

      {config.enabled && (
        <CardContent className="space-y-6 pt-2">
          {/* Preset Google Fonts */}
          <div className="space-y-2.5">
            <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Google Font Presets
            </Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {GOOGLE_FONT_PRESETS.map((preset) => {
                const isSelected = config.mode === "preset" && config.presetId === preset.id;
                return (
                  <Button
                    key={preset.id}
                    type="button"
                    variant="outline"
                    onClick={() => updateConfig({ mode: "preset", presetId: preset.id })}
                    className={cn(
                      "group relative flex h-20 flex-col items-start justify-between overflow-hidden rounded-xl border-2 p-3 text-left transition-all",
                      isSelected
                        ? "border-primary ring-primary/20 ring-2 bg-primary/5"
                        : "border-border/40 hover:border-border"
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <div className="bg-primary text-primary-foreground rounded-full p-0.5">
                          <Check className="size-3" />
                        </div>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs font-normal">
                      Aa Bb Cc 123
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Custom Family Input */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Custom Google Font Family Name
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="e.g. Poppins, Montserrat, Lora..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="bg-background/50"
              />
              <Button
                variant={config.mode === "custom" ? "default" : "outline"}
                onClick={handleCustomSubmit}
              >
                Apply Custom Font
              </Button>
            </div>
          </div>

          {/* Adjustments: Font Scale & Monospace Code Font */}
          <div className="border-border/40 grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2">
            {/* Font Scale Multiplier */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5 text-xs font-medium">
                  <SlidersHorizontal className="size-3.5" />
                  Font Scale Multiplier
                </Label>
                <span className="text-muted-foreground text-xs">
                  {Math.round((config.fontScale || 1.0) * 100)}%
                </span>
              </div>
              <div className="flex gap-1.5">
                {[0.9, 1.0, 1.1, 1.2].map((scale) => (
                  <Button
                    key={scale}
                    type="button"
                    size="sm"
                    variant={config.fontScale === scale ? "default" : "outline"}
                    onClick={() => updateConfig({ fontScale: scale })}
                    className="flex-1 text-xs"
                  >
                    {Math.round(scale * 100)}%
                  </Button>
                ))}
              </div>
            </div>

            {/* Monospace Code Font */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5 text-xs font-medium">
                  <Code className="size-3.5" />
                  Monospace Code Font
                </Label>
                <span className="text-muted-foreground text-xs">
                  {MONO_FONT_PRESETS.find((m) => m.id === config.monoPresetId)?.name || "System"}
                </span>
              </div>
              <div className="flex gap-1.5">
                {MONO_FONT_PRESETS.map((mono) => (
                  <Button
                    key={mono.id}
                    type="button"
                    size="sm"
                    variant={config.monoPresetId === mono.id ? "default" : "outline"}
                    onClick={() => updateConfig({ monoPresetId: mono.id })}
                    className="flex-1 text-xs"
                  >
                    {mono.name.split(" ")[0]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
