import { useState, useRef, useEffect } from "react";
import { 
  Input, 
  Button, 
  Textarea, 
  Badge,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  cn 
} from "@kreozalabs/ui";
import { 
  Calendar, 
  Paperclip, 
  Flag, 
  AlarmClock, 
  MoreHorizontal, 
  Inbox,
  AudioLines,
  X
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

export function ActionInput({ 
  onSuccess, 
  onCancel, 
  initialDate, 
  className,
  variant = "inline"
}: ActionInputProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [project, setProject] = useState("Inbox");
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
        description: description.trim(),
        priority,
        project,
        scheduledDate: initialDate 
      });

      setTitle("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["actions"] });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to add action:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "flex flex-col w-full transition-all duration-300 ease-out",
      variant === "inline" 
        ? "bg-card/40 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl overflow-hidden" 
        : "bg-transparent border-none rounded-none",
      className
    )}>
      <form onSubmit={handleAdd} className="flex flex-col">
        {/* Input Section */}
        <div className="p-5 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <Input
                ref={titleInputRef}
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="Action title"
                className="h-8 p-0 text-[17px] font-bold bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/30 selection:bg-primary/20"
                disabled={isLoading}
              />
              <Textarea
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                placeholder="Description"
                className="min-h-0 h-auto p-0 text-[14px] leading-relaxed bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/20 resize-none overflow-hidden"
                style={{ height: description ? "auto" : "20px" }}
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
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="h-8 rounded-lg border-green-500/20 bg-green-500/5 hover:bg-green-500/10 gap-2 px-2.5 group transition-all flex-nowrap"
          >
            <Calendar className="size-3.5 text-green-500" />
            <span className="text-[12px] font-bold text-green-500">Today</span>
            <X className="size-3 text-green-500/50 hover:text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>

          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="h-8 rounded-lg border-border/30 hover:bg-muted/50 gap-2 px-2.5 group transition-all flex-nowrap"
          >
            <Paperclip className="size-3.5 text-muted-foreground/60" />
            <span className="text-[12px] font-semibold text-muted-foreground/80">Attachment</span>
            <Badge variant="default" className="bg-primary/20 text-[8px] h-3.5 px-1.5 leading-none text-primary border-none font-black tracking-widest uppercase">
              New
            </Badge>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="h-8 rounded-lg border-border/30 hover:bg-muted/50 gap-2 px-2.5 group transition-all flex-nowrap"
              >
                <Flag className={cn(
                  "size-3.5 transition-colors",
                  priority === "high" ? "text-red-500" : priority === "medium" ? "text-yellow-500" : "text-blue-500"
                )} />
                <span className="text-[12px] font-semibold text-muted-foreground/80">Priority</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40 rounded-xl p-1.5 shadow-2xl border-border/40 backdrop-blur-xl">
              <DropdownMenuItem onClick={() => setPriority("high")} className="rounded-lg gap-3 text-red-500 font-bold px-3 py-2">
                <Flag className="size-4" /> High Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriority("medium")} className="rounded-lg gap-3 text-yellow-500 font-bold px-3 py-2">
                <Flag className="size-4" /> Medium Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriority("low")} className="rounded-lg gap-3 text-blue-500 font-bold px-3 py-2">
                <Flag className="size-4" /> Low Priority
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="h-8 rounded-lg border-border/30 hover:bg-muted/50 gap-2 px-2.5 group transition-all flex-nowrap"
          >
            <AlarmClock className="size-3.5 text-muted-foreground/60" />
            <span className="text-[12px] font-semibold text-muted-foreground/80">Reminders</span>
          </Button>

          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="size-8 p-0 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-all"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border/20 flex items-center justify-between gap-4 bg-muted/5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-9 px-3 rounded-xl gap-2 hover:bg-muted/50 transition-all font-bold text-muted-foreground/70 hover:text-foreground"
              >
                <div className="size-5 rounded-md bg-blue-500/10 flex items-center justify-center">
                  <Inbox className="size-3.5 text-blue-400" />
                </div>
                <span className="text-sm">{project}</span>
                <span className="text-[10px] opacity-30">▼</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-2xl p-1.5 shadow-2xl border-border/40 backdrop-blur-xl">
              <DropdownMenuItem onClick={() => setProject("Inbox")} className="rounded-xl gap-3 px-3 py-2.5 font-bold">
                <div className="size-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Inbox className="size-4 text-blue-400" />
                </div>
                Inbox
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setProject("Work")} className="rounded-xl gap-3 px-3 py-2.5 font-bold text-muted-foreground/70">
                <div className="size-6 rounded-lg bg-primary/5 flex items-center justify-center text-[10px] text-primary">#</div>
                Work
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setProject("Personal")} className="rounded-xl gap-3 px-3 py-2.5 font-bold text-muted-foreground/70">
                <div className="size-6 rounded-lg bg-primary/5 flex items-center justify-center text-[10px] text-primary">#</div>
                Personal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
              className="h-10 px-6 rounded-xl font-bold text-sm shadow-xl shadow-primary/10 transition-all bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              Add task
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
