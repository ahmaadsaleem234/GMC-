import fs from "fs";
import path from "path";

export interface TelegramChannelInfo {
  id: string; // e.g. "-1002345678901" or "@gmc_channel"
  title: string;
  username?: string;
  addedAt: string;
  addedBy: string;
  status: "active" | "paused";
  totalSignalsDelivered: number;
  lastDeliveredAt?: string;
  lastError?: string;
}

class TelegramChannelService {
  private channels: Record<string, TelegramChannelInfo> = {};
  private readonly storagePath: string;

  constructor() {
    this.storagePath = path.join(process.cwd(), "data", "telegram_channels.json");
    this.loadFromDisk();
    this.syncEnvChannels();
  }

  private loadFromDisk(): void {
    try {
      const dataDir = path.dirname(this.storagePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(this.storagePath)) {
        const raw = fs.readFileSync(this.storagePath, "utf-8");
        this.channels = JSON.parse(raw);
        console.log(`[TELEGRAM CHANNELS]: Loaded ${Object.keys(this.channels).length} channels from disk.`);
      }
    } catch (err) {
      console.warn("[TELEGRAM CHANNELS]: Could not load channels from disk, starting empty:", err);
      this.channels = {};
    }
  }

  private saveToDisk(): void {
    try {
      const dataDir = path.dirname(this.storagePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(this.storagePath, JSON.stringify(this.channels, null, 2), "utf-8");
    } catch (err) {
      console.error("[TELEGRAM CHANNELS]: Failed to save channels to disk:", err);
    }
  }

  public syncEnvChannels(): void {
    const envIds = [
      process.env.TELEGRAM_CHANNEL_ID,
      process.env.TELEGRAM_PUBLIC_CHANNEL,
    ].filter(Boolean) as string[];

    for (const raw of envIds) {
      const clean = String(raw).trim();
      if (clean && !this.channels[clean]) {
        this.addChannel(clean, `Channel ${clean}`, undefined, "ENV");
      }
    }
  }

  public getChannels(): TelegramChannelInfo[] {
    return Object.values(this.channels);
  }

  public getActiveChannelIds(): string[] {
    return Object.values(this.channels)
      .filter((c) => c.status === "active")
      .map((c) => c.id);
  }

  public addChannel(
    channelId: string,
    title?: string,
    username?: string,
    addedBy: string = "AUTO_DISCOVERY"
  ): TelegramChannelInfo {
    const cleanId = String(channelId).trim();
    const existing = this.channels[cleanId];

    const updated: TelegramChannelInfo = {
      id: cleanId,
      title: title || existing?.title || `Channel ${cleanId}`,
      username: username || existing?.username,
      addedAt: existing?.addedAt || new Date().toISOString(),
      addedBy: existing?.addedBy || addedBy,
      status: "active",
      totalSignalsDelivered: existing?.totalSignalsDelivered || 0,
      lastDeliveredAt: existing?.lastDeliveredAt,
    };

    this.channels[cleanId] = updated;
    this.saveToDisk();
    console.log(`[TELEGRAM CHANNELS]: Registered channel ${cleanId} (${updated.title}) [Source: ${addedBy}]`);
    return updated;
  }

  public removeChannel(channelId: string): boolean {
    const cleanId = String(channelId).trim();
    if (this.channels[cleanId]) {
      delete this.channels[cleanId];
      this.saveToDisk();
      console.log(`[TELEGRAM CHANNELS]: Removed channel ${cleanId}`);
      return true;
    }
    return false;
  }

  public recordDelivery(channelId: string, success: boolean, errorMsg?: string): void {
    const cleanId = String(channelId).trim();
    const ch = this.channels[cleanId];
    if (ch) {
      if (success) {
        ch.totalSignalsDelivered = (ch.totalSignalsDelivered || 0) + 1;
        ch.lastDeliveredAt = new Date().toISOString();
        ch.lastError = undefined;
      } else {
        ch.lastError = errorMsg || "Delivery failed";
      }
      this.saveToDisk();
    }
  }
}

export const telegramChannelService = new TelegramChannelService();
