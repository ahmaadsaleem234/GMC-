import React, { useEffect } from "react";

interface InstitutionalTelegramBroadcasterProps {
  currentPrice: number;
  assetKey: string;
}

/**
 * InstitutionalTelegramBroadcaster
 * 
 * NOTE: Signal generation and Telegram dispatching are handled 24/7 strictly by
 * the backend server engine in server.ts. This client-side component maintains zero
 * dispatch responsibility to guarantee that opening or refreshing the browser tab
 * has ZERO connection with generating or sending trades.
 */
export const InstitutionalTelegramBroadcaster: React.FC<InstitutionalTelegramBroadcasterProps> = () => {
  useEffect(() => {
    // Passive telemetry ping to keep client state synchronized with server status
    fetch("/api/telegram/status").catch(() => {});
  }, []);

  return null; // Silent component
};

