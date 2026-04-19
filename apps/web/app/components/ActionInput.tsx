import { useState, useRef, useEffect } from "react";
import { Input, Button, Textarea, cn } from "@kreozalabs/ui";
import { ActionSelector } from "./ActionSelector";
import {
  MoreHorizontal,
  AudioLines,
  Clock,
  BatteryMedium,
  BatteryFull,
  BatteryLow,
  Heart,
  AlertCircle,
} from "lucide-react";
import { addAction } from "../db/actions";
import { useQueryClient } from "@tanstack/react-query";

interface ActionInputProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialDate?: string;
  className?: string;
  variant?: "inline" | "dialog";
}

// TODO: If user filled any data, it should ask if user really wants to leave.
// TODO: Add a bit space between title and note.
// TODO: Add change date and start time~~~~around time.

export function ActionInput({
  onSuccess,
  onCancel,
  initialDate,
  className,
  variant = "inline",
}: ActionInputProps) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [intention, setIntention] = useState<"must" | "want">("want");
  const [energy, setEnergy] = useState<"low" | "medium" | "high">("medium");
  const [duration, setDuration] = useState<[number, number]>([15, 30]);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleAdd = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await addAction({
        title: title.trim(),
        note: note.trim(),
        intention,
        energy,
        duration,
        scheduledDate: initialDate,
      });

      setTitle("");
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["actions"] });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to add action:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col w-full transition-all duration-300 ease-out",
        variant === "inline"
          ? "bg-card/40 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl overflow-hidden"
          : "bg-transparent border-none rounded-none",
        className
      )}
    >
      <form onSubmit={handleAdd} className="flex flex-col">
        {/* Input Section */}
        <div className="p-5 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <Input
                ref={titleInputRef}
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="What do you want to accomplish?"
                className="h-8 p-0 text-[17px] font-bold bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/30 selection:bg-primary/20"
                disabled={isLoading}
              />
              <Textarea
                value={note}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                placeholder="Any notes or constraints?"
                className="min-h-0 h-auto p-0 text-[14px] leading-relaxed bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/20 resize-none overflow-hidden"
                style={{ height: note ? "auto" : "20px" }}
                disabled={isLoading}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 rounded-xl text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
            >
              <AudioLines className="size-5" />
            </Button>
          </div>
        </div>

        {/* Action Chips Row */}
        <div className="px-5 pb-5 flex flex-wrap gap-2.5 items-center">
          <ActionSelector
            icon={<Clock className="size-3.5 text-blue-500/70" />}
            label={
              duration[0] === duration[1]
                ? `${duration[0]} mins`
                : duration[0] === 60
                  ? "1 hr+"
                  : `${duration[0]} - ${duration[1]} mins`
            }
            options={[
              {
                label: "15 mins",
                value: [15, 15],
                icon: <Clock className="size-4 text-muted-foreground" />,
              },
              {
                label: "15 - 30 mins",
                value: [15, 30],
                icon: <Clock className="size-4 text-muted-foreground" />,
              },
              {
                label: "30 - 60 mins",
                value: [30, 60],
                icon: <Clock className="size-4 text-muted-foreground" />,
              },
              {
                label: "1 hour+",
                value: [60, 120],
                icon: <Clock className="size-4 text-muted-foreground" />,
              },
            ]}
            onSelect={setDuration}
            contentClassName="w-48"
          />

          <ActionSelector
            icon={
              energy === "high" ? (
                <BatteryFull className="size-3.5 text-red-500" />
              ) : energy === "medium" ? (
                <BatteryMedium className="size-3.5 text-yellow-500" />
              ) : (
                <BatteryLow className="size-3.5 text-green-500" />
              )
            }
            label={`${energy} energy`}
            options={[
              {
                label: "Low energy",
                value: "low",
                icon: <BatteryLow className="size-4" />,
                className: "text-green-500",
              },
              {
                label: "Medium energy",
                value: "medium",
                icon: <BatteryMedium className="size-4" />,
                className: "text-yellow-500",
              },
              {
                label: "High energy",
                value: "high",
                icon: <BatteryFull className="size-4" />,
                className: "text-red-500",
              },
            ]}
            onSelect={setEnergy}
            contentClassName="w-48"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-muted/80 transition-all font-bold"
            // TODO: Add something or remove
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between gap-4 bg-muted/5">
          <ActionSelector
            variant="ghost"
            icon={
              <div
                className={cn(
                  "size-5 rounded-md flex items-center justify-center",
                  intention === "must" ? "bg-orange-500/10" : "bg-pink-500/10"
                )}
              >
                {intention === "must" ? (
                  <AlertCircle className="size-3.5 text-orange-500" />
                ) : (
                  <Heart className="size-3.5 text-pink-500" />
                )}
              </div>
            }
            label={intention === "must" ? "Must do" : "Want to do"}
            options={[
              {
                label: "Want to do",
                value: "want",
                icon: <Heart className="size-4 text-pink-500" />,
              },
              {
                label: "Must do",
                value: "must",
                icon: <AlertCircle className="size-4 text-orange-500" />,
              },
            ]}
            onSelect={setIntention}
            triggerClassName="h-9 px-3 rounded-xl hover:bg-muted/50 font-bold text-muted-foreground/70 hover:text-foreground border-none"
            contentClassName="w-48"
          />

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCancel}
              className="h-10 px-5 rounded-xl bg-muted/50 hover:bg-muted font-bold text-sm transition-all border-none active:scale-95"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isLoading || !title.trim()}
              className="h-10 px-6 rounded-xl font-bold text-sm shadow-xl shadow-primary/10 transition-all bg-primary/10 hover:bg-primary/15 text-primary active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              Add task
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
