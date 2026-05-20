import { Candle } from "../services/mt5/mt5.types";

export class CandleCache {

  private candles =
    new Map<string, Candle[]>();

  set(
    key: string,
    data: Candle[]
  ) {
    this.candles.set(key, data);
  }

  get(
    key: string
  ): Candle[] {

    return this.candles.get(key) || [];
  }
}