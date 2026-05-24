import { logger } from '@infra/logger/logger';

export class DailyProfitTargetGuard {
  private referenceBalance: number | null = null;
  private referenceDate = '';

  setReference(balance: number): void {
    const today = this.todayUTC();
    if (this.referenceDate === today) return;

    this.referenceBalance = balance;
    this.referenceDate = today;
    logger.info({ balance, date: today }, 'Daily profit target reference set');
  }

  isReached(currentBalance: number, targetPercent: number): boolean {
    if (this.referenceBalance === null) return false;
    return this.profitPct(currentBalance) >= targetPercent;
  }

  profitPct(currentBalance: number): number {
    if (this.referenceBalance === null) return 0;
    return ((currentBalance - this.referenceBalance) / this.referenceBalance) * 100;
  }

  private todayUTC(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
