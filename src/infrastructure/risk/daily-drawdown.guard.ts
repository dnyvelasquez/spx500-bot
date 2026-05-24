import { logger } from '@infra/logger/logger';

export class DailyDrawdownGuard {
  private referenceBalance: number | null = null;
  private referenceDate = '';

  setReference(balance: number): void {
    const today = this.todayUTC();
    if (this.referenceDate === today) return;

    this.referenceBalance = balance;
    this.referenceDate = today;
    logger.info({ balance, date: today }, 'Daily drawdown reference set');
  }

  isBreached(currentBalance: number, maxDrawdownPercent: number): boolean {
    if (this.referenceBalance === null) return false;
    return this.drawdownPct(currentBalance) >= maxDrawdownPercent;
  }

  drawdownPct(currentBalance: number): number {
    if (this.referenceBalance === null) return 0;
    return ((this.referenceBalance - currentBalance) / this.referenceBalance) * 100;
  }

  private todayUTC(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
