import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Radio,
  ExternalLink,
  Volume2,
  VolumeX,
  X,
  Shield,
  Zap,
} from "lucide-react";
import { LiveAlertNotification } from "../../types/setupLifecycle";

interface LiveAlertsDrawerProps {
  onInspectSetup?: (setupId: string) => void;
}

export const LiveAlertsDrawer: React.FC<LiveAlertsDrawerProps> = ({ onInspectSetup }) => {
  const [alerts, setAlerts] = useState<LiveAlertNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [latestToast, setLatestToast] = useState<LiveAlertNotification | null>(null);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/warroom/alerts?limit=25");
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.alerts)) {
          const prevAlerts = alerts;
          setAlerts(data.alerts);
          const unread = data.alerts.filter((a: LiveAlertNotification) => !a.read).length;
          setUnreadCount(unread);

          // Check if there is a brand new alert
          if (prevAlerts.length > 0 && data.alerts.length > 0 && prevAlerts[0].id !== data.alerts[0].id) {
            const newest = data.alerts[0];
            setLatestToast(newest);
            setTimeout(() => setLatestToast(null), 6000);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to fetch live alerts:", err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    for (const a of alerts) {
      if (!a.read) {
        fetch(`/api/warroom/alerts/${encodeURIComponent(a.id)}/read`, { method: "POST" }).catch(() => {});
      }
    }
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    setUnreadCount(0);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "SUCCESS":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "WARNING":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "CRITICAL":
        return <XCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />;
    }
  };

  return (
    <>
      {/* Toast Notification for real-time events */}
      {latestToast && (
        <div
          id="live-alert-toast"
          className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-amber-500/50 shadow-2xl rounded-2xl p-4 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white font-mono">{latestToast.title}</div>
                <div className="text-[11px] text-zinc-300 mt-1 leading-snug">{latestToast.message}</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-1.5 flex items-center gap-2">
                  <span>{latestToast.timestampFormatted}</span>
                  {latestToast.telegramSent && (
                    <span className="text-sky-400 font-bold">TG Synced</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setLatestToast(null)}
              className="text-zinc-500 hover:text-zinc-300 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Bell Trigger */}
      <button
        id="open-live-alerts-drawer-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-amber-400 rounded-xl shadow-lg transition-all"
        title="Live Setup Alerts Engine"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-amber-500 text-zinc-950 font-black text-[10px] rounded-full shadow animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div
            id="live-alerts-drawer-panel"
            className="bg-zinc-950 border-l border-zinc-800 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
          >
            {/* Header */}
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Live Alert Dispatcher</h3>
                  <p className="text-[10px] text-zinc-400 font-mono">Idempotent Real-Time Engine</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={markAllRead}
                  className="text-xs text-zinc-400 hover:text-amber-400 font-medium px-2 py-1 bg-zinc-800 rounded"
                >
                  Mark read
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {alerts.length === 0 ? (
                <div className="py-16 text-center text-zinc-500 text-xs font-mono">
                  No alerts dispatched in the current session.
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      alert.read
                        ? "bg-zinc-900/40 border-zinc-800/80 opacity-80"
                        : "bg-zinc-900 border-zinc-700 shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {getSeverityIcon(alert.severity)}
                        <span className="font-bold text-xs text-white">{alert.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">{alert.timestampFormatted}</span>
                    </div>

                    <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">{alert.message}</p>

                    <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-amber-400 font-bold">{alert.setupId}</span>
                      {onInspectSetup && (
                        <button
                          onClick={() => {
                            onInspectSetup(alert.setupId);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1 text-zinc-400 hover:text-amber-400 transition"
                        >
                          <span>Inspect</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
