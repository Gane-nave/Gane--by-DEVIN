import React, { useEffect } from 'react';
import { useGaneStore } from './store/navStore';
import { QuantumBoot } from './components/QuantumBoot';
import { NavigationMap } from './components/NavigationMap';
import { NavigationHUD } from './components/NavigationHUD';
import { Sidebar } from './components/Sidebar';
import { SmartPanel } from './components/SmartPanel';
import { TrustHUD } from './ui/trust-hud/TrustHUD';
import { SafetyUXOverlay } from './ui/safety-ux/SafetyUXOverlay';
import { auth, saveUser, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { cn } from './lib/utils';

// Error handling helper
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: any[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // Don't throw to crash the app, just log it for now
}

function App() {
  const { isBooted, isRTL, user, setUser, setAuthReady, startTelemetry, stopTelemetry, bioData } = useGaneStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      if (currentUser) {
        saveUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [setUser, setAuthReady]);

  useEffect(() => {
    if (isBooted) {
      startTelemetry();
      return () => stopTelemetry();
    }
  }, [isBooted, startTelemetry, stopTelemetry]);

  return (
    <div className={cn(
      "relative w-full h-screen overflow-hidden font-sans transition-colors duration-1000",
      bioData?.active_zen ? "bg-[#064e3b]" : "bg-intelligence-bg", // Zen mode background
      isRTL ? "rtl" : "ltr"
    )} dir={isRTL ? "rtl" : "ltr"}>
      {!isBooted && <QuantumBoot />}
      
      {isBooted && (
        <>
          {/* Base Layer: Map */}
          <div className="absolute inset-0 z-0">
            <NavigationMap />
            <div className="vignette-overlay" />
            <div className={cn(
              "absolute inset-0 pointer-events-none transition-colors duration-1000",
              bioData?.active_zen ? "bg-[#10B981]/10 mix-blend-overlay" : "scanlines"
            )} />
          </div>

          <TrustHUD />

          {/* Interaction Layer: HUD & Controls */}
          <SafetyUXOverlay />
          <NavigationHUD />
          <Sidebar />
          <SmartPanel />
        </>
      )}
    </div>
  );
}

export default App;
