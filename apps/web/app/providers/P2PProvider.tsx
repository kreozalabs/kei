/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { getLocalWatermarks, getEventsSince } from "@/db/sync";
import { importEvents } from "@/db/backup";
import { toast } from "sonner";

interface P2PContextType {
  isPaired: boolean;
  pairingCode: string;
  connectionStatus: "disconnected" | "connecting" | "connected";
  connectedPeers: string[];
  pairDevice: (code: string) => Promise<boolean>;
  unpairDevice: () => void;
  generatePairingCode: () => string;
}

const P2PContext = createContext<P2PContextType | undefined>(undefined);

export function useP2P() {
  const context = useContext(P2PContext);
  if (!context) {
    throw new Error("useP2P must be used within a P2PProvider");
  }
  return context;
}

export function P2PProvider({ children }: { children: React.ReactNode }) {
  const [pairingCode, setPairingCode] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">(
    "disconnected"
  );
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  
  const roomRef = useRef<any>(null);
  const dbChannelRef = useRef<BroadcastChannel | null>(null);

  // Read pairing code on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const code = localStorage.getItem("kei_sync_pairing_code") || "";
      setPairingCode(code);
    }
  }, []);

  // Helper to derive a stable 16-character room ID from a pairing code
  const deriveRoomId = async (code: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(code.toLowerCase().trim().replace(/-/g, ""));
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 16);
  };

  // Main WebRTC Connection effect
  useEffect(() => {
    if (typeof window === "undefined" || !pairingCode) {
      setConnectionStatus("disconnected");
      setConnectedPeers([]);
      return;
    }

    let isSubscribed = true;
    setConnectionStatus("connecting");

    async function startTrystero() {
      try {
        console.log("[P2P] Dynamically loading Trystero library...");
        const { joinRoom } = (await import("trystero")) as any;
        const roomId = await deriveRoomId(pairingCode);
        console.log(`[P2P] Derived stable roomId: "${roomId}" for pairing code: "${pairingCode}"`);
        
        if (!isSubscribed) return;

        console.log(`[P2P] Joining Nostr-signaled room: appId="kreozalabs-kei-v1", roomId="${roomId}"`);
        const room = joinRoom({ appId: "kreozalabs-kei-v1" }, roomId);
        roomRef.current = room;
        console.log("[P2P] Room successfully created, listening for peer events...");

        // Define synchronization message actions
        const watermarksAction = room.makeAction("watermarks");
        const eventsAction = room.makeAction("events");
 
        // Action 1: On receiving peer watermarks, calculate deltas and send missing events
        watermarksAction.onMessage = async (peerWatermarks: any, { peerId }: { peerId: string }) => {
          console.log(`[P2P] Received watermarks from peer ${peerId}`);
          try {
            const missingEvents = await getEventsSince(peerWatermarks);
            if (missingEvents.length > 0) {
              console.log(`[P2P] Sending ${missingEvents.length} delta events to peer ${peerId}`);
              eventsAction.send(missingEvents, { target: peerId });
            }
          } catch (err) {
            console.error("[P2P] Delta computation failed:", err);
          }
        };
 
        // Action 2: On receiving peer events, bulk import them
        eventsAction.onMessage = async (receivedEvents: any[], { peerId }: { peerId: string }) => {
          console.log(`[P2P] Received ${receivedEvents.length} events from peer ${peerId}`);
          try {
            const imported = await importEvents(receivedEvents);
            if (imported > 0) {
              toast.success("Synchronized successfully", {
                description: `Synced ${imported} new updates from your paired device.`,
              });
            }
          } catch (err) {
            console.error("[P2P] Import of synced events failed:", err);
          }
        };
 
        // Monitor peer connection events
        room.onPeerJoin = (peerId: string) => {
          console.log(`[P2P] Peer connected: ${peerId}`);
          setConnectedPeers((prev) => [...prev, peerId]);
          setConnectionStatus("connected");
          toast.info("Paired device connected", {
            description: "Direct real-time WebRTC channel established.",
          });
 
          // Kick off the handshake instantly
          setTimeout(async () => {
            try {
              const localWatermarks = await getLocalWatermarks();
              console.log("[P2P] Initiating handshake with watermarks:", localWatermarks);
              watermarksAction.send(localWatermarks, { target: peerId });
            } catch (err) {
              console.error("[P2P] Failed to send initial watermarks:", err);
            }
          }, 500);
        };
 
        room.onPeerLeave = (peerId: string) => {
          console.log(`[P2P] Peer disconnected: ${peerId}`);
          setConnectedPeers((prev) => {
            const next = prev.filter((p) => p !== peerId);
            if (next.length === 0) {
              setConnectionStatus("connecting");
            }
            return next;
          });
        };

      } catch (err) {
        console.error("[P2P] WebRTC connection initialization failed:", err);
        if (isSubscribed) {
          setConnectionStatus("disconnected");
        }
      }
    }

    startTrystero();

    return () => {
      isSubscribed = false;
      if (roomRef.current) {
        roomRef.current.leave();
        roomRef.current = null;
      }
      setConnectedPeers([]);
      setConnectionStatus("disconnected");
    };
  }, [pairingCode]);

  // Hook into local write broadcasts for live instant updates
  useEffect(() => {
    if (typeof window === "undefined" || !pairingCode) return;

    const dbChannel = new BroadcastChannel("kei_db_sync");
    dbChannelRef.current = dbChannel;

    const handleLocalWrite = async (event: MessageEvent) => {
      const { type } = event.data || {};
      
      // If a database update occurred, broadcast our new watermarks to all active peers
      if (type === "DB_UPDATED" && roomRef.current && connectedPeers.length > 0) {
        try {
          // Look up or declare action
          const watermarksAction = roomRef.current.makeAction("watermarks");
          
          const localWatermarks = await getLocalWatermarks();
          console.log("[P2P] Local write detected, broadcasting updated watermarks:", localWatermarks);
          watermarksAction.send(localWatermarks);
        } catch (err) {
          console.error("[P2P] Failed to broadcast write update:", err);
        }
      }
    };

    dbChannel.addEventListener("message", handleLocalWrite);

    return () => {
      dbChannel.removeEventListener("message", handleLocalWrite);
      dbChannel.close();
    };
  }, [pairingCode, connectedPeers]);

  const pairDevice = async (code: string): Promise<boolean> => {
    const cleanedCode = code.toUpperCase().trim();
    // Validate format (e.g. KEI-XXXX-XXXX)
    if (!/^[A-Z0-9]{3,4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(cleanedCode)) {
      toast.error("Invalid pairing code format", {
        description: "Please enter a code in the format: KEI-XXXX-XXXX",
      });
      return false;
    }

    localStorage.setItem("kei_sync_pairing_code", cleanedCode);
    setPairingCode(cleanedCode);
    toast.success("Pairing credentials set", {
      description: "Establishing secure connection to your paired device...",
    });
    return true;
  };

  const unpairDevice = () => {
    localStorage.removeItem("kei_sync_pairing_code");
    setPairingCode("");
    if (roomRef.current) {
      roomRef.current.leave();
      roomRef.current = null;
    }
    setConnectedPeers([]);
    setConnectionStatus("disconnected");
    toast.info("Device unpaired successfully", {
      description: "Local data is untouched, but syncing is now deactivated.",
    });
  };

  const generatePairingCode = (): string => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous characters (I, O, 0, 1)
    const genBlock = (length: number) =>
      Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const code = `KEI-${genBlock(4)}-${genBlock(4)}`;
    
    localStorage.setItem("kei_sync_pairing_code", code);
    setPairingCode(code);
    
    toast.success("Pairing code generated", {
      description: "Waiting for your other device to connect using this code...",
    });
    
    return code;
  };

  return (
    <P2PContext.Provider
      value={{
        isPaired: !!pairingCode,
        pairingCode,
        connectionStatus,
        connectedPeers,
        pairDevice,
        unpairDevice,
        generatePairingCode,
      }}
    >
      {children}
    </P2PContext.Provider>
  );
}
