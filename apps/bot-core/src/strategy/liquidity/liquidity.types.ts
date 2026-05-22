export type LiquidityType =
  | 'EQH'
  | 'EQL'
  | 'BSL'
  | 'SSL';

export interface LiquidityLevel {
  price: number;

  type: LiquidityType;

  touches: number;

  firstTouchTime: number;

  lastTouchTime?: number;
}

export interface LiquiditySweep {
  level: LiquidityLevel;
  clusterId: string;
  sweptAt: number;
  type: LiquidityType;
  sweepCandleHigh: number;
  sweepCandleLow: number;
  sweepPrice: number;
  candleTime: number;
  rejectionStrength: number;
  direction:
    | 'bullish'
    | 'bearish';
  displacementStrength: number;
}

export interface LiquidityCluster {
  id: string;
  type: LiquidityType;
  averagePrice: number;
  levels: LiquidityLevel[];
  strength: number;
  createdAt: number;
}
