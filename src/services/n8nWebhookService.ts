/**
 * GMC N8N WEBHOOK INTEGRATION SERVICE (Server-Side Only)
 * 
 * Automatically transmits approved trade setups from Central Signal Manager
 * to an n8n webhook workflow via HTTP POST.
 * 
 * Features:
 * - Reads webhook URL strictly from N8N_WEBHOOK_URL environment variable
 * - Robust error handling, AbortController timeouts (8s), and exponential backoff retries
 * - Idempotency & deduplication protection (never sends the same setupId twice)
 * - Comprehensive payload format matching n8n requirements
 * - Audit log tracking for delivery status inspection
 */

import { centralSignalManager, ActiveCentralSetup } from "./centralSignalManager.js";

export interface N8nTradePayload {
  symbol: string;
  direction: "BUY" | "SELL";
  action: "BUY" | "SELL";
  buySell: "BUY" | "SELL";
  timeframe: string;
  entry: number;
  entryZoneLow: number;
  entryZoneHigh: number;
  entryRange: string;
  sl: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  finalTp: number;
  signalScore: number;
  score: number;
  aiBrain: string;
  source: string;
  brainName: string;
  setupId: string;
  timestamp: string;
  timestampMs: number;
  marketStructure: string;
  confidence: number;
  rrRatio: string;
  status: "APPROVED" | "ACTIVE";
  event: "SETUP_APPROVED";
}

export interface N8nWebhookLog {
  id: string;
  setupId: string;
  urlMasked: string;
  status: "SUCCESS" | "FAILED" | "SKIPPED" | "RETRYING";
  statusCode?: number;
  attempts: number;
  timestamp: string;
  error?: string;
  durationMs?: number;
}

export class N8nWebhookService {
  private static instance: N8nWebhookService;
  private dispatchedSetupIds: Set<string> = new Set();
  private auditLogs: N8nWebhookLog[] = [];
  private readonly maxLogs = 50;
  private readonly maxRetries = 2;
  private readonly timeoutMs = 8000;

  private constructor() {
    // Automatically register with Central Signal Manager if available in server context
    if (typeof centralSignalManager !== "undefined" && centralSignalManager.onSetupPromoted) {
      centralSignalManager.onSetupPromoted((setup: ActiveCentralSetup) => {
        this.dispatchTradeSetup(setup).catch((err) => {
          console.error("[N8N WEBHOOK]: Uncaught error in setup promotion listener:", err);
        });
      });
      console.log("[N8N WEBHOOK]: Successfully attached listener to Central Signal Manager setup promotions.");
    }
  }

  public static getInstance(): N8nWebhookService {
    if (!N8nWebhookService.instance) {
      N8nWebhookService.instance = new N8nWebhookService();
    }
    return N8nWebhookService.instance;
  }

  /**
   * Retrieves the configured n8n webhook URL from environment variables
   */
  public getWebhookUrl(): string {
    const url = process.env.N8N_WEBHOOK_URL || "";
    return url.trim();
  }

  /**
   * Checks if the webhook is currently configured
   */
  public isConfigured(): boolean {
    const url = this.getWebhookUrl();
    return url.length > 0 && (url.startsWith("http://") || url.startsWith("https://"));
  }

  /**
   * Format ActiveCentralSetup into standardized N8nTradePayload
   */
  public buildPayload(setup: ActiveCentralSetup): N8nTradePayload {
    const now = new Date();
    const symbolClean = (setup.assetKey || "XAUUSD").toUpperCase().replace(/[^A-Z0-9]/g, "");
    
    // Extract or infer market structure summary
    let marketStructure = setup.selectionReason || "Institutional Liquidity Sweep & Structure Shift";
    if (setup.signatureLine) {
      marketStructure = `${setup.signatureLine} • ${marketStructure}`;
    }

    return {
      symbol: symbolClean,
      direction: setup.direction,
      action: setup.direction,
      buySell: setup.direction,
      timeframe: setup.timeframe || "15M",
      entry: Number(setup.preferredEntry || setup.entryZoneHigh || 0),
      entryZoneLow: Number(setup.entryZoneLow || setup.preferredEntry || 0),
      entryZoneHigh: Number(setup.entryZoneHigh || setup.preferredEntry || 0),
      entryRange: setup.entryRangeFormatted || `$${setup.entryZoneLow} — $${setup.entryZoneHigh}`,
      sl: Number(setup.stopLoss || 0),
      stopLoss: Number(setup.stopLoss || 0),
      tp1: Number(setup.tp1 || 0),
      tp2: Number(setup.tp2 || 0),
      tp3: Number(setup.tp3 || setup.finalTp || 0),
      finalTp: Number(setup.finalTp || setup.tp3 || 0),
      signalScore: Math.round(setup.setupScore || 90),
      score: Math.round(setup.setupScore || 90),
      aiBrain: setup.brainSource || "HARAMI_AI",
      source: setup.brainSource || "HARAMI_AI",
      brainName: setup.brainName || "GMC Institutional AI",
      setupId: setup.setupId || `GMC-${Date.now()}`,
      timestamp: now.toISOString(),
      timestampMs: now.getTime(),
      marketStructure,
      confidence: Math.round(setup.marketConfidence || setup.setupScore || 90),
      rrRatio: setup.rrRatioString || "1:2.0",
      status: "APPROVED",
      event: "SETUP_APPROVED",
    };
  }

  /**
   * Main dispatch method called when a setup is approved by Central Signal Manager
   */
  public async dispatchTradeSetup(setup: ActiveCentralSetup): Promise<{ success: boolean; message: string; statusCode?: number }> {
    const webhookUrl = this.getWebhookUrl();
    const setupId = setup.setupId;

    if (!webhookUrl) {
      const skipMsg = `[N8N WEBHOOK]: Skipped — N8N_WEBHOOK_URL is not set in environment variables.`;
      console.log(skipMsg);
      this.recordLog(setupId, "N/A", "SKIPPED", 0, undefined, skipMsg);
      return { success: false, message: "N8N_WEBHOOK_URL not configured" };
    }

    // Deduplication check: prevent duplicate POSTs for the same setup ID
    if (this.dispatchedSetupIds.has(setupId)) {
      const dupeMsg = `[N8N WEBHOOK IDEMPOTENCY]: Setup ID ${setupId} has already been dispatched to n8n. Suppressing duplicate POST.`;
      console.log(dupeMsg);
      return { success: true, message: "Duplicate suppressed by idempotency guard" };
    }

    const payload = this.buildPayload(setup);
    const maskedUrl = this.maskUrl(webhookUrl);
    console.log(`[N8N WEBHOOK]: Transmitting approved setup #${setupId} (${payload.symbol} ${payload.direction} @ $${payload.entry}) to ${maskedUrl}...`);

    let attempt = 0;
    let lastError: Error | null = null;
    let statusCode: number | undefined;

    while (attempt <= this.maxRetries) {
      attempt++;
      const startTime = Date.now();

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "GMC-CentralSignalManager/2.5.0",
            "X-GMC-Setup-Id": setupId,
            "X-GMC-Brain-Source": payload.aiBrain,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        statusCode = response.status;
        const durationMs = Date.now() - startTime;

        if (response.ok) {
          // Success
          this.dispatchedSetupIds.add(setupId);
          this.maintainDispatchedCache();

          console.log(`[N8N WEBHOOK]: ✅ Setup #${setupId} successfully delivered to n8n in ${durationMs}ms (HTTP ${statusCode}).`);
          this.recordLog(setupId, maskedUrl, "SUCCESS", attempt, statusCode, undefined, durationMs);
          return { success: true, message: `Delivered to n8n (HTTP ${statusCode})`, statusCode };
        } else {
          const errBody = await response.text().catch(() => "");
          const errMsg = `HTTP ${statusCode}: ${errBody.slice(0, 200)}`;
          console.warn(`[N8N WEBHOOK]: Attempt ${attempt} failed with ${errMsg}`);
          lastError = new Error(errMsg);

          if (attempt <= this.maxRetries) {
            // Exponential backoff
            const backoffMs = attempt * 1000;
            await new Promise((res) => setTimeout(res, backoffMs));
          }
        }
      } catch (err: any) {
        const isAbort = err?.name === "AbortError";
        const errMsg = isAbort ? `Request timed out after ${this.timeoutMs}ms` : err?.message || String(err);
        lastError = new Error(errMsg);
        console.warn(`[N8N WEBHOOK]: Attempt ${attempt} error: ${errMsg}`);

        if (attempt <= this.maxRetries) {
          const backoffMs = attempt * 1000;
          await new Promise((res) => setTimeout(res, backoffMs));
        }
      }
    }

    // All retries exhausted
    const finalErrMsg = lastError ? lastError.message : "Unknown error";
    console.error(`[N8N WEBHOOK]: ❌ Failed to deliver setup #${setupId} to n8n after ${attempt} attempts. Error: ${finalErrMsg}`);
    this.recordLog(setupId, maskedUrl, "FAILED", attempt, statusCode, finalErrMsg);
    return { success: false, message: finalErrMsg, statusCode };
  }

  /**
   * Helper to manually test the webhook connection
   */
  public async testConnection(): Promise<{ success: boolean; message: string; statusCode?: number; samplePayload?: any }> {
    const dummySetup: ActiveCentralSetup = {
      setupId: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      brainSource: "WAR_ROOM",
      brainName: "GMC War Room Supreme",
      brainEmoji: "🛡️",
      assetKey: "XAUUSD",
      timeframe: "15M",
      direction: "BUY",
      lifecycleState: "ACTIVE",
      lifecycleStatusLabel: "APPROVED & RUNNING",
      entryZoneLow: 2750.0,
      entryZoneHigh: 2752.5,
      entryRangeFormatted: "$2750.00 — $2752.50",
      preferredEntry: 2751.25,
      stopLoss: 2743.0,
      tp1: 2760.0,
      tp2: 2772.0,
      tp3: 2785.0,
      finalTp: 2785.0,
      rrRatioString: "1:4.1",
      setupScore: 95,
      marketConfidence: 92,
      aiConsensus: "UNIFIED CONSENSUS (3/3)",
      consensusStrength: "STRONG_CONSENSUS",
      selectionReason: "Order Block Retest + Institutional CHoCH Confirmed",
      signatureLine: "War Room Supreme • Institutional Flow",
      protectionActive: true,
      protectedSlLevel: null,
      protectionMessage: null,
      isBreakeven: false,
      isEntryTriggered: true,
      entryPriceActivated: 2751.25,
      isTp1Hit: false,
      isTp2Hit: false,
      isTp3Hit: false,
      isFinalTpHit: false,
      isSlHit: false,
      isInvalidated: false,
      isExpired: false,
      highestPriceObserved: 2751.25,
      lowestPriceObserved: 2751.25,
      pnlPips: 0,
      pnlUSD: 0,
      activatedAt: Date.now(),
      activatedTimeUtc: new Date().toISOString(),
      closedAt: null,
      closedTimeUtc: null,
      finalOutcome: null,
    };

    const res = await this.dispatchTradeSetup(dummySetup);
    return {
      ...res,
      samplePayload: this.buildPayload(dummySetup),
    };
  }

  /**
   * Returns recent webhook audit logs
   */
  public getAuditLogs(): N8nWebhookLog[] {
    return [...this.auditLogs];
  }

  private recordLog(
    setupId: string,
    urlMasked: string,
    status: "SUCCESS" | "FAILED" | "SKIPPED" | "RETRYING",
    attempts: number,
    statusCode?: number,
    error?: string,
    durationMs?: number
  ) {
    const log: N8nWebhookLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      setupId,
      urlMasked,
      status,
      statusCode,
      attempts,
      timestamp: new Date().toISOString(),
      error,
      durationMs,
    };

    this.auditLogs.unshift(log);
    if (this.auditLogs.length > this.maxLogs) {
      this.auditLogs.pop();
    }
  }

  private maskUrl(url: string): string {
    try {
      const parsed = new URL(url);
      const pathSegments = parsed.pathname.split("/").filter(Boolean);
      const lastSeg = pathSegments[pathSegments.length - 1] || "";
      const maskedSeg = lastSeg.length > 6 ? `${lastSeg.slice(0, 3)}***${lastSeg.slice(-3)}` : "***";
      return `${parsed.protocol}//${parsed.host}/.../${maskedSeg}`;
    } catch {
      return url.length > 15 ? `${url.slice(0, 10)}...${url.slice(-5)}` : "***";
    }
  }

  private maintainDispatchedCache() {
    if (this.dispatchedSetupIds.size > 200) {
      const arr = Array.from(this.dispatchedSetupIds);
      this.dispatchedSetupIds = new Set(arr.slice(arr.length - 100));
    }
  }
}

export const n8nWebhookService = N8nWebhookService.getInstance();
