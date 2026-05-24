import { Position } from '../mt5/mt5.types';

export interface PositionAction {
  ticket: number;
  symbol: string;
  newSL: number;
  keepTP: number;
  reason: 'BREAK_EVEN' | 'TRAILING_STOP';
}

export class PositionMonitor {
  // Break-even cuando el precio se mueve 1R a favor
  private readonly breakEvenAt = 1.0;
  // Trailing activo cuando el precio se mueve 2R a favor
  private readonly trailAt = 2.0;

  check(position: Position, currentPrice: number): PositionAction | null {
    const slDistance = Math.abs(position.priceOpen - position.stopLoss);

    if (slDistance === 0) return null;

    const profit =
      position.type === 'BUY'
        ? currentPrice - position.priceOpen
        : position.priceOpen - currentPrice;

    // Trailing stop: precio se movió ≥ 2R → arrastrar SL a 1R del precio actual
    if (profit >= slDistance * this.trailAt) {
      const newSL =
        position.type === 'BUY'
          ? currentPrice - slDistance
          : currentPrice + slDistance;

      // Solo mover si mejora el SL actual
      const improves =
        position.type === 'BUY'
          ? newSL > position.stopLoss
          : newSL < position.stopLoss;

      if (improves) {
        return {
          ticket: position.ticket,
          symbol: position.symbol,
          newSL,
          keepTP: position.takeProfit,
          reason: 'TRAILING_STOP',
        };
      }
    }

    // Break-even: precio se movió ≥ 1R → mover SL a precio de entrada
    if (profit >= slDistance * this.breakEvenAt) {
      const alreadyAtBE =
        position.type === 'BUY'
          ? position.stopLoss >= position.priceOpen
          : position.stopLoss <= position.priceOpen;

      if (!alreadyAtBE) {
        return {
          ticket: position.ticket,
          symbol: position.symbol,
          newSL: position.priceOpen,
          keepTP: position.takeProfit,
          reason: 'BREAK_EVEN',
        };
      }
    }

    return null;
  }
}
