export interface Candle {
  time: number;

  open: number;

  high: number;

  low: number;

  close: number;

  tickVolume?: number;

  spread?: number;

  realVolume?: number;
}