import { Button } from "@kreozalabs/ui";
import { Plus, Minus } from "lucide-react";

const DurationStepper = ({
  value,
  label,
  onChange,
}: {
  value: number;
  label: string;
  onChange: (v: number) => void;
}) => {
  const getIncrement = (val: number) => (val < 60 ? 5 : 15);
  const getDecrement = (val: number) => (val <= 60 ? 5 : 15);

  return (
    <div className="bg-muted/20 border-border/30 flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-2.5">
      <span className="text-muted-foreground/60 text-[10px] font-bold tracking-wider uppercase">
        {label}
      </span>
      <div className="mt-0.5 flex w-full items-center justify-between gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="bg-background/50 hover:bg-background border-border/40 text-muted-foreground hover:text-foreground size-7 shrink-0 rounded-lg border shadow-sm transition-all active:scale-95"
          onClick={() => onChange(Math.max(0, value - getDecrement(value)))}
        >
          <Minus className="size-3" />
        </Button>
        <div className="text-foreground text-[13px] font-bold tracking-tight select-none">
          {value}m
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="bg-background/50 hover:bg-background border-border/40 text-muted-foreground hover:text-foreground size-7 shrink-0 rounded-lg border shadow-sm transition-all active:scale-95"
          onClick={() => onChange(value + getIncrement(value))}
        >
          <Plus className="size-3" />
        </Button>
      </div>
    </div>
  );
};

export const DurationInputs = ({
  value,
  onChange,
}: {
  value: [number, number | null];
  onChange: (v: [number, number | null]) => void;
}) => {
  const currentMin = value[0];
  const currentMax = value[1] === null ? currentMin : value[1];

  const handleMinChange = (newMin: number) => {
    let newMax = currentMax;
    if (newMin > newMax) newMax = newMin;
    onChange([newMin, newMax]);
  };

  const handleMaxChange = (newMax: number) => {
    let newMin = currentMin;
    if (newMax < newMin) newMin = newMax;
    onChange([newMin, newMax]);
  };

  return (
    <div className="space-y-3 p-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-muted-foreground/50 text-[10px] font-bold tracking-wider uppercase">
          Custom Duration
        </p>
      </div>
      <div className="flex items-center gap-2">
        <DurationStepper value={currentMin} label="Min" onChange={handleMinChange} />
        <DurationStepper value={currentMax} label="Max" onChange={handleMaxChange} />
      </div>
    </div>
  );
};
