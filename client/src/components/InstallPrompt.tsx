import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Share, Plus } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || 
                               (window.navigator as any).standalone === true;

    setIsIOS(isIOSDevice);
    setIsStandalone(isInStandaloneMode);

    const installed = localStorage.getItem("pwa-installed") === "true";
    setIsInstalled(installed || isInStandaloneMode);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      localStorage.setItem("pwa-installed", "true");
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      localStorage.setItem("pwa-installed", "true");
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  if (isInstalled || isStandalone) {
    return null;
  }

  const showInstallButton = isIOS || deferredPrompt !== null;

  if (!showInstallButton) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleInstallClick}
        data-testid="button-install-app"
        title="Install App"
      >
        <Download className="h-5 w-5" />
      </Button>

      <Dialog open={showIOSInstructions} onOpenChange={setShowIOSInstructions}>
        <DialogContent data-testid="dialog-ios-install">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Install Up North Fitness</DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p className="text-base">To install this app on your iPhone or iPad:</p>
              
              <ol className="space-y-3 text-base">
                <li className="flex items-start gap-3">
                  <span className="font-semibold min-w-6">1.</span>
                  <span className="flex items-center gap-2">
                    Tap the <Share className="h-4 w-4 inline" /> Share button at the bottom of Safari
                  </span>
                </li>
                
                <li className="flex items-start gap-3">
                  <span className="font-semibold min-w-6">2.</span>
                  <span className="flex items-center gap-2">
                    Scroll down and tap <Plus className="h-4 w-4 inline" /> "Add to Home Screen"
                  </span>
                </li>
                
                <li className="flex items-start gap-3">
                  <span className="font-semibold min-w-6">3.</span>
                  <span>Tap "Add" in the top right corner</span>
                </li>
              </ol>

              <div className="bg-muted p-4 rounded-md mt-4">
                <p className="text-sm text-muted-foreground">
                  The app will appear on your home screen and work just like a native app!
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
