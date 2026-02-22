"use client";

import { useEffect, useState } from "react";
import styles from "./InstallButton.module.css";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Extend window type for our global prompt store
declare global {
  interface Window {
    __pwaPrompt: BeforeInstallPromptEvent | null;
  }
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Already running as standalone PWA?
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // ✅ Key fix: read the globally captured prompt
    // The inline script in layout.tsx stores it before React even mounts,
    // so we never miss the event even if Chrome fires it very early.
    if (window.__pwaPrompt) {
      setDeferredPrompt(window.__pwaPrompt);
    }

    // Also listen for the custom event fired by the inline script
    const onPromptReady = () => {
      if (window.__pwaPrompt) {
        setDeferredPrompt(window.__pwaPrompt);
      }
    };

    // And the standard event (in case it fires after mount)
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      window.__pwaPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__pwaPrompt = null;
    };

    window.addEventListener("pwa-prompt-ready", onPromptReady);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("pwa-prompt-ready", onPromptReady);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    window.__pwaPrompt = null;
  };

  if (!deferredPrompt || isInstalled) return null;

  return (
    <button
      id="pwa-install-button"
      className={styles.button}
      onClick={handleInstallClick}
      aria-label="Install FlowShare app"
      title="Install FlowShare"
    >
      <span className={styles.icon}>⬇</span>
      <span className={styles.label}>Install App</span>
    </button>
  );
}
