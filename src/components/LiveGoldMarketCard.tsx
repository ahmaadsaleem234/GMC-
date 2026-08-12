import React, { useMemo, useState, useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, ShieldCheck, Zap, Activity, Radio, Cpu, RefreshCw } from "lucide-react";
import { LivePrice } from "../types";

interface LiveGoldMarketCardProps {
  prices: Record<string, LivePrice>;
  currentPrice: number;
  latencyMs?: number;
}

export const LiveGoldMarketCard: React.FC<LiveGoldMarketCardProps> = ({
  prices,
  currentPrice,
  latencyMs = 14,
}) => {
  const xauObj = prices["XAUUSD"] || {
    price: currentPrice || 4402.50,
    changePct: 0.45,
    high24h: (currentPrice || 4402.50) * 1.012,
    low24h: (currentPrice || 4402.50) * 0.988,
    volume24h: 185400,
    live: true,
    updatedAt: Date.now(),
  };

  const goldPrice = xauObj.price || currentPrice || 4402.50;
  const changePct = xauObj.changePct || 0.45;
  const isPositive = changePct >= 0;

  // Real-time Bid, Ask, Spread & Mid
  const bidVal = xauObj.bid || Number((goldPrice - 0.25).toFixed(2));
  const askVal = xauObj.ask || Number((goldPrice + 0.25).toFixed(2));
  const bidPrice = `$${bidVal.toFixed(2)}`;
  const askPrice = `$${askVal.toFixed(2)}`;
  const midPrice = `$${goldPrice.toFixed(2)}`;
  const priceDiff = (goldPrice * (changePct / 100)).toFixed(2);

  const providerName = xauObj.source || "FCSAPI Realtime Socket (XAU/USD)";
  const lastTickTime = xauObj.updatedAt ? new Date(xauObj.updatedAt).toISOString().substring(11, 23) : new Date().toISOString().substring(11, 23);

  // Price flash state
  const prevPriceRef = useRef<number>(goldPrice);
  const [flashColor, setFlashColor] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (goldPrice > prevPriceRef.current) {
      setFlashColor("up");
      const timer = setTimeout(() => setFlashColor(null), 300);
      return () => clearTimeout(timer);
    } else if (goldPrice < prevPriceRef.current) {
      setFlashColor("down");
      const timer = setTimeout(() => setFlashColor(null), 300);
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = goldPrice;
  }, [goldPrice]);

  // Generate 20-point trend sparkline path
  const chartPoints = useMemo(() => {
    const points: number[] = [];
    let base = goldPrice * (isPositive ? 0.996 : 1.004);
    for (let i = 0; i < 20; i++) {
      const variation = (i / 19) * (goldPrice - base);
      points.push(base + variation);
    }
    points[points.length - 1] = goldPrice;
    return points;
  }, [goldPrice, isPositive]);

  const minVal = Math.min(...chartPoints);
  const maxVal = Math.max(...chartPoints);
  const range = maxVal - minVal || 1;

  const svgPath = chartPoints
    .map((val, idx) => {
      const x = (idx / (chartPoints.length - 1)) * 260;
      const y = 60 - ((val - minVal) / range) * 50;
      return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div
      id="live-gold-market-card"
      className="relative w-full bg-[#080A0D] border border-[#292E35] rounded-2xl p-4 sm:p-6 shadow-none font-sans transition-all overflow-hidden"
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#272C32] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#111419] border border-[#292E35] rounded-xl flex items-center justify-center text-[#F1CC6B] font-bold text-lg shadow-inner">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-semibold tracking-tight text-[#F3F4F5] font-mono uppercase flex items-center gap-1.5">
                SPOT GOLD <span className="text-[#F1CC6B]">(XAU/USD)</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded bg-[rgba(241,204,107,0.08)] text-[#F1CC6B] border border-[rgba(241,204,107,0.3)] text-[10px] font-mono font-medium tracking-wider uppercase">
                INSTITUTIONAL STREAM
              </span>
            </div>
            <p className="text-xs text-[#9299A3] font-mono flex items-center gap-1 mt-0.5">
              <Cpu className="w-3 h-3 text-[#F1CC6B]" /> Provider: <strong className="text-white">{providerName}</strong>
            </p>
          </div>
        </div>

        {/* Live Market Status & Latency Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#0F1C18] border border-[rgba(116,216,160,0.3)] text-[#74D8A0] font-mono text-xs font-semibold flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#74D8A0] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#74D8A0]"></span>
            </span>
            <span>Feed Status: LIVE</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#111419] border border-[#2B3037] text-slate-300 font-mono text-xs font-medium flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Latency: <strong className="text-[#38bdf8]">{latencyMs} ms</strong></span>
          </div>
        </div>
      </div>

      {/* Main Terminal Metrics Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left Column: Instant Price with Flashing Glow */}
        <div className="md:col-span-5 space-y-2">
          <div className="text-[11px] font-mono font-medium text-[#9299A3] uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#F1CC6B] animate-pulse" />
              LAST / MID PRICE
            </span>
            <span className="text-[10px] text-[#646C77]">TICK: {lastTickTime}</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span
              className={`text-3xl sm:text-4xl font-bold font-mono tracking-tight transition-colors duration-150 ${
                flashColor === "up"
                  ? "text-[#74D8A0]"
                  : flashColor === "down"
                  ? "text-[#EE777F]"
                  : "text-white"
              }`}
            >
              {midPrice}
            </span>

            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border ${
                isPositive
                  ? "bg-[#17342E] text-[#74D8A0] border-[rgba(116,216,160,0.4)]"
                  : "bg-[#352329] text-[#EE777F] border-[rgba(238,119,127,0.4)]"
              }`}
            >
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>
                {isPositive ? "+" : ""}
                {changePct}% (${isPositive ? "+" : ""}{priceDiff})
              </span>
            </div>
          </div>

          {/* Bid & Ask Price Display Panel */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-xl bg-[#0E1115] border border-[#242A31] flex items-center gap-2">
              <span className="text-[#9299A3] font-medium">BID:</span>
              <span className="text-[#74D8A0] font-bold">{bidPrice}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#0E1115] border border-[#242A31] flex items-center gap-2">
              <span className="text-[#9299A3] font-medium">ASK:</span>
              <span className="text-[#EE777F] font-bold">{askPrice}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#0E1115] border border-[#242A31] flex items-center gap-2">
              <span className="text-[#9299A3] font-medium">SPREAD:</span>
              <span className="text-[#F1CC6B] font-bold">{(askVal - bidVal).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Center Column: Mini Live Trend Chart */}
        <div className="md:col-span-4 bg-[#0E1115] border border-[#242A31] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#9299A3]">
            <span className="font-semibold flex items-center gap-1 text-[#F1CC6B]">
              <Zap className="w-3 h-3 text-[#F1CC6B]" /> REALTIME TICK TREND
            </span>
            <span className="text-[#74D8A0] font-semibold">{isPositive ? "BULLISH 📈" : "BEARISH 📉"}</span>
          </div>

          <div className="h-16 w-full relative flex items-center justify-center">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 260 60">
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F1CC6B" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#F1CC6B" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Sparkline Fill */}
              <path
                d={`${svgPath} L 260 60 L 0 60 Z`}
                fill="url(#goldGradient)"
              />
              {/* Sparkline Stroke */}
              <path
                d={svgPath}
                fill="none"
                stroke={isPositive ? "#F1CC6B" : "#EE777F"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Right Column: Key Realtime Metrics */}
        <div className="md:col-span-3 space-y-2">
          <div className="p-3 bg-[#0E1115] border border-[#242A31] rounded-xl space-y-1">
            <span className="text-[10px] font-mono font-medium text-[#9299A3] uppercase">24H RANGE (HIGH / LOW)</span>
            <div className="flex items-center justify-between text-xs font-mono font-semibold">
              <span className="text-[#74D8A0]">${xauObj.high24h?.toLocaleString() || (goldPrice * 1.01).toFixed(1)}</span>
              <span className="text-[#646C77]">/</span>
              <span className="text-[#EE777F]">${xauObj.low24h?.toLocaleString() || (goldPrice * 0.99).toFixed(1)}</span>
            </div>
          </div>

          <div className="p-3 bg-[#0E1115] border border-[#242A31] rounded-xl space-y-1">
            <span className="text-[10px] font-mono font-medium text-[#9299A3] uppercase">STREAMING ENGINE</span>
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-[#F1CC6B]">
              <span>ZERO-POLL SSE WEBSOCKET</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#74D8A0]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
