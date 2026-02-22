"use client";

import { useEffect, useState } from "react";
import styles from "./InstallButton.module.css";

// Extend Event to include the PWA install-prompt API
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // If already running as a standalone PWA, skip everything
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // prevent the mini-infobar from appearing
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    // Always clear the prompt after it has been used
    setDeferredPrompt(null);
  };

  // Render nothing if no prompt is available or the app is already installed
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
