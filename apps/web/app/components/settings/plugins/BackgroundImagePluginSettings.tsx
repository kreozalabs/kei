import { useState } from "react";
import { Image, Sparkles, Check, SlidersHorizontal } from "lucide-react";
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
import { WALLPAPER_PRESETS } from "@kreozalabs/kei-plugin-background-image";
import { usePlugins } from "@/providers/PluginProvider";

export function BackgroundImagePluginSettings({ id }: { id?: string }) {
  const { backgroundImage } = usePlugins();
  const { config, updateConfig } = backgroundImage;
  const [customInput, setCustomInput] = useState(config.customUrl);

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      updateConfig({ mode: "custom", customUrl: customInput.trim() });
    }
  };

  return (
    <Card id={id} className="border-border/60 bg-card/60 backdrop-blur-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Image className="text-primary size-4" />
              Background Wallpaper & Ambience
            </CardTitle>
            <span className="bg-primary/10 text-primary border-primary/20 rounded-full border px-2 py-0.5 text-xs font-medium">
              Plugin
            </span>
          </div>
          <CardDescription>
            Customize your workspace backdrop with wallpaper presets, custom URLs, and blur opacity
          </CardDescription>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(checked) => updateConfig({ enabled: checked })}
        />
      </CardHeader>

      {config.enabled && (
        <CardContent className="space-y-6 pt-2">
          {/* Preset Wallpapers */}
          <div className="space-y-2.5">
            <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Wallpaper Presets
            </Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {WALLPAPER_PRESETS.map((preset) => {
                const isSelected = config.mode === "preset" && config.presetId === preset.id;
                return (
                  <Button
                    key={preset.id}
                    type="button"
                    variant="outline"
                    onClick={() => updateConfig({ mode: "preset", presetId: preset.id })}
                    className={cn(
                      "group relative flex h-24 flex-col justify-end overflow-hidden rounded-xl border-2 p-2 text-left transition-all",
                      isSelected
                        ? "border-primary ring-primary/20 ring-2"
                        : "border-border/40 hover:border-border"
                    )}
                  >
                    <img
                      src={preset.thumbnail}
                      alt={preset.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="relative z-10 flex w-full items-center justify-between">
                      <span className="text-xs font-medium text-white drop-shadow-xs">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <div className="bg-primary text-primary-foreground rounded-full p-0.5">
                          <Check className="size-3" />
                        </div>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Custom URL Input */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Custom Image URL
            </Label>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="bg-background/50"
              />
              <Button
                variant={config.mode === "custom" ? "default" : "outline"}
                onClick={handleCustomSubmit}
              >
                Apply URL
              </Button>
            </div>
          </div>

          {/* Adjustments: Blur & Opacity */}
          <div className="border-border/40 grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2">
            {/* Backdrop Blur */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5 text-xs font-medium">
                  <SlidersHorizontal className="size-3.5" />
                  Backdrop Blur
                </Label>

                <span className="text-muted-foreground text-xs">{config.blurPx}px</span>
              </div>
              <div className="flex gap-1.5">
                {[0, 4, 8, 12].map((blur) => (
                  <Button
                    key={blur}
                    type="button"
                    size="sm"
                    variant={config.blurPx === blur ? "default" : "outline"}
                    onClick={() => updateConfig({ blurPx: blur })}
                    className="flex-1 text-xs"
                  >
                    {blur === 0 ? "Off" : `${blur}px`}
                  </Button>
                ))}
              </div>
            </div>

            {/* Overlay Dimness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5 text-xs font-medium">
                  <Sparkles className="size-3.5" />
                  Overlay Dimness
                </Label>
                <span className="text-muted-foreground text-xs">
                  {Math.round(config.overlayOpacity * 100)}%
                </span>
              </div>
              <div className="flex gap-1.5">
                {[0.4, 0.6, 0.75, 0.9].map((opacity) => (
                  <Button
                    key={opacity}
                    type="button"
                    size="sm"
                    variant={config.overlayOpacity === opacity ? "default" : "outline"}
                    onClick={() => updateConfig({ overlayOpacity: opacity })}
                    className="flex-1 text-xs"
                  >
                    {Math.round(opacity * 100)}%
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
