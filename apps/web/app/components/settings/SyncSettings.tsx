import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  cn,
} from "@kreozalabs/ui";
import { useState, useEffect, useRef } from "react";
import { Smartphone, Unlink, Copy, Check, Camera, VideoOff } from "lucide-react";
import { toast } from "sonner";
import { useP2P } from "@/providers/P2PProvider";
import QRCode from "qrcode";
import QrScanner from "qr-scanner";

// Inline helper for QR Code canvas rendering
function QRCodeCanvas({ text }: { text: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        text,
        {
          width: 200,
          margin: 1,
          color: {
            dark: "#0f172a", // slate-900
            light: "#ffffff",
          },
        },
        (error) => {
          if (error) console.error("[QR] Error generating QR code canvas:", error);
        }
      );
    }
  }, [text]);

  return (
    <div className="flex justify-center p-3 bg-white rounded-xl border border-border/40 w-fit mx-auto shadow-sm">
      <canvas ref={canvasRef} className="rounded-lg size-50" />
    </div>
  );
}

export function SyncSettings() {
  const { pairingCode, connectedPeers, pairDevice, unpairDevice, generatePairingCode } = useP2P();

  const [inputCode, setInputCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [viewCodeOpen, setViewCodeOpen] = useState(false);
  const [addNewOpen, setAddNewOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    if (isCameraActive && videoRef.current) {
      console.log("[QR] Initializing camera scanner...");
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log("[QR] Scanned QR code:", result.data);
          setInputCode(result.data);
          setIsCameraActive(false);
          toast.success("Pairing code scanned successfully");
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      scanner.start().catch((err) => {
        console.error("[QR] Camera start error:", err);
        toast.error("Could not access camera", {
          description:
            "Please check your camera permissions and ensure connection is secure (HTTPS/localhost).",
        });
        setIsCameraActive(false);
      });

      qrScannerRef.current = scanner;

      return () => {
        scanner.stop();
        scanner.destroy();
        qrScannerRef.current = null;
      };
    }
  }, [isCameraActive]);

  const handlePair = async () => {
    if (!inputCode) return;
    const success = await pairDevice(inputCode);
    if (success) {
      setInputCode("");
      setAddNewOpen(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pairingCode);
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
        {pairingCode && (
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
                connectedPeers.map((device) => (
                  <TableRow key={device.peerId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            device.status === "connected"
                              ? "bg-emerald-500 shadow-[0_0_6px_#10b981]"
                              : "bg-muted-foreground/30"
                          )}
                        />
                        <span>{device.name}</span>
                      </div>
                    </TableCell>
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
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-2 mt-4 w-full">
        {pairingCode ? (
          <>
            <Dialog open={viewCodeOpen} onOpenChange={setViewCodeOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto rounded-lg h-8 px-3 bg-background hover:bg-muted border-border/50 text-foreground gap-1.5"
                >
                  View Sync Code
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-90 p-6 rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-sm font-bold uppercase tracking-wider text-center">
                    Device Pairing Code
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground text-center">
                    Scan this QR code or copy the text code on your other device to connect.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <QRCodeCanvas text={pairingCode} />

                  <div className="flex items-center justify-between gap-2 p-2.5 bg-muted/20 rounded-xl border border-border/30 font-mono text-xs font-semibold tracking-wider text-center select-all">
                    <span className="flex-1 text-center font-bold text-foreground">
                      {pairingCode}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="size-8 p-0 rounded-lg hover:bg-muted/50"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="size-4 text-emerald-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={confirmLeaveOpen} onOpenChange={setConfirmLeaveOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto rounded-lg h-8 px-3 border-destructive/30 hover:border-destructive/50 text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                >
                  Leave Sync Chain
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-90 p-6 rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-sm font-bold uppercase tracking-wider text-center">
                    Leave Sync Chain
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground text-center">
                    Are you sure you want to disconnect this device from the sync chain? This will stop real-time data synchronization.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-9 text-xs font-semibold"
                    onClick={() => setConfirmLeaveOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 rounded-xl h-9 text-xs font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    onClick={() => {
                      setConfirmLeaveOpen(false);
                      unpairDevice();
                    }}
                  >
                    Leave Chain
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <>
            <Dialog
              open={viewCodeOpen}
              onOpenChange={(open) => {
                if (open && !pairingCode) {
                  generatePairingCode();
                }
                setViewCodeOpen(open);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto rounded-lg h-8 px-3 bg-background hover:bg-muted border-border/50 text-foreground gap-1.5"
                >
                  Start a new Sync Chain
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-90 p-6 rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-sm font-bold uppercase tracking-wider text-center">
                    Device Pairing Code
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground text-center">
                    Scan this QR code or copy the text code on your other device to connect.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <QRCodeCanvas text={pairingCode} />

                  <div className="flex items-center justify-between gap-2 p-2.5 bg-muted/20 rounded-xl border border-border/30 font-mono text-xs font-semibold tracking-wider text-center select-all">
                    <span className="flex-1 text-center font-bold text-foreground">
                      {pairingCode}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="size-8 p-0 rounded-lg hover:bg-muted/50"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="size-4 text-emerald-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog
              open={addNewOpen}
              onOpenChange={(open) => {
                setAddNewOpen(open);
                if (!open) {
                  setIsCameraActive(false);
                  setInputCode("");
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  className="w-full sm:w-auto rounded-lg h-8 px-3 bg-primary hover:bg-primary/80 text-foreground gap-1.5"
                >
                  Join a Sync Chain
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-90 p-6 rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-sm font-bold uppercase tracking-wider text-center">
                    Connect Device
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground text-center">
                    Enter a pairing code or scan the QR code from another device.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-1">
                      Pairing Code
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                        placeholder="KEI-XXXX-XXXX"
                        className="h-9 bg-muted/20 border-border/30 rounded-xl text-xs font-mono tracking-wider placeholder:font-sans placeholder:tracking-normal flex-1"
                      />
                      <Button
                        onClick={handlePair}
                        disabled={!inputCode}
                        className="h-9 rounded-xl px-4 text-xs font-bold bg-primary hover:bg-primary/80 text-foreground"
                      >
                        Pair
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <div className="h-px bg-border/40 flex-1" />
                    <span className="text-[10px] font-bold uppercase text-muted-foreground/40">
                      or
                    </span>
                    <div className="h-px bg-border/40 flex-1" />
                  </div>

                  {isCameraActive ? (
                    <div className="space-y-4">
                      <div className="relative w-full aspect-video max-w-70 mx-auto overflow-hidden rounded-xl border border-primary bg-black flex items-center justify-center">
                        <video
                          ref={videoRef}
                          className="w-full h-full object-cover rounded-xl"
                          playsInline
                        />
                        <div className="absolute inset-0 border border-primary/20 rounded-xl pointer-events-none overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_8px_var(--color-primary)] animate-scan" />
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full h-9 rounded-xl text-xs font-semibold gap-1.5"
                        onClick={() => setIsCameraActive(false)}
                      >
                        <VideoOff className="size-3.5" />
                        Stop Camera
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-9 rounded-xl text-xs font-semibold gap-1.5 border-dashed border-border/80 hover:border-primary/50 hover:bg-primary/5"
                      onClick={() => setIsCameraActive(true)}
                    >
                      <Camera className="size-3.5 text-primary" />
                      Scan QR Code
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </>
  );
}
