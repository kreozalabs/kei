// FIXME: Refactor !
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Button, toast } from "@kreozalabs/kei-ui";
import type { Event as DBEvent } from "@kreozalabs/kei-core";
import { getLocalWatermarks, getEventsSince } from "@/db/sync";
import { importEvents } from "@/db/backup";
import { getOrCreateDeviceIdentity, getDeviceName } from "../utils/device";

interface Peer {
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

interface TrysteroRoom {
  leave: () => void;
  makeAction: (name: string) => TrysteroAction;
  onPeerJoin: (peerId: string) => void;
  onPeerLeave: (peerId: string) => void;
}

interface TrysteroAction {
  onMessage: (data: unknown, peerInfo: { peerId: string }) => void;
  send: (data: unknown, options?: { target?: string }) => void;
}

interface GossipedPeer {
  peerId: string;
  name: string;
  connectedAt: string | number | Date;
  syncedAt: string | number | Date;
}

interface HandshakeMessage {
  type?: "HANDSHAKE" | "UNPAIR_COMMAND" | "PAIRING_DECISION";
  deviceId?: string;
  name?: string;
  knownPeers?: GossipedPeer[];
  tombstones?: string[];
  targetDeviceId?: string;
  approved?: boolean;
}

interface ChallengeMessage {
  challenge: string;
}

interface ChallengeResponseMessage {
  challenge: string;
  signature: string;
}

const P2PContext = createContext<P2PContextType | undefined>(undefined);

export function useP2P() {
  const context = useContext(P2PContext);
  if (!context) {
    throw new Error("useP2P must be used within a P2PProvider");
  }
  return context;
}

// Helper to load paired devices from localStorage
const getStoredPairedDevices = (): Peer[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("kei_paired_devices");
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Record<string, unknown>[];
    return parsed.map((p) => ({
      name: String(p.name || ""),
      peerId: String(p.peerId || ""),
      connectedAt: new Date(String(p.connectedAt || "")),
      syncedAt: new Date(String(p.syncedAt || "")),
      status: (p.status as Peer["status"]) || "disconnected",
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

// Helper to derive a CryptoKey from the pairing code for HMAC challenge-response
const deriveHmacKey = async (code: string): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const cleanCode = code.toLowerCase().trim().replace(/-/g, "");
  const rawKey = encoder.encode(cleanCode);
  return await crypto.subtle.importKey("raw", rawKey, { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
};

// Helper to sign a challenge string
const signChallenge = async (key: CryptoKey, challenge: string): Promise<string> => {
  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(challenge));
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

// Helper to verify a challenge response signature
const verifyChallenge = async (
  key: CryptoKey,
  challenge: string,
  signature: string
): Promise<boolean> => {
  const encoder = new TextEncoder();
  const signatureBytes = new Uint8Array(
    signature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
  );
  return await crypto.subtle.verify("HMAC", key, signatureBytes, encoder.encode(challenge));
};

// Helper to generate a random challenge string
const generateRandomChallenge = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
};

export function P2PProvider({ children }: { children: React.ReactNode }) {
  const [pairingCode, setPairingCode] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [connectedPeers, setConnectedPeers] = useState<Peer[]>([]);

  const roomRef = useRef<TrysteroRoom | null>(null);
  const dbChannelRef = useRef<BroadcastChannel | null>(null);
  const transientToPersistentMapRef = useRef<Map<string, string>>(new Map());
  const handshakeActionRef = useRef<TrysteroAction | null>(null);
  const watermarksActionRef = useRef<TrysteroAction | null>(null);
  const eventsActionRef = useRef<TrysteroAction | null>(null);

  // Challenge-Response security refs
  const authenticatedPeersRef = useRef<Set<string>>(new Set());
  const sentChallengesRef = useRef<Map<string, string>>(new Map());

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

  const unpairDevice = useCallback((peerId?: string) => {
    if (peerId) {
      // Find transient peerId from persistent deviceId to send direct unpair command if online
      let transientId: string | undefined;
      for (const [tId, pId] of transientToPersistentMapRef.current.entries()) {
        if (pId === peerId) {
          transientId = tId;
          break;
        }
      }

      if (transientId && roomRef.current && handshakeActionRef.current) {
        try {
          handshakeActionRef.current.send(
            {
              type: "UNPAIR_COMMAND",
              targetDeviceId: peerId,
            },
            { target: transientId }
          );
        } catch (e) {
          console.error("[P2P] Failed to send direct unpair command:", e);
        }
      }

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
      localStorage.removeItem("kei_sync_role");
      localStorage.removeItem("kei_paired_devices");
      localStorage.removeItem("kei_removed_devices");
      setPairingCode("");
      setConnectedPeers([]);
      if (roomRef.current) {
        roomRef.current.leave();
        roomRef.current = null;
      }
      transientToPersistentMapRef.current.clear();
      authenticatedPeersRef.current.clear();
      sentChallengesRef.current.clear();
      setConnectionStatus("disconnected");
      toast.info("Device unpaired successfully", {
        description: "Local data is untouched, but syncing is now deactivated.",
      });
    }
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
    const currentAuthPeers = authenticatedPeersRef.current;
    const currentChallenges = sentChallengesRef.current;

    async function startTrystero() {
      try {
        console.log("[P2P] Dynamically loading Trystero library...");
        const { joinRoom } = (await import("trystero")) as {
          joinRoom: (config: { appId: string }, roomId: string) => TrysteroRoom;
        };
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
        const challengeAction = room.makeAction("challenge");
        const challengeResponseAction = room.makeAction("challenge_response");
        const handshakeAction = room.makeAction("handshake");
        const watermarksAction = room.makeAction("watermarks");
        const eventsAction = room.makeAction("events");

        handshakeActionRef.current = handshakeAction;
        watermarksActionRef.current = watermarksAction;
        eventsActionRef.current = eventsAction;

        // Challenge Action: Receives challenge from peer and signs it
        challengeAction.onMessage = async (data: unknown, { peerId }: { peerId: string }) => {
          const msg = data as ChallengeMessage;
          if (!msg || !msg.challenge) return;
          console.log(`[P2P] Received challenge from peer ${peerId}`);
          try {
            const hmacKey = await deriveHmacKey(pairingCode);
            const signature = await signChallenge(hmacKey, msg.challenge);
            console.log(`[P2P] Sending challenge response to peer ${peerId}`);
            challengeResponseAction.send(
              { challenge: msg.challenge, signature },
              { target: peerId }
            );
          } catch (err) {
            console.error("[P2P] Failed to respond to challenge:", err);
          }
        };

        // Challenge Response Action: Verifies peer's response
        challengeResponseAction.onMessage = async (
          data: unknown,
          { peerId }: { peerId: string }
        ) => {
          const msg = data as ChallengeResponseMessage;
          if (!msg || !msg.challenge || !msg.signature) return;
          console.log(`[P2P] Received challenge response from peer ${peerId}`);
          try {
            const expectedChallenge = sentChallengesRef.current.get(peerId);
            if (!expectedChallenge || expectedChallenge !== msg.challenge) {
              console.warn(`[P2P] Challenge mismatch for peer ${peerId}`);
              return;
            }

            const hmacKey = await deriveHmacKey(pairingCode);
            const isValid = await verifyChallenge(hmacKey, msg.challenge, msg.signature);
            if (isValid) {
              console.log(`[P2P] Challenge verification succeeded for peer ${peerId}`);
              authenticatedPeersRef.current.add(peerId);

              // Now we can send our handshake safely
              console.log(`[P2P] Sending handshake to authenticated peer ${peerId}`);
              handshakeAction.send(
                {
                  type: "HANDSHAKE",
                  deviceId: getOrCreateDeviceIdentity(),
                  name: getDeviceName(),
                  knownPeers: getStoredPairedDevices(),
                  tombstones: getRemovedDevices(),
                },
                { target: peerId }
              );
            } else {
              console.warn(`[P2P] Challenge signature verification failed for peer ${peerId}`);
              toast.error("Security Warning", {
                description: "An unauthorized device tried to connect using an invalid key.",
              });
            }
          } catch (err) {
            console.error("[P2P] Verification of challenge response failed:", err);
          }
        };

        // Action 0: Handshake protocol to discover peer's persistent identity & name
        handshakeAction.onMessage = (data: unknown, { peerId }: { peerId: string }) => {
          const msg = data as HandshakeMessage;
          if (!msg) return;

          // Only accept handshakes from cryptographically authenticated peers
          if (!authenticatedPeersRef.current.has(peerId)) {
            console.warn(`[P2P] Ignored handshake from unauthenticated peer ${peerId}`);
            return;
          }

          // Check if it is a direct unpair command from a peer
          if (msg.type === "UNPAIR_COMMAND" && msg.targetDeviceId === getOrCreateDeviceIdentity()) {
            console.warn("[P2P] Received direct unpair command from peer. Unpairing...");
            unpairDevice();
            toast.error("Removed from Sync Chain", {
              description: "This device was removed from the sync chain by another device.",
            });
            return;
          }

          // Check if it is a pairing decision response
          if (msg.type === "PAIRING_DECISION") {
            const role = localStorage.getItem("kei_sync_role") || "";
            if (role === "joiner") {
              if (msg.approved) {
                console.log(`[P2P] Pairing request approved by peer ${msg.name} (${msg.deviceId})`);

                // Add the device to our paired list
                setConnectedPeers((prev) => {
                  const exists = prev.some((p) => p.peerId === msg.deviceId);
                  if (exists) return prev;
                  const updated = [
                    ...prev,
                    {
                      peerId: msg.deviceId!,
                      name: msg.name || msg.deviceId!,
                      connectedAt: new Date(),
                      syncedAt: new Date(),
                      status: "connected" as const,
                    },
                  ];
                  saveStoredPairedDevices(updated);
                  return updated;
                });

                localStorage.setItem("kei_sync_role", "paired");
                toast.success("Pairing approved!", {
                  description: `Connected to ${msg.name || "paired device"}.`,
                });

                // Immediately query watermarks sync
                setTimeout(async () => {
                  try {
                    const localWatermarks = await getLocalWatermarks();
                    console.log(
                      "[P2P] Pairing approved, sending initial watermarks:",
                      localWatermarks
                    );
                    watermarksAction.send(localWatermarks, { target: peerId });
                  } catch (err) {
                    console.error("[P2P] Failed to send initial watermarks:", err);
                  }
                }, 300);
              } else {
                console.warn("[P2P] Pairing request denied by the peer.");
                toast.error("Pairing Denied", {
                  description: "The pairing request was rejected by the other device.",
                });
                unpairDevice();
              }
            }
            return;
          }

          if (msg.deviceId) {
            console.log(`[P2P] Received handshake from peer ${peerId}:`, msg);

            // Direct connection clears any previous removal tombstone
            removeRemovedDevice(msg.deviceId);

            const alreadyMapped = transientToPersistentMapRef.current.has(peerId);
            transientToPersistentMapRef.current.set(peerId, msg.deviceId);

            const myDevId = getOrCreateDeviceIdentity();

            // First check if our own device ID is in the incoming tombstone list
            if (Array.isArray(msg.tombstones) && msg.tombstones.includes(myDevId)) {
              console.warn(
                "[P2P] This device has been removed from the sync chain by a peer. Unpairing..."
              );
              unpairDevice();
              toast.error("Removed from Sync Chain", {
                description: "This device was removed from the sync chain by another device.",
              });
              return;
            }

            // Merge incoming tombstones into our local removed devices list
            if (Array.isArray(msg.tombstones)) {
              const localTombstones = getRemovedDevices();
              msg.tombstones.forEach((tId: string) => {
                if (!localTombstones.includes(tId)) {
                  addRemovedDevice(tId);
                }
              });
            }

            // Verify if already paired
            const storedDevices = getStoredPairedDevices();
            const isAlreadyPaired = storedDevices.some((p) => p.peerId === msg.deviceId);

            if (!isAlreadyPaired) {
              const role = localStorage.getItem("kei_sync_role") || "";
              if (role === "generator") {
                console.log(
                  `[P2P] Showing pairing request for device ${msg.name} (${msg.deviceId})`
                );

                toast.custom(
                  (t) => (
                    <div className="border-border bg-background animate-in fade-in slide-in-from-bottom-4 flex w-80 flex-col gap-3 rounded-2xl border p-4 text-left shadow-lg duration-300 md:w-96">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-foreground text-sm font-semibold">Pairing Request</h3>
                        <p className="text-muted-foreground text-xs">
                          Device <strong>{msg.name || "Unknown Device"}</strong> is requesting to
                          join your sync chain.
                        </p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            toast.dismiss(t);
                            try {
                              handshakeAction.send(
                                {
                                  type: "PAIRING_DECISION",
                                  approved: false,
                                },
                                { target: peerId }
                              );
                            } catch (e) {
                              console.error("[P2P] Failed to send pairing denial:", e);
                            }
                          }}
                          className="border-border/50 hover:bg-muted text-foreground rounded-xl px-3 py-1 text-xs"
                        >
                          Deny
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            toast.dismiss(t);
                            setConnectedPeers((prev) => {
                              const exists = prev.some((p) => p.peerId === msg.deviceId);
                              if (exists) return prev;
                              const updated = [
                                ...prev,
                                {
                                  peerId: msg.deviceId!,
                                  name: msg.name || msg.deviceId!,
                                  connectedAt: new Date(),
                                  syncedAt: new Date(),
                                  status: "connected" as const,
                                },
                              ];
                              saveStoredPairedDevices(updated);
                              return updated;
                            });

                            toast.success("Pairing approved", {
                              description: `Device ${msg.name} is now connected.`,
                            });

                            try {
                              handshakeAction.send(
                                {
                                  type: "PAIRING_DECISION",
                                  approved: true,
                                  deviceId: myDevId,
                                  name: getDeviceName(),
                                },
                                { target: peerId }
                              );
                            } catch (e) {
                              console.error("[P2P] Failed to send pairing approval:", e);
                            }

                            // Immediately query watermarks sync
                            setTimeout(async () => {
                              try {
                                const localWatermarks = await getLocalWatermarks();
                                watermarksAction.send(localWatermarks, { target: peerId });
                              } catch (err) {
                                console.error("[P2P] Failed to send initial watermarks:", err);
                              }
                            }, 300);
                          }}
                          className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl px-3 py-1 text-xs"
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ),
                  {
                    duration: Infinity,
                  }
                );
              } else {
                console.log(
                  `[P2P] Device ${msg.name} is not paired, and we are not the generator. Ignoring.`
                );
              }
              return;
            }

            setConnectedPeers((prev) => {
              const currentTombstones = getRemovedDevices();

              // Filter out any peers that are now tombstoned
              const filteredPrev = prev.filter((p) => !currentTombstones.includes(p.peerId));

              const exists = filteredPrev.some((p) => p.peerId === msg.deviceId);
              let updated: Peer[];
              if (exists) {
                updated = filteredPrev.map((p) => {
                  if (p.peerId === msg.deviceId) {
                    return {
                      ...p,
                      name: msg.name || p.name,
                      connectedAt: new Date(),
                      status: "connected" as const,
                    };
                  }
                  return p;
                });
              } else {
                updated = [
                  ...filteredPrev,
                  {
                    peerId: msg.deviceId!,
                    name: msg.name || msg.deviceId!,
                    connectedAt: new Date(),
                    syncedAt: new Date(),
                    status: "connected" as const,
                  },
                ];
              }

              // Merge indirect gossiped peers from peer's list
              if (Array.isArray(msg.knownPeers)) {
                const mergedMap = new Map(updated.map((p) => [p.peerId, p]));

                msg.knownPeers.forEach((incoming) => {
                  if (incoming.peerId === myDevId) return;
                  if (currentTombstones.includes(incoming.peerId)) return;

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
              console.log(
                `[P2P] Paired device connected: Direct channel established with ${msg.name || "paired device"}.`
              );
              // Send back our own handshake if we haven't already
              try {
                handshakeAction.send(
                  {
                    type: "HANDSHAKE",
                    deviceId: getOrCreateDeviceIdentity(),
                    name: getDeviceName(),
                    knownPeers: getStoredPairedDevices(),
                    tombstones: getRemovedDevices(),
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
          peerWatermarks: unknown,
          { peerId }: { peerId: string }
        ) => {
          const watermarks = peerWatermarks as Record<string, number>;
          console.log(`[P2P] Received watermarks from peer ${peerId}:`, watermarks);

          const devId = transientToPersistentMapRef.current.get(peerId);
          const storedDevices = getStoredPairedDevices();
          const isPaired = storedDevices.some((p) => p.peerId === devId);

          if (!authenticatedPeersRef.current.has(peerId) || !isPaired) {
            console.warn(`[P2P] Ignored watermarks from unauthenticated/unpaired peer ${peerId}`);
            return;
          }

          try {
            const localWatermarks = await getLocalWatermarks();

            // 1. Check if the local device is missing any events that the peer has
            let localIsMissingEvents = false;
            for (const dId in watermarks) {
              const peerSeq = watermarks[dId] || 0;
              const localSeq = localWatermarks[dId] || 0;
              if (peerSeq > localSeq) {
                localIsMissingEvents = true;
                break;
              }
            }

            if (localIsMissingEvents) {
              console.log(
                `[P2P] Local device is behind peer ${peerId}. Requesting updates by sending local watermarks:`,
                localWatermarks
              );
              watermarksAction.send(localWatermarks, { target: peerId });
            }

            // 2. Check if the peer is missing any events that we have
            const missingEvents = await getEventsSince(watermarks);
            console.log(
              `[P2P] Delta computation: peer ${peerId} is missing ${missingEvents.length} events:`,
              missingEvents
            );
            if (missingEvents.length > 0) {
              console.log(`[P2P] Sending ${missingEvents.length} delta events to peer ${peerId}`);
              eventsAction.send(missingEvents, { target: peerId });
            }
            // Update syncedAt for this peer
            if (devId) {
              updateDeviceSyncTime(devId);
            }
          } catch (err) {
            console.error("[P2P] Delta computation failed:", err);
          }
        };

        // Action 2: On receiving peer events, bulk import them
        eventsAction.onMessage = async (
          receivedEvents: unknown,
          { peerId }: { peerId: string }
        ) => {
          const events = receivedEvents as DBEvent[];
          console.log(`[P2P] Received ${events?.length} events from peer ${peerId}:`, events);

          const devId = transientToPersistentMapRef.current.get(peerId);
          const storedDevices = getStoredPairedDevices();
          const isPaired = storedDevices.some((p) => p.peerId === devId);

          if (!authenticatedPeersRef.current.has(peerId) || !isPaired) {
            console.warn(`[P2P] Ignored events from unauthenticated/unpaired peer ${peerId}`);
            return;
          }

          try {
            const imported = await importEvents(events);
            console.log(`[P2P] Import complete. Successfully imported ${imported} events.`);
            // Update syncedAt for this peer
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
          setTimeout(() => {
            try {
              const challenge = generateRandomChallenge();
              sentChallengesRef.current.set(peerId, challenge);
              console.log(`[P2P] Sending initial challenge to peer: ${peerId}`);
              challengeAction.send({ challenge }, { target: peerId });
            } catch (err) {
              console.error("[P2P] Failed to send challenge on join:", err);
            }
          }, 500);
        };

        room.onPeerLeave = (peerId: string) => {
          console.log(`[P2P] Peer disconnected: ${peerId}`);
          authenticatedPeersRef.current.delete(peerId);
          sentChallengesRef.current.delete(peerId);

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
      handshakeActionRef.current = null;
      watermarksActionRef.current = null;
      eventsActionRef.current = null;
      currentTransientMap.clear();
      currentAuthPeers.clear();
      currentChallenges.clear();
      setConnectedPeers((prev) => prev.map((p) => ({ ...p, status: "disconnected" as const })));
      setConnectionStatus("disconnected");
    };
  }, [pairingCode, updateDeviceSyncTime, unpairDevice]);

  // Hook into local write broadcasts for live instant updates
  useEffect(() => {
    if (typeof window === "undefined" || !pairingCode) return;

    const dbChannel = new BroadcastChannel("kei_db_sync");
    dbChannelRef.current = dbChannel;

    const triggerSync = async () => {
      const activePeers = Array.from(transientToPersistentMapRef.current.keys());
      if (roomRef.current && watermarksActionRef.current && activePeers.length > 0) {
        try {
          const localWatermarks = await getLocalWatermarks();
          console.log(
            "[P2P] Local write detected, broadcasting updated watermarks:",
            localWatermarks
          );
          watermarksActionRef.current.send(localWatermarks);
        } catch (err) {
          console.error("[P2P] Failed to broadcast write update:", err);
        }
      }
    };

    const handleMessageEvent = async (event: MessageEvent) => {
      const { type } = event.data || {};
      if (type === "DB_UPDATED") {
        await triggerSync();
      }
    };

    const handleCustomEvent = async (event: globalThis.Event) => {
      const customEvent = event as globalThis.CustomEvent;
      const { type } = (customEvent.detail || {}) as { type?: string };
      if (type === "DB_UPDATED") {
        await triggerSync();
      }
    };

    dbChannel.addEventListener("message", handleMessageEvent);
    window.addEventListener("kei_db_sync_local", handleCustomEvent);

    return () => {
      dbChannel.removeEventListener("message", handleMessageEvent);
      window.removeEventListener("kei_db_sync_local", handleCustomEvent);
      dbChannel.close();
    };
  }, [pairingCode]);

  const pairDevice = async (code: string): Promise<boolean> => {
    const cleanedCode = code.toUpperCase().trim();
    if (!/^[A-Z0-9]{3,4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(cleanedCode)) {
      toast.error("Invalid pairing code format", {
        description: "Please enter a code in the format: KEI-XXXX-XXXX-XXXX",
      });
      return false;
    }

    localStorage.setItem("kei_sync_pairing_code", cleanedCode);
    localStorage.setItem("kei_sync_role", "joiner");
    setPairingCode(cleanedCode);
    toast.success("Pairing credentials set", {
      description: "Establishing secure connection to your paired device...",
    });
    return true;
  };

  const generatePairingCode = (): string => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const genBlock = (length: number) =>
      Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const code = `KEI-${genBlock(4)}-${genBlock(4)}-${genBlock(4)}`;

    localStorage.setItem("kei_sync_pairing_code", code);
    localStorage.setItem("kei_sync_role", "generator");
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
