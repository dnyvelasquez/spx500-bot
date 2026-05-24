export interface BlockedWindow {
  from: string;  // "HH:MM" hora ET
  to: string;    // "HH:MM" hora ET
  label: string;
}

export class SessionGuard {
  isBlocked(windows: BlockedWindow[]): { blocked: boolean; label?: string } {
    const nowET = this.getNowET();
    for (const w of windows) {
      if (this.isInWindow(nowET, w.from, w.to)) {
        return { blocked: true, label: w.label };
      }
    }
    return { blocked: false };
  }

  private getNowET(): string {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());
  }

  private isInWindow(current: string, from: string, to: string): boolean {
    if (from <= to) {
      return current >= from && current < to;
    }
    // Ventana cruza medianoche (ej. 16:00–09:30)
    return current >= from || current < to;
  }
}
