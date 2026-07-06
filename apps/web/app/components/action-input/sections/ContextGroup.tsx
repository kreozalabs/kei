import { useState } from "react";
import { Folder, MapPin, Tags, Users, Layers, Share2, Link2 } from "lucide-react";
import { PropertyButton } from "../PropertyButton";
import { EditableEnergy } from "../EditableEnergy";
import { EditableStatus, type StatusType } from "../EditableStatus";
import type { EnergyType } from "@kreozalabs/core";

export function ContextGroup() {
  const [energy, setEnergy] = useState<EnergyType>("medium");
  const [status, setStatus] = useState<StatusType>("active");
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-muted-foreground px-1 text-xs font-medium tracking-wider uppercase">
        Context & Details
      </h4>
      <div className="flex flex-col gap-2">
        <EditableEnergy value={energy} onChange={setEnergy} />
        {/* Tooltip: Energy of the action. Use <key> in title or note to configure using keyboard. */}
        <EditableStatus value={status} onChange={setStatus} />
        {/* Tooltip: Status of the action. Use <key> in title or note to configure using keyboard. */}
        <div className="visible:block hidden">
          {/* TODO: Implement*/}
          <PropertyButton icon={<Tags className="size-3.5" />} label="Labels" />
          {/* Tooltip: Labels for the action. Use <key> in title or note to configure using keyboard. */}
          <PropertyButton icon={<Users className="size-3.5" />} label="People" />
          {/* Tooltip: People associated with the action. Use <key> in title or note to configure using keyboard. */}
          <PropertyButton icon={<Folder className="size-3.5" />} label="Project" />
          {/* Tooltip: Project of the action. Use <key> in title or note to configure using keyboard. */}
          <PropertyButton icon={<MapPin className="size-3.5" />} label="Location" />
          {/* Tooltip: Location of the action. Use <key> in title or note to configure using keyboard. */}
          <PropertyButton icon={<Layers className="size-3.5" />} label="Type" />
          {/* Tooltip: Type of the action. Use <key> in title or note to configure using keyboard. */}
          <PropertyButton icon={<Share2 className="size-3.5" />} label="Shared" />
          {/* Tooltip: Share to another user. Use <key> in title or note to configure using keyboard. */}
          <PropertyButton icon={<Link2 className="size-3.5" />} label="Link" />
          {/* Tooltip: Link to another action or object. Use <key> in title or note to configure using keyboard. */}
        </div>
      </div>
    </div>
  );
}
