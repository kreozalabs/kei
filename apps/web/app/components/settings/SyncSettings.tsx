import {
  Button,
  Input,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kreozalabs/ui";
import { useState } from "react";
import { Smartphone, WifiOff, Link2, Unlink, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useP2P } from "@/providers/P2PProvider";

export function SyncSettings() {
  const {
    isPaired,
    pairingCode,
    connectionStatus,
    connectedPeers,
    pairDevice,
    unpairDevice,
    generatePairingCode,
  } = useP2P();

  const [inputCode, setInputCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setGeneratedCode(generatePairingCode());
  };

  const handlePair = async () => {
    if (!inputCode) return;
    const success = await pairDevice(inputCode);
    if (success) {
      setInputCode("");
      setGeneratedCode("");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode || pairingCode);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex items-center gap-2 text-primary">
        <Smartphone className="size-4" />
        <h4 className="text-xs font-bold uppercase tracking-wider">Sync</h4>
      </div>

      <p className="text-[13px] text-muted-foreground leading-relaxed">
        Synchronize your data directly with your other devices using secure, real-time channels.
      </p>

      <div className="space-y-1 pt-2 mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-xs uppercase">Device Name</TableHead>
              <TableHead className="font-bold text-xs uppercase">Last Active</TableHead>
              <TableHead className="text-right font-bold text-xs uppercase">Remove</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {connectedPeers && connectedPeers.length > 0 ? (
              connectedPeers?.map((device) => (
                <TableRow key={device.peerId}>
                  <TableCell className="font-medium">{device.name}</TableCell>
                  <TableCell>{device.connectedAt.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => unpairDevice(device.peerId)}
                      variant="outline"
                      className="rounded-lg h-8 px-3 bg-background hover:bg-muted border-border/50 text-foreground gap-1.5"
                    >
                      <Unlink className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center font-medium text-muted-foreground">
                  No peers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center gap-2">
        {pairingCode && (
          <Button
            variant="outline"
            className="rounded-lg h-8 px-3 bg-background hover:bg-muted border-border/50 text-foreground gap-1.5"
            // TODO: On click open dialog with code and copy button.
          >
            View Sync Code
          </Button>
        )}
        <Button
          variant="default"
          className="rounded-lg h-8 px-3 bg-primary hover:bg-primary/80 text-foreground gap-1.5"
        >
          Add New Device
        </Button>
      </div>
    </>
  );
}
