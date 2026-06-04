import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { getLocalWatermarks, getEventsSince } from "@/db/sync";
import { importEvents } from "@/db/backup";
import { toast } from "sonner";
import { getOrCreateDeviceIdentity, getDeviceName } from "@/utils/device";

export interface Peer {
  name: string;
  peerId: string;
  connectedAt: number | Date;
  syncedAt: number | Date;
  status: "disconnected" | "connecting" | "connected";
}

interface P2PContextType {
  isPaired: boolean;
  pairingCode: string;
  connectionStatus: "disconnected" | "connecting" | "connected";
  connectedPeers: Peer[];
  pairDevice: (code: string) => Promise<boolean>;
  unpairDevice: (peerId?: string) => void;
  generatePairingCode: () => string;
  pairedDevices: () => Peer[];
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
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [connectedPeers, setConnectedPeers] = useState<Peer[]>([]);

  const roomRef = useRef<any>(null);
  const dbChannelRef = useRef<BroadcastChannel | null>(null);
  const transientToPersistentMapRef = useRef<Map<string, string>>(new Map());

  // Helper to load paired devices from localStorage
  const getStoredPairedDevices = (): Peer[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("kei_paired_devices");
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return parsed.map((p: any) => ({
        ...p,
        connectedAt: new Date(p.connectedAt),
        syncedAt: new Date(p.syncedAt),
      }));
    } catch (e) {
      console.error("[P2P] Failed to parse paired devices:", e);
      return [];
    }
  };

  // Helper to save paired devices to localStorage
  const saveStoredPairedDevices = (devices: Peer[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("kei_paired_devices", JSON.stringify(devices));
    } catch (e) {
      console.error("[P2P] Failed to save paired devices:", e);
    }
  };

  // Helper to load removed/tombstoned devices from localStorage
  const getRemovedDevices = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("kei_removed_devices");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Helper to add a device to the removed list
  const addRemovedDevice = (deviceId: string) => {
    if (typeof window === "undefined") return;
    try {
      const removed = getRemovedDevices();
      if (!removed.includes(deviceId)) {
        localStorage.setItem("kei_removed_devices", JSON.stringify([...removed, deviceId]));
      }
    } catch (e) {
      console.error("[P2P] Failed to save removed device tombstone:", e);
    }
  };

  // Helper to remove a device from the removed list (e.g. if we connect directly again)
  const removeRemovedDevice = (deviceId: string) => {
    if (typeof window === "undefined") return;
    try {
      const removed = getRemovedDevices();
      if (removed.includes(deviceId)) {
        localStorage.setItem(
          "kei_removed_devices",
          JSON.stringify(removed.filter((id) => id !== deviceId))
        );
      }
    } catch (e) {
      console.error("[P2P] Failed to clear removed device tombstone:", e);
    }
  };

  // Load pairing code and paired devices on mount/change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const code = localStorage.getItem("kei_sync_pairing_code") || "";
      setPairingCode(code);

      const stored = getStoredPairedDevices();
      // Set all loaded devices to disconnected status initially
      const offlineList = stored.map((p) => ({ ...p, status: "disconnected" as const }));
      setConnectedPeers(offlineList);
    }
  }, [pairingCode]);

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

  // Update a device's synchronization time in the state & localStorage
  const updateDeviceSyncTime = useCallback((deviceId: string) => {
    setConnectedPeers((prev) => {
      const updated = prev.map((p) => {
        if (p.peerId === deviceId) {
          return {
            ...p,
            syncedAt: new Date(),
          };
        }
        return p;
      });
      saveStoredPairedDevices(updated);
      return updated;
    });
  }, []);

  // Main WebRTC Connection effect
  useEffect(() => {
    if (typeof window === "undefined" || !pairingCode) {
      setConnectionStatus("disconnected");
      return;
    }

    let isSubscribed = true;
    setConnectionStatus("connecting");
    const currentTransientMap = transientToPersistentMapRef.current;

    async function startTrystero() {
      try {
        console.log("[P2P] Dynamically loading Trystero library...");
        const { joinRoom } = (await import("trystero")) as any;
        const roomId = await deriveRoomId(pairingCode);
        console.log(`[P2P] Derived stable roomId: "${roomId}" for pairing code: "${pairingCode}"`);

        if (!isSubscribed) return;

        console.log(
          `[P2P] Joining Nostr-signaled room: appId="kreozalabs-kei-v1", roomId="${roomId}"`
        );
        const room = joinRoom({ appId: "kreozalabs-kei-v1" }, roomId);
        roomRef.current = room;
        console.log("[P2P] Room successfully created, listening for peer events...");

        // Define synchronization message actions
        const handshakeAction = room.makeAction("handshake");
        const watermarksAction = room.makeAction("watermarks");
        const eventsAction = room.makeAction("events");

        // Action 0: Handshake protocol to discover peer's persistent identity & name
        handshakeAction.onMessage = (data: any, { peerId }: { peerId: string }) => {
          if (data && data.deviceId) {
            console.log(`[P2P] Received handshake from peer ${peerId}:`, data);
            
            // Direct connection clears any previous removal tombstone
            removeRemovedDevice(data.deviceId);

            const alreadyMapped = transientToPersistentMapRef.current.has(peerId);
            transientToPersistentMapRef.current.set(peerId, data.deviceId);

            setConnectedPeers((prev) => {
              const exists = prev.some((p) => p.peerId === data.deviceId);
              let updated: Peer[];
              if (exists) {
                updated = prev.map((p) => {
                  if (p.peerId === data.deviceId) {
                    return {
                      ...p,
                      name: data.name || p.name,
                      connectedAt: new Date(),
                      status: "connected" as const,
                    };
                  }
                  return p;
                });
              } else {
                updated = [
                  ...prev,
                  {
                    peerId: data.deviceId,
                    name: data.name || data.deviceId,
                    connectedAt: new Date(),
                    syncedAt: new Date(),
                    status: "connected" as const,
                  },
                ];
              }

              // Merge indirect gossiped peers from peer's list
              if (Array.isArray(data.knownPeers)) {
                const myDevId = getOrCreateDeviceIdentity();
                const tombstones = getRemovedDevices();
                const mergedMap = new Map(updated.map((p) => [p.peerId, p]));

                data.knownPeers.forEach((incoming: any) => {
                  if (incoming.peerId === myDevId) return;
                  if (tombstones.includes(incoming.peerId)) return;

                  const existing = mergedMap.get(incoming.peerId);
                  if (!existing) {
                    mergedMap.set(incoming.peerId, {
                      peerId: incoming.peerId,
                      name: incoming.name,
                      connectedAt: new Date(incoming.connectedAt),
                      syncedAt: new Date(incoming.syncedAt),
                      status: "disconnected" as const,
                    });
                  } else {
                    const incomingConnected = new Date(incoming.connectedAt).getTime();
                    const existingConnected = new Date(existing.connectedAt).getTime();
                    if (incomingConnected > existingConnected) {
                      existing.name = incoming.name;
                      existing.connectedAt = new Date(incoming.connectedAt);
                      existing.syncedAt = new Date(incoming.syncedAt);
                    }
                  }
                });

                updated = Array.from(mergedMap.values());
              }

              saveStoredPairedDevices(updated);
              return updated;
            });

            setConnectionStatus("connected");

            if (!alreadyMapped) {
              toast.info("Paired device connected", {
                description: `Direct channel established with ${data.name || "paired device"}.`,
              });
              // Send back our own handshake if we haven't already
              try {
                handshakeAction.send(
                  {
                    deviceId: getOrCreateDeviceIdentity(),
                    name: getDeviceName(),
                    knownPeers: getStoredPairedDevices(),
                  },
                  { target: peerId }
                );
              } catch (e) {
                console.error("[P2P] Failed to send handshake response:", e);
              }
            }

            // Immediately query watermarks sync
            setTimeout(async () => {
              try {
                const localWatermarks = await getLocalWatermarks();
                console.log("[P2P] Handshake complete, sending watermarks:", localWatermarks);
                watermarksAction.send(localWatermarks, { target: peerId });
              } catch (err) {
                console.error("[P2P] Failed to send initial watermarks:", err);
              }
            }, 300);
          }
        };

        // Action 1: On receiving peer watermarks, calculate deltas and send missing events
        watermarksAction.onMessage = async (
          peerWatermarks: any,
          { peerId }: { peerId: string }
        ) => {
          console.log(`[P2P] Received watermarks from peer ${peerId}`);
          try {
            const missingEvents = await getEventsSince(peerWatermarks);
            if (missingEvents.length > 0) {
              console.log(`[P2P] Sending ${missingEvents.length} delta events to peer ${peerId}`);
              eventsAction.send(missingEvents, { target: peerId });
            }
            // Update syncedAt for this peer
            const devId = transientToPersistentMapRef.current.get(peerId);
            if (devId) {
              updateDeviceSyncTime(devId);
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
            // Update syncedAt for this peer
            const devId = transientToPersistentMapRef.current.get(peerId);
            if (devId) {
              updateDeviceSyncTime(devId);
            }
          } catch (err) {
            console.error("[P2P] Import of synced events failed:", err);
          }
        };

        // Monitor peer connection events
        room.onPeerJoin = (peerId: string) => {
          console.log(`[P2P] Peer joined: ${peerId}`);
          // Send handshake
          setTimeout(() => {
            try {
              console.log("[P2P] Sending initial handshake to:", peerId);
              handshakeAction.send(
                {
                  deviceId: getOrCreateDeviceIdentity(),
                  name: getDeviceName(),
                  knownPeers: getStoredPairedDevices(),
                },
                { target: peerId }
              );
            } catch (err) {
              console.error("[P2P] Failed to send handshake on join:", err);
            }
          }, 500);
        };

        room.onPeerLeave = (peerId: string) => {
          console.log(`[P2P] Peer disconnected: ${peerId}`);
          const devId = transientToPersistentMapRef.current.get(peerId);
          if (devId) {
            setConnectedPeers((prev) => {
              const updated = prev.map((p) => {
                if (p.peerId === devId) {
                  return { ...p, status: "disconnected" as const };
                }
                return p;
              });
              saveStoredPairedDevices(updated);
              return updated;
            });
            transientToPersistentMapRef.current.delete(peerId);
          }

          const activePeersCount = Array.from(transientToPersistentMapRef.current.keys()).length;
          if (activePeersCount === 0) {
            setConnectionStatus("connecting");
          }
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
      currentTransientMap.clear();
      setConnectedPeers((prev) => prev.map((p) => ({ ...p, status: "disconnected" as const })));
      setConnectionStatus("disconnected");
    };
  }, [pairingCode, updateDeviceSyncTime]);

  // Hook into local write broadcasts for live instant updates
  useEffect(() => {
    if (typeof window === "undefined" || !pairingCode) return;

    const dbChannel = new BroadcastChannel("kei_db_sync");
    dbChannelRef.current = dbChannel;

    const handleLocalWrite = async (event: MessageEvent) => {
      const { type } = event.data || {};

      const activePeers = Array.from(transientToPersistentMapRef.current.keys());
      if (type === "DB_UPDATED" && roomRef.current && activePeers.length > 0) {
        try {
          const watermarksAction = roomRef.current.makeAction("watermarks");
          const localWatermarks = await getLocalWatermarks();
          console.log(
            "[P2P] Local write detected, broadcasting updated watermarks:",
            localWatermarks
          );
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
  }, [pairingCode]);

  const pairDevice = async (code: string): Promise<boolean> => {
    const cleanedCode = code.toUpperCase().trim();
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

  const unpairDevice = (peerId?: string) => {
    if (peerId) {
      setConnectedPeers((prev) => {
        const updated = prev.filter((p) => p.peerId !== peerId);
        saveStoredPairedDevices(updated);
        return updated;
      });
      addRemovedDevice(peerId);
      toast.info("Device removed", {
        description: "The selected device has been removed.",
      });
    } else {
      localStorage.removeItem("kei_sync_pairing_code");
      localStorage.removeItem("kei_paired_devices");
      localStorage.removeItem("kei_removed_devices");
      setPairingCode("");
      setConnectedPeers([]);
      if (roomRef.current) {
        roomRef.current.leave();
        roomRef.current = null;
      }
      transientToPersistentMapRef.current.clear();
      setConnectionStatus("disconnected");
      toast.info("Device unpaired successfully", {
        description: "Local data is untouched, but syncing is now deactivated.",
      });
    }
  };

  const generatePairingCode = (): string => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
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

  const pairedDevices = (): Peer[] => {
    return connectedPeers;
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
        pairedDevices,
      }}
    >
      {children}
    </P2PContext.Provider>
  );
}
