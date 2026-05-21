export interface SwingPoint {
  index: number;
  price: number;
  time: number;
  type: "HIGH" | "LOW";
}

export interface MarketStructure {
  trend: "BULLISH" | "BEARISH" | "RANGE";
  lastBos?: number;
  lastChoch?: number;
}