import { useState } from "react";
import { Input, Button } from "@kreozalabs/ui";
import { PlusIcon } from "lucide-react";
import { addAction } from "../db/actions";
import { useQueryClient } from "@tanstack/react-query";

interface ActionInputProps {
  onSuccess?: () => void;
  initialDate?: string;
}

export function ActionInput({ onSuccess, initialDate }: ActionInputProps) {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleAdd = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await addAction({ 
        title: title.trim(), 
        scheduledDate: initialDate 
      });

      setTitle("");
      queryClient.invalidateQueries({ queryKey: ["actions"] });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to add action:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 w-full group">
      <div className="relative flex-1">
        <Input
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          placeholder="What's next?"
          className="h-12 sm:h-14 text-lg sm:text-xl font-bold bg-card border-none focus:ring-0 transition-all rounded-xl px-4 sm:px-8 placeholder:text-muted-foreground/30 shadow-none"
          autoFocus
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={isLoading || !title.trim()}
        className="h-12 sm:h-14 rounded-xl px-8 flex flex-row items-center justify-center gap-3 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <PlusIcon className="size-5 sm:size-6" />
        <span className="sm:inline">Add Action</span>
      </Button>
    </form>
  );
}
