import { Candle }
  from "../../services/mt5/mt5.types";

import { SwingPoint }
  from "./structure.types";

export class SwingDetector {

  detectSwings(
    candles: Candle[]
  ): SwingPoint[] {

    const swings:
      SwingPoint[] = [];

    for (
      let i = 2;
      i < candles.length - 2;
      i++
    ) {

      const current =
        candles[i];

      const prev1 =
        candles[i - 1];

      const prev2 =
        candles[i - 2];

      const next1 =
        candles[i + 1];

      const next2 =
        candles[i + 2];

      const isSwingHigh =

        current.high >
        prev1.high &&

        current.high >
        prev2.high &&

        current.high >
        next1.high &&

        current.high >
        next2.high;

      const isSwingLow =

        current.low <
        prev1.low &&

        current.low <
        prev2.low &&

        current.low <
        next1.low &&

        current.low <
        next2.low;

      if (isSwingHigh) {

        swings.push({
          index: i,
          price: current.high,
          time: current.time,
          type: "HIGH"
        });
      }

      if (isSwingLow) {

        swings.push({
          index: i,
          price: current.low,
          time: current.time,
          type: "LOW"
        });
      }
    }

    return swings;
  }
}