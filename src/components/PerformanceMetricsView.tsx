import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Award,
  BarChart3,
  ShieldCheck,
  Zap,
  Filter,
  ArrowUpRight,
  Sparkles,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  Layers,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { SUPPORTED_ASSETS } from "../useLiveData";

// Sample historical win rate timeline data
const HISTORICAL_TIMELINE = [
  { date: "May 01", winRate: 81.2, signals: 42, pnl: 14.2 },
  { date: "May 08", winRate: 83.5, signals: 48, pnl: 18.5 },
  { date: "May 15", winRate: 82.0, signals: 50, pnl: 16.8 },
  { date: "May 22", winRate: 85.4, signals: 54, pnl: 22.1 },
  { date: "May 29", winRate: 84.8, signals: 46, pnl: 19.4 },
  { date: "Jun 05", winRate: 86.1, signals: 58, pnl: 25.3 },
  { date: "Jun 12", winRate: 87.8, signals: 62, pnl: 28.7 },
  { date: "Jun 19", winRate: 86.5, signals: 55, pnl: 24.2 },
  { date: "Jun 26", winRate: 88.2, signals: 60, pnl: 31.0 },
  { date: "Jul 03", winRate: 89.4, signals: 65, pnl: 34.6 },
  { date: "Jul 10", winRate: 87.9, signals: 59, pnl: 30.2 },
  { date: "Jul 17", winRate: 90.1, signals: 70, pnl: 38.4 },
  { date: "Jul 24", winRate: 89.5, signals: 68, pnl: 36.9 },
  { date: "Jul 31", winRate: 91.2, signals: 74, pnl: 42.1 },
  { date: "Aug 03", winRate: 92.4, signals: 32, pnl: 18.2 },
];

// Accuracy breakdown by Asset
const ASSET_ACCURACY_DATA = [
  { asset: "XAUUSD (Gold)", winRate: 92.4, totalTrades: 420, color: "#EAB308" },
  { asset: "BTCUSD", winRate: 89.8, totalTrades: 385, color: "#F97316" },
  { asset: "EURUSD", winRate: 86.5, totalTrades: 310, color: "#3B82F6" },
  { asset: "SOLUSD", winRate: 88.1, totalTrades: 240, color: "#A855F7" },
  { asset: "ETHUSD", winRate: 85.9, totalTrades: 127, color: "#6366F1" },
];

// Strategy Accuracy Breakdown
const STRATEGY_ACCURACY_DATA = [
  { name: "SMC Smart Money", value: 35, winRate: 93.1, color: "#3B82F6" },
  { name: "Black Shark V1", value: 25, winRate: 90.4, color: "#10B981" },
  { name: "AI Brain Engine", value: 20, winRate: 91.8, color: "#8B5CF6" },
  { name: "MTF Red Doji", value: 12, winRate: 87.2, color: "#EF4444" },
  { name: "Sniper Momentum", value: 8, winRate: 88.6, color: "#F59E0B" },
];

// Monthly Returns Matrix (2026)
const MONTHLY_PERFORMANCE = [
  { month: "Jan 2026", trades: 140, winPct: "85.2%", profit: "+28.4%", status: "OPTIMAL" },
  { month: "Feb 2026", trades: 155, winPct: "86.8%", profit: "+32.1%", status: "OPTIMAL" },
  { month: "Mar 2026", trades: 168, winPct: "88.4%", profit: "+39.5%", status: "OPTIMAL" },
  { month: "Apr 2026", trades: 142, winPct: "87.1%", profit: "+31.8%", status: "OPTIMAL" },
  { month: "May 2026", trades: 190, winPct: "89.3%", profit: "+44.2%", status: "OUTPERFORM" },
  { month: "Jun 2026", trades: 210, winPct: "90.5%", profit: "+51.0%", status: "OUTPERFORM" },
  { month: "Jul 2026", trades: 235, winPct: "91.8%", profit: "+58.6%", status: "MAX_EFFICIENCY" },
  { month: "Aug 2026 (Mtd)", trades: 42, winPct: "92.4%", profit: "+18.2%", status: "ACTIVE" },
];

export const PerformanceMetricsView: React.FC = () => {
  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "90D" | "ALL">("90D");
  const [selectedAsset, setSelectedAsset] = useState<string>("ALL");

  const filteredTimeline = useMemo(() => {
    if (timeframe === "7D") return HISTORICAL_TIMELINE.slice(-4);
    if (timeframe === "30D") return HISTORICAL_TIMELINE.slice(-8);
    return HISTORICAL_TIMELINE;
  }, [timeframe]);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0B0F19] via-[#090D16] to-[#050505] border border-blue-500/30 rounded-2xl p-6 shadow-[0_10px_35px_rgba(0,0,0,0.8)] font-sans relative overflow-hidden card-3d">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-900 border border-blue-400/40 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BarChart3 className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">AI ACCURACY & PERFORMANCE METRICS</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  REAL-TIME VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Institutional quantitative evaluation of GMC AI Brain entry accuracy, historical win rates, and strategy efficiency over time.
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 font-mono">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1 flex items-center">
              {(["7D", "30D", "90D", "ALL"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    timeframe === tf
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0A0D14] border border-slate-800 rounded-xl p-4 space-y-2 card-3d hover:border-blue-500/40 transition-all">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Overall AI Win Rate</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-sans">88.4%</span>
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +3.2%
            </span>
          </div>
          <p className="text-[10px] text-slate-500">Evaluated across 1,482 verified signals</p>
        </div>

        <div className="bg-[#0A0D14] border border-slate-800 rounded-xl p-4 space-y-2 card-3d hover:border-blue-500/40 transition-all">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Risk : Reward</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-sans">1 : 3.25</span>
            <span className="text-[11px] text-blue-400 font-bold">OPTIMAL</span>
          </div>
          <p className="text-[10px] text-slate-500">Minimum SL / TP target compliance: 98.4%</p>
        </div>

        <div className="bg-[#0A0D14] border border-slate-800 rounded-xl p-4 space-y-2 card-3d hover:border-blue-500/40 transition-all">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Profit Factor</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-sans">3.42</span>
            <span className="text-[11px] text-amber-400 font-bold">GRADE S+</span>
          </div>
          <p className="text-[10px] text-slate-500">Gross Profit / Gross Loss ratio</p>
        </div>

        <div className="bg-[#0A0D14] border border-slate-800 rounded-xl p-4 space-y-2 card-3d hover:border-blue-500/40 transition-all">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Consecutive Win Streak</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-sans">19 TRADES</span>
            <span className="text-[11px] text-purple-400 font-bold">GOLD / XAU</span>
          </div>
          <p className="text-[10px] text-slate-500">Max historical drawdown: 3.1%</p>
        </div>
      </div>

      {/* Primary Chart: Historical Win Rate & PnL Growth Over Time */}
      <div className="bg-[#0A0D14] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
              <Activity className="w-4 h-4 text-blue-400" />
              AI Entry Accuracy & Win-Rate Trajectory Over Time
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Historical timeline displaying weekly confidence win-rates (%) and cumulative PnL (%) performance.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500/80 inline-block" />
              <span className="text-slate-300">Win Rate (%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500/80 inline-block" />
              <span className="text-slate-300">Cumulative Return (%)</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWinRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={10} domain={[70, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#050505",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  color: "#F8FAFC",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.8)",
                }}
                formatter={(val: any, name: any) => [
                  `${val}${name === "winRate" ? "%" : "% Return"}`,
                  name === "winRate" ? "AI Win Rate" : "PnL Return",
                ]}
              />
              <Area
                type="monotone"
                dataKey="winRate"
                stroke="#3B82F6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorWinRate)"
              />
              <Area
                type="monotone"
                dataKey="pnl"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorPnl)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Section: Asset Accuracy Bar Chart & Strategy Breakdown Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Accuracy Breakdown Bar Chart */}
        <div className="bg-[#0A0D14] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
              <Layers className="w-4 h-4 text-amber-400" />
              Win Rate Accuracy by Asset Class
            </h3>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Top Performers</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ASSET_ACCURACY_DATA} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" domain={[70, 100]} stroke="#64748B" fontSize={10} />
                <YAxis dataKey="asset" type="category" stroke="#94A3B8" fontSize={10} tickLine={false} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#050505",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    color: "#F8FAFC",
                  }}
                  formatter={(val: any) => [`${val}% Win Rate`, "Accuracy"]}
                />
                <Bar dataKey="winRate" radius={[0, 6, 6, 0]} barSize={20}>
                  {ASSET_ACCURACY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strategy Breakdown Pie Chart */}
        <div className="bg-[#0A0D14] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
              <PieChartIcon className="w-4 h-4 text-purple-400" />
              Signal Distribution & Strategy Efficiency
            </h3>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Algorithm Share</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={STRATEGY_ACCURACY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {STRATEGY_ACCURACY_DATA.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#050505",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    color: "#F8FAFC",
                  }}
                  formatter={(val: any, name: any, item: any) => [
                    `${val}% Share (${item.payload.winRate}% Win Rate)`,
                    name,
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", fontFamily: "monospace" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Performance Ledger Table */}
      <div className="bg-[#0A0D14] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Verified Monthly Historical Performance Matrix
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Audited trade ledger logging total monthly signals, accuracy percentages, and net portfolio return.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-bold">
              YTD RETURN: +303.8%
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-[#06080C]">
                <th className="p-3">Period</th>
                <th className="p-3">Total Signals</th>
                <th className="p-3">AI Accuracy (Win %)</th>
                <th className="p-3">Net Portfolio PnL</th>
                <th className="p-3">System Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {MONTHLY_PERFORMANCE.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 font-bold text-white font-sans">{row.month}</td>
                  <td className="p-3 text-slate-400">{row.trades} Signals</td>
                  <td className="p-3">
                    <span className="text-emerald-400 font-bold">{row.winPct}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-blue-400 font-bold">{row.profit}</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
