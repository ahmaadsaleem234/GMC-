import fs from "fs";
import path from "path";
import {
  AuthoritativeSetup,
  SetupLifecycleEvent,
  SetupSnapshot,
  LiveAlertNotification,
  LifecycleEventType,
} from "../types/setupLifecycle.js";

const DATA_DIR = path.join(process.cwd(), "data");
const SETUPS_FILE = path.join(DATA_DIR, "war_room_setups.json");
const EVENTS_FILE = path.join(DATA_DIR, "war_room_events.json");
const SNAPSHOTS_FILE = path.join(DATA_DIR, "war_room_snapshots.json");
const ALERTS_FILE = path.join(DATA_DIR, "war_room_alerts.json");

export class SetupLifecycleStorage {
  private setups: Map<string, AuthoritativeSetup> = new Map();
  private events: SetupLifecycleEvent[] = [];
  private snapshots: SetupSnapshot[] = [];
  private alerts: LiveAlertNotification[] = [];
  private dispatchedIdempotencyKeys: Set<string> = new Set();
  private initialized = false;

  constructor() {
    this.init();
  }

  private ensureDir() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (e) {
      console.warn("[STORAGE]: Error creating data dir:", e);
    }
  }

  public init() {
    if (this.initialized) return;
    this.ensureDir();

    // 1. Load Setups
    try {
      if (fs.existsSync(SETUPS_FILE)) {
        const raw = fs.readFileSync(SETUPS_FILE, "utf-8");
        const list: AuthoritativeSetup[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((s) => {
            if (s && s.setupId) {
              this.setups.set(s.setupId, s);
              // Register already dispatched updates
              if (Array.isArray(s.dispatchedUpdates)) {
                s.dispatchedUpdates.forEach((evt) => {
                  this.dispatchedIdempotencyKeys.add(`${s.setupId}:${evt}`);
                });
              }
            }
          });
          console.log(`[STORAGE]: Loaded ${this.setups.size} historical setups from disk.`);
        }
      }
    } catch (e) {
      console.warn("[STORAGE]: Error loading setups file:", e);
    }

    // 2. Load Events
    try {
      if (fs.existsSync(EVENTS_FILE)) {
        const raw = fs.readFileSync(EVENTS_FILE, "utf-8");
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          this.events = list;
        }
      }
    } catch (e) {
      console.warn("[STORAGE]: Error loading events file:", e);
    }

    // 3. Load Snapshots
    try {
      if (fs.existsSync(SNAPSHOTS_FILE)) {
        const raw = fs.readFileSync(SNAPSHOTS_FILE, "utf-8");
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          this.snapshots = list;
        }
      }
    } catch (e) {
      console.warn("[STORAGE]: Error loading snapshots file:", e);
    }

    // 4. Load Alerts
    try {
      if (fs.existsSync(ALERTS_FILE)) {
        const raw = fs.readFileSync(ALERTS_FILE, "utf-8");
        const list: LiveAlertNotification[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          this.alerts = list;
          list.forEach((a) => {
            if (a.idempotencyKey) {
              this.dispatchedIdempotencyKeys.add(a.idempotencyKey);
            }
          });
        }
      }
    } catch (e) {
      console.warn("[STORAGE]: Error loading alerts file:", e);
    }

    this.initialized = true;
  }

  private saveSetups() {
    try {
      this.ensureDir();
      const list = Array.from(this.setups.values());
      const tempPath = `${SETUPS_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(list, null, 2), "utf-8");
      fs.renameSync(tempPath, SETUPS_FILE);
    } catch (e) {
      console.warn("[STORAGE]: Error saving setups:", e);
    }
  }

  private saveEvents() {
    try {
      this.ensureDir();
      const tempPath = `${EVENTS_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.events.slice(0, 1000), null, 2), "utf-8");
      fs.renameSync(tempPath, EVENTS_FILE);
    } catch (e) {
      console.warn("[STORAGE]: Error saving events:", e);
    }
  }

  private saveSnapshots() {
    try {
      this.ensureDir();
      const tempPath = `${SNAPSHOTS_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.snapshots.slice(0, 300), null, 2), "utf-8");
      fs.renameSync(tempPath, SNAPSHOTS_FILE);
    } catch (e) {
      console.warn("[STORAGE]: Error saving snapshots:", e);
    }
  }

  private saveAlerts() {
    try {
      this.ensureDir();
      const tempPath = `${ALERTS_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.alerts.slice(0, 200), null, 2), "utf-8");
      fs.renameSync(tempPath, ALERTS_FILE);
    } catch (e) {
      console.warn("[STORAGE]: Error saving alerts:", e);
    }
  }

  // Setups Operations
  public saveSetup(setup: AuthoritativeSetup): AuthoritativeSetup {
    this.setups.set(setup.setupId, { ...setup });
    this.saveSetups();
    return setup;
  }

  public getSetup(setupId: string): AuthoritativeSetup | undefined {
    return this.setups.get(setupId);
  }

  public getAllSetups(): AuthoritativeSetup[] {
    return Array.from(this.setups.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  public getActiveOrWaitingSetup(): AuthoritativeSetup | null {
    const list = this.getAllSetups();
    for (const s of list) {
      if (
        s.status === "WAITING" ||
        s.status === "ACTIVE" ||
        s.status === "TP1_HIT" ||
        s.status === "TP2_HIT" ||
        s.status === "TP3_HIT"
      ) {
        return s;
      }
    }
    return null;
  }

  // Events Operations
  public addEvent(
    setupId: string,
    eventType: LifecycleEventType,
    price: number,
    note: string,
    candleContext?: string,
    details?: Record<string, any>
  ): SetupLifecycleEvent {
    const now = Date.now();
    const event: SetupLifecycleEvent = {
      id: `evt-${setupId}-${eventType}-${now}`,
      setupId,
      eventType,
      timestamp: now,
      timestampFormatted: new Date(now).toISOString().replace("T", " ").substring(11, 19) + " UTC",
      price,
      note,
      candleContext,
      details,
    };

    this.events.unshift(event);
    if (this.events.length > 2000) this.events.pop();
    this.saveEvents();

    // Also attach directly to the setup record
    const setup = this.setups.get(setupId);
    if (setup) {
      if (!Array.isArray(setup.events)) setup.events = [];
      setup.events.push(event);
      this.saveSetups();
    }

    return event;
  }

  public getEventsForSetup(setupId: string): SetupLifecycleEvent[] {
    const setup = this.setups.get(setupId);
    if (setup && Array.isArray(setup.events) && setup.events.length > 0) {
      return setup.events;
    }
    return this.events.filter((e) => e.setupId === setupId).reverse();
  }

  // Snapshots Operations
  public addSnapshot(
    setupId: string,
    eventType: LifecycleEventType,
    price: number,
    note: string,
    imageUrl?: string
  ): SetupSnapshot {
    const setup = this.setups.get(setupId);
    const now = Date.now();
    const snapshot: SetupSnapshot = {
      id: `snap-${setupId}-${eventType}-${now}`,
      setupId,
      eventType,
      timestamp: now,
      timestampFormatted: new Date(now).toISOString().replace("T", " ").substring(0, 19) + " UTC",
      timeframe: "5M",
      price,
      entry: setup?.bestEntry || price,
      sl: setup?.stopLoss || price - 4.5,
      tp1: setup?.tp1 || price + 6.5,
      tp2: setup?.tp2 || price + 11.0,
      tp3: setup?.tp3 || price + 16.5,
      tp4: setup?.tp4 || price + 24.0,
      imageUrl,
      note,
    };

    this.snapshots.unshift(snapshot);
    if (this.snapshots.length > 500) this.snapshots.pop();
    this.saveSnapshots();

    if (setup) {
      if (!Array.isArray(setup.snapshots)) setup.snapshots = [];
      setup.snapshots.push(snapshot);
      this.saveSetups();
    }

    return snapshot;
  }

  public getSnapshotsForSetup(setupId: string): SetupSnapshot[] {
    const setup = this.setups.get(setupId);
    if (setup && Array.isArray(setup.snapshots) && setup.snapshots.length > 0) {
      return setup.snapshots;
    }
    return this.snapshots.filter((s) => s.setupId === setupId);
  }

  // Alerts & Idempotency
  public hasDispatchedAlert(idempotencyKey: string): boolean {
    return this.dispatchedIdempotencyKeys.has(idempotencyKey);
  }

  public registerAlert(alert: LiveAlertNotification): LiveAlertNotification {
    this.dispatchedIdempotencyKeys.add(alert.idempotencyKey);
    this.alerts.unshift(alert);
    if (this.alerts.length > 200) this.alerts.pop();
    this.saveAlerts();

    const setup = this.setups.get(alert.setupId);
    if (setup) {
      if (!Array.isArray(setup.dispatchedUpdates)) setup.dispatchedUpdates = [];
      if (!setup.dispatchedUpdates.includes(alert.eventType)) {
        setup.dispatchedUpdates.push(alert.eventType);
        this.saveSetups();
      }
    }

    return alert;
  }

  public getRecentAlerts(limit = 30): LiveAlertNotification[] {
    return this.alerts.slice(0, limit);
  }

  public markAlertRead(alertId: string) {
    const target = this.alerts.find((a) => a.id === alertId);
    if (target) {
      target.read = true;
      this.saveAlerts();
    }
  }
}

export const setupLifecycleStorage = new SetupLifecycleStorage();
