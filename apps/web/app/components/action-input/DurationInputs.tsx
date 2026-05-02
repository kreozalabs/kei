import { Button } from "@kreozalabs/ui";
import { Plus, Minus } from "lucide-react";

export const DurationStepper = ({
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
    <div className="flex flex-col gap-1.5 items-center flex-1 bg-muted/20 p-2.5 rounded-xl border border-border/30">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
        {label}
      </span>
      <div className="flex items-center gap-1.5 w-full justify-between mt-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 bg-background/50 hover:bg-background shadow-sm border border-border/40 text-muted-foreground hover:text-foreground rounded-lg transition-all active:scale-95 shrink-0"
          onClick={() => onChange(Math.max(0, value - getDecrement(value)))}
        >
          <Minus className="size-3" />
        </Button>
        <div className="font-bold text-[13px] text-foreground tracking-tight select-none">
          {value}m
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 bg-background/50 hover:bg-background shadow-sm border border-border/40 text-muted-foreground hover:text-foreground rounded-lg transition-all active:scale-95 shrink-0"
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
    <div className="p-2 space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
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
