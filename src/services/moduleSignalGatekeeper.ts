/**
 * MODULE SIGNAL GATEKEEPER & GLOBAL COOLDOWN SYSTEM
 * 
 * Implements strict cross-module rules:
 * 1. COOLDOWN: After any module's setup hits SL or TP, that specific module enters
 *    a 30-minute cooldown — no new signal from that module can be sent to Telegram.
 * 2. QUALITY GATE DURING COOLDOWN: While a module is in cooldown, if a different module
 *    generates a setup with confidence/score >= 90%, that signal can still be sent
 *    immediately — cooldown only blocks the cooling-down module.
 * 3. IF NOTHING QUALIFIES: If no setup reaches 90%+ during cooldown, wait and do not
 *    force-send lower quality setups.
 * 4. LOGGING: Comprehensive console logs for cooldown start, expiration, passed signals,
 *    and skipped low-quality setups.
 */

export interface ModuleCooldownState {
  inCooldown: boolean;
  cooldownUntil: number;
  remainingMinutes: number;
  triggeredBy: string;
  tradeId?: string;
  startedAt: number;
}

export class ModuleSignalGatekeeper {
  private moduleCooldowns: Map<
    string,
    {
      cooldownUntil: number;
      triggeredBy: string;
      tradeId?: string;
      startedAt: number;
      loggedEnd: boolean;
    }
  > = new Map();

  // 30 Minutes standard cooldown
  public readonly COOLDOWN_DURATION_MS = 30 * 60 * 1000;

  /**
   * Normalize input module name to canonical key
   */
  public normalizeModuleName(rawName: string): string {
    const s = String(rawName || "").toUpperCase().trim();
    if (s.includes("RETEST") || s.includes("RTX") || s === "RETEST_X") return "RETEST_X";
    if (s.includes("WAR_ROOM") || s.includes("WAR ROOM") || s === "WAR_ROOM") return "WAR_ROOM";
    if (s.includes("HARAMI") || s === "HARAMI_AI") return "HARAMI_AI";
    if (s.includes("KHATARNAK") || s.includes("JUGAAD") || s === "KHATARNAK_JUGAAD") return "KHATARNAK_JUGAAD";
    if (s.includes("PRECISION") || s.includes("HUNTER") || s === "PRECISION_HUNTER") return "PRECISION_HUNTER";
    if (s.includes("GBPUSD") || s.includes("SNIPER") || s === "GBPUSD_SNIPER") return "GBPUSD_SNIPER";
    return s || "UNKNOWN_MODULE";
  }

  /**
   * Human-readable label for module key
   */
  public getModuleLabel(moduleKey: string): string {
    switch (moduleKey) {
      case "RETEST_X":
        return "RETEST X";
      case "HARAMI_AI":
        return "Harami AI";
      case "WAR_ROOM":
        return "War Room";
      case "KHATARNAK_JUGAAD":
        return "Khatarnak Jugaad";
      case "PRECISION_HUNTER":
        return "Precision Hunter AI";
      case "GBPUSD_SNIPER":
        return "GBPUSD 3D Sniper";
      default:
        return moduleKey;
    }
  }

  /**
   * 1. Triggered immediately when any module's setup hits SL or TP.
   * Starts a 30-minute cooldown on that specific module.
   */
  public startCooldown(
    rawModule: string,
    outcome: "SL" | "TP" | string,
    tradeId?: string
  ): { moduleKey: string; cooldownUntil: number } {
    const moduleKey = this.normalizeModuleName(rawModule);
    const label = this.getModuleLabel(moduleKey);
    const now = Date.now();
    const cooldownUntil = now + this.COOLDOWN_DURATION_MS;

    this.moduleCooldowns.set(moduleKey, {
      cooldownUntil,
      triggeredBy: outcome,
      tradeId,
      startedAt: now,
      loggedEnd: false,
    });

    const untilIso = new Date(cooldownUntil).toISOString();
    console.log(
      `[MODULE COOLDOWN STARTED] ⏳ Module '${label}' (${moduleKey}) entered 30-minute cooldown until ${untilIso} (Triggered by ${outcome} on Setup #${tradeId || "N/A"}).`
    );

    return { moduleKey, cooldownUntil };
  }

  /**
   * Check if a specific module is in cooldown
   */
  public isModuleInCooldown(rawModule: string): { inCooldown: boolean; remainingMinutes: number } {
    const moduleKey = this.normalizeModuleName(rawModule);
    const info = this.moduleCooldowns.get(moduleKey);
    if (!info) return { inCooldown: false, remainingMinutes: 0 };

    const now = Date.now();
    if (now >= info.cooldownUntil) {
      if (!info.loggedEnd) {
        info.loggedEnd = true;
        const label = this.getModuleLabel(moduleKey);
        console.log(
          `[MODULE COOLDOWN ENDED] 🟢 Module '${label}' (${moduleKey}) 30-minute cooldown has elapsed. Module is now active.`
        );
      }
      this.moduleCooldowns.delete(moduleKey);
      return { inCooldown: false, remainingMinutes: 0 };
    }

    const remainingMs = info.cooldownUntil - now;
    const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000));
    return { inCooldown: true, remainingMinutes };
  }

  /**
   * Check if ANY module across the entire system is currently in cooldown
   */
  public getActiveCooldowns(): Array<{ module: string; label: string; remainingMinutes: number; triggeredBy: string }> {
    const active: Array<{ module: string; label: string; remainingMinutes: number; triggeredBy: string }> = [];
    const now = Date.now();

    for (const [modKey, info] of Array.from(this.moduleCooldowns.entries())) {
      if (now < info.cooldownUntil) {
        const remainingMinutes = Math.max(1, Math.ceil((info.cooldownUntil - now) / 60000));
        active.push({
          module: modKey,
          label: this.getModuleLabel(modKey),
          remainingMinutes,
          triggeredBy: info.triggeredBy,
        });
      } else {
        if (!info.loggedEnd) {
          info.loggedEnd = true;
          const label = this.getModuleLabel(modKey);
          console.log(
            `[MODULE COOLDOWN ENDED] 🟢 Module '${label}' (${modKey}) 30-minute cooldown has elapsed. Module is now active.`
          );
        }
        this.moduleCooldowns.delete(modKey);
      }
    }

    return active;
  }

  /**
   * 2 & 3. Quality Gate & Cooldown Check on Signal Dispatch
   * 
   * - If candidate module itself is in cooldown -> BLOCKED (No new signals from cooling down module).
   * - If candidate module is NOT in cooldown:
   *   - If other modules ARE in cooldown -> Quality Gate requires confidence/score >= 90%.
   *     - score >= 90% -> ALLOWED immediately.
   *     - score < 90% -> BLOCKED (Do not force-send lower quality setup; log skipped setup).
   *   - If NO modules in cooldown -> ALLOWED normally.
   */
  public evaluateSignalQualityGate(
    rawModule: string,
    confidenceScore: number,
    signalId?: string
  ): { canSend: boolean; reason: string; moduleKey: string } {
    const moduleKey = this.normalizeModuleName(rawModule);
    const label = this.getModuleLabel(moduleKey);
    const idStr = signalId || "N/A";
    const score = typeof confidenceScore === "number" && !isNaN(confidenceScore) ? confidenceScore : 85.0;

    // 1. Check if candidate's OWN module is in cooldown
    const ownCheck = this.isModuleInCooldown(moduleKey);
    if (ownCheck.inCooldown) {
      const reason = `[SIGNAL DISPATCH SUPPRESSED] 🛑 Module '${label}' is in active 30-minute cooldown (${ownCheck.remainingMinutes}m remaining). Signal #${idStr} blocked.`;
      console.log(reason);
      return { canSend: false, reason, moduleKey };
    }

    // 2. Check if ANY OTHER module in the system is currently cooling down
    const activeCooldowns = this.getActiveCooldowns();
    const otherCooldowns = activeCooldowns.filter((c) => c.module !== moduleKey);

    if (otherCooldowns.length > 0) {
      const coolingSummary = otherCooldowns
        .map((c) => `${c.label} (${c.remainingMinutes}m left, ${c.triggeredBy})`)
        .join(", ");

      if (score >= 90.0) {
        const reason = `[QUALITY GATE PASSED] ✅ Signal #${idStr} from '${label}' scored ${score.toFixed(1)}% (>= 90%). Allowed immediate dispatch during system cooldown of [${coolingSummary}].`;
        console.log(reason);
        return { canSend: true, reason, moduleKey };
      } else {
        const reason = `[QUALITY GATE BLOCKED] ⚠️ Signal #${idStr} from '${label}' scored ${score.toFixed(1)}% (< 90%). Skipped low-quality setup during active system cooldown of [${coolingSummary}].`;
        console.log(reason);
        return { canSend: false, reason, moduleKey };
      }
    }

    // 3. No system cooldowns active -> Normal dispatch allowed
    const reason = `[NORMAL DISPATCH] 🟢 Module '${label}' clear to send (Score: ${score.toFixed(1)}%, No active cooldowns).`;
    return { canSend: true, reason, moduleKey };
  }

  /**
   * Reset all active cooldowns (Admin override)
   */
  public resetAllCooldowns(): void {
    this.moduleCooldowns.clear();
    console.log("[MODULE COOLDOWN RESET] All module cooldowns cleared by Super Admin.");
  }

  /**
   * Get all active cooldown info for API / UI / Admin panels
   */
  public getAllCooldowns(): Record<string, ModuleCooldownState> {
    const result: Record<string, ModuleCooldownState> = {};
    const now = Date.now();

    for (const [modKey, info] of Array.from(this.moduleCooldowns.entries())) {
      const inCooldown = now < info.cooldownUntil;
      const remainingMinutes = inCooldown ? Math.max(1, Math.ceil((info.cooldownUntil - now) / 60000)) : 0;
      result[modKey] = {
        inCooldown,
        cooldownUntil: info.cooldownUntil,
        remainingMinutes,
        triggeredBy: info.triggeredBy,
        tradeId: info.tradeId,
        startedAt: info.startedAt,
      };
    }

    return result;
  }
}

// Global Singleton Instance
export const moduleSignalGatekeeper = new ModuleSignalGatekeeper();
