import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    const goOffline = () => { setOnline(false); setShowBack(false); };
    const goOnline = () => { setOnline(true); setShowBack(true); setTimeout(() => setShowBack(false), 3000); };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => { window.removeEventListener("offline", goOffline); window.removeEventListener("online", goOnline); };
  }, []);

  if (online && !showBack) return null;

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-sm font-medium transition-all ${
      online ? "bg-emerald-600 text-white" : "bg-gray-900 text-white"
    }`}>
      {online
        ? <><Wifi className="h-4 w-4" /> Back online</>
        : <><WifiOff className="h-4 w-4" /> You're offline — showing saved content</>
      }
    </div>
  );
}