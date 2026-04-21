/**
 * G.A.N.E — Collab Session Key Management (client hook)
 * =======================================================
 * In-memory holder for the AES-GCM-256 session key used by
 * `EncryptedTransport`. Does NOT persist to localStorage — losing the
 * key on tab close is the correct security default. Peers obtain the
 * same key via:
 *   1. Passphrase derivation (deriveSessionKeyFromPassphrase), shared
 *      out-of-band (QR, share sheet, voice channel); or
 *   2. ECDH handshake over the signaling channel (follow-up).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  deriveSessionKeyFromPassphrase,
  exportSessionKey,
  generateSessionKey,
  importSessionKey,
} from "@shared/contracts/e2eEncryption";

export interface CollabSessionKeyApi {
  /** True once a key is present. */
  isSet: boolean;
  /** Raw CryptoKey for passing into EncryptedTransport.setSessionKey. */
  key: CryptoKey | null;
  /** Generate a fresh random AES-256 key. Returns its base64url export. */
  generate(): Promise<string>;
  /** Import a base64url-encoded raw key, e.g. scanned from QR. */
  importFromBase64(b64: string): Promise<void>;
  /** Derive a key from a shared passphrase (convenience wrapper). */
  deriveFromPassphrase(passphrase: string, salt: Uint8Array): Promise<void>;
  /** Wipe the key from memory. */
  clear(): void;
  /** Export the current key to base64url (for QR / copy-paste). */
  exportToBase64(): Promise<string | null>;
}

export function useCollabSessionKey(): CollabSessionKeyApi {
  const [key, setKey] = useState<CryptoKey | null>(null);
  // Hold the latest key in a ref so exportToBase64 can read it without a
  // stale closure after a rapid generate→export call.
  const keyRef = useRef<CryptoKey | null>(null);

  useEffect(() => {
    keyRef.current = key;
  }, [key]);

  const generate = useCallback(async () => {
    const fresh = await generateSessionKey();
    setKey(fresh);
    keyRef.current = fresh;
    return exportSessionKey(fresh);
  }, []);

  const importFromBase64 = useCallback(async (b64: string) => {
    const k = await importSessionKey(b64);
    setKey(k);
    keyRef.current = k;
  }, []);

  const deriveFromPassphrase = useCallback(
    async (passphrase: string, salt: Uint8Array) => {
      const k = await deriveSessionKeyFromPassphrase(passphrase, salt);
      setKey(k);
      keyRef.current = k;
    },
    [],
  );

  const clear = useCallback(() => {
    setKey(null);
    keyRef.current = null;
  }, []);

  const exportToBase64 = useCallback(async () => {
    const k = keyRef.current;
    if (!k) return null;
    return exportSessionKey(k);
  }, []);

  return {
    isSet: key !== null,
    key,
    generate,
    importFromBase64,
    deriveFromPassphrase,
    clear,
    exportToBase64,
  };
}
