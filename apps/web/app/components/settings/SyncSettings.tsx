// FIXME: Refactor !
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
  toast,
} from "@kreozalabs/ui";
import { useState, useEffect, useRef } from "react";
import { Smartphone, Unlink, Copy, Check, Camera, VideoOff } from "lucide-react";
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
    <div className="border-border/40 mx-auto flex w-fit justify-center rounded-xl border bg-white p-3 shadow-sm">
      <canvas ref={canvasRef} className="size-50 rounded-lg" />
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
      <div className="text-primary flex items-center gap-2">
        <Smartphone className="size-4" />
        <h4 className="text-xs font-bold tracking-wider uppercase">Sync</h4>
      </div>

      <p className="text-muted-foreground text-[13px] leading-relaxed">
        Synchronize your data directly with your other devices using secure, real-time channels.
      </p>

      <div className="mt-4 space-y-1 pt-2">
        {pairingCode && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-bold uppercase">Device Name</TableHead>
                <TableHead className="text-xs font-bold uppercase">Last Active</TableHead>
                <TableHead className="text-right text-xs font-bold uppercase">Remove</TableHead>
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
                        className="bg-background hover:bg-muted border-border/50 text-foreground h-8 gap-1.5 rounded-lg px-3"
                      >
                        <Unlink className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground text-center font-medium">
                    No peers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="mt-4 flex w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
        {pairingCode ? (
          <>
            <Dialog open={viewCodeOpen} onOpenChange={setViewCodeOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-background hover:bg-muted border-border/50 text-foreground h-8 w-full gap-1.5 rounded-lg px-3 sm:w-auto"
                >
                  View Sync Code
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl p-6 sm:max-w-90">
                <DialogHeader>
                  <DialogTitle className="text-center text-sm font-bold tracking-wider uppercase">
                    Device Pairing Code
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground text-center text-xs">
                    Scan this QR code or copy the text code on your other device to connect.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <QRCodeCanvas text={pairingCode} />

                  <div className="bg-muted/20 border-border/30 flex items-center justify-between gap-2 rounded-xl border p-2.5 text-center font-mono text-xs font-semibold tracking-wider select-all">
                    <span className="text-foreground flex-1 text-center font-bold">
                      {pairingCode}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="hover:bg-muted/50 size-8 rounded-lg p-0"
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
                  className="border-destructive/30 hover:border-destructive/50 text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-full gap-1.5 rounded-lg px-3 sm:w-auto"
                >
                  Leave Sync Chain
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl p-6 sm:max-w-90">
                <DialogHeader>
                  <DialogTitle className="text-center text-sm font-bold tracking-wider uppercase">
                    Leave Sync Chain
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground text-center text-xs">
                    Are you sure you want to disconnect this device from the sync chain? This will
                    stop real-time data synchronization.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 flex gap-3">
                  <Button
                    variant="outline"
                    className="h-9 flex-1 rounded-xl text-xs font-semibold"
                    onClick={() => setConfirmLeaveOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-9 flex-1 rounded-xl text-xs font-bold"
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
                  className="bg-background hover:bg-muted border-border/50 text-foreground h-8 w-full gap-1.5 rounded-lg px-3 sm:w-auto"
                >
                  Start a new Sync Chain
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl p-6 sm:max-w-90">
                <DialogHeader>
                  <DialogTitle className="text-center text-sm font-bold tracking-wider uppercase">
                    Device Pairing Code
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground text-center text-xs">
                    Scan this QR code or copy the text code on your other device to connect.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <QRCodeCanvas text={pairingCode} />

                  <div className="bg-muted/20 border-border/30 flex items-center justify-between gap-2 rounded-xl border p-2.5 text-center font-mono text-xs font-semibold tracking-wider select-all">
                    <span className="text-foreground flex-1 text-center font-bold">
                      {pairingCode}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="hover:bg-muted/50 size-8 rounded-lg p-0"
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
                  className="bg-primary hover:bg-primary/80 text-foreground h-8 w-full gap-1.5 rounded-lg px-3 sm:w-auto"
                >
                  Join a Sync Chain
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl p-6 sm:max-w-90">
                <DialogHeader>
                  <DialogTitle className="text-center text-sm font-bold tracking-wider uppercase">
                    Connect Device
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground text-center text-xs">
                    Enter a pairing code or scan the QR code from another device.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                  <div className="space-y-2">
                    <label className="text-muted-foreground/50 px-1 text-[10px] font-bold tracking-wider uppercase">
                      Pairing Code
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={inputCode}
                        onChange={(e) => {
                          const val = e.target.value;
                          let raw = val.replace(/[^A-Z0-9]/gi, "").toUpperCase();
                          if (
                            raw.length > 0 &&
                            !raw.startsWith("K") &&
                            !raw.startsWith("E") &&
                            !raw.startsWith("I")
                          ) {
                            raw = "KEI" + raw;
                          } else if (raw.length >= 3 && !raw.startsWith("KEI")) {
                            raw = "KEI" + raw;
                          }

                          let formatted = "";
                          if (raw.length > 0) {
                            formatted += raw.slice(0, Math.min(raw.length, 3));
                          }
                          if (raw.length > 3) {
                            formatted += "-" + raw.slice(3, Math.min(raw.length, 7));
                          }
                          if (raw.length > 7) {
                            formatted += "-" + raw.slice(7, Math.min(raw.length, 11));
                          }
                          if (raw.length > 11) {
                            formatted += "-" + raw.slice(11, Math.min(raw.length, 15));
                          }

                          setInputCode(formatted);
                        }}
                        placeholder="KEI-XXXX-XXXX-XXXX"
                        className="bg-muted/20 border-border/30 h-9 flex-1 rounded-xl font-mono text-xs tracking-wider placeholder:font-sans placeholder:tracking-normal"
                      />
                      <Button
                        onClick={handlePair}
                        disabled={!inputCode}
                        className="bg-primary hover:bg-primary/80 text-foreground h-9 rounded-xl px-4 text-xs font-bold"
                      >
                        Pair
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <div className="bg-border/40 h-px flex-1" />
                    <span className="text-muted-foreground/40 text-[10px] font-bold uppercase">
                      or
                    </span>
                    <div className="bg-border/40 h-px flex-1" />
                  </div>

                  {isCameraActive ? (
                    <div className="space-y-4">
                      <div className="border-primary relative mx-auto flex aspect-video w-full max-w-70 items-center justify-center overflow-hidden rounded-xl border bg-black">
                        <video
                          ref={videoRef}
                          className="h-full w-full rounded-xl object-cover"
                          playsInline
                        />
                        <div className="border-primary/20 pointer-events-none absolute inset-0 overflow-hidden rounded-xl border">
                          <div className="bg-primary animate-scan absolute top-0 left-0 h-0.5 w-full shadow-[0_0_8px_var(--color-primary)]" />
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="h-9 w-full gap-1.5 rounded-xl text-xs font-semibold"
                        onClick={() => setIsCameraActive(false)}
                      >
                        <VideoOff className="size-3.5" />
                        Stop Camera
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="border-border/80 hover:border-primary/50 hover:bg-primary/5 h-9 w-full gap-1.5 rounded-xl border-dashed text-xs font-semibold"
                      onClick={() => setIsCameraActive(true)}
                    >
                      <Camera className="text-primary size-3.5" />
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
