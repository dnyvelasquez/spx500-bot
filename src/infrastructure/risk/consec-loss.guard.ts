import { logger } from '@infra/logger/logger';

export class ConsecLossGuard {
  private streak = 0;
  private blockedDay = '';

  // Call at the start of each trading day to reset
  resetDay(): void {
    this.streak = 0;
    this.blockedDay = '';
  }

  recordResult(profit: number): void {
    if (profit < 0) {
      this.streak++;
      logger.debug({ streak: this.streak }, 'ConsecLossGuard: loss recorded');
    } else {
      this.streak = 0;
    }
  }

  // Block for today when streak hits the limit
  isBlocked(maxConsecLosses: number, todayET: string): boolean {
    if (maxConsecLosses <= 0) return false;
    if (this.streak >= maxConsecLosses) {
      if (this.blockedDay !== todayET) {
        this.blockedDay = todayET;
        logger.warn({ streak: this.streak, limit: maxConsecLosses }, 'ConsecLossGuard: circuit breaker triggered');
      }
      return true;
    }
    return false;
  }

  get currentStreak(): number { return this.streak; }
}
