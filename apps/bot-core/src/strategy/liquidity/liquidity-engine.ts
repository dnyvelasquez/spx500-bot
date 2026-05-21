import { Candle }
  from "../../services/mt5/mt5.types";

import { LiquidityLevel }
  from "./liquidity.types";

export class LiquidityEngine {

  detectLiquidity(
    candles: Candle[]
  ): LiquidityLevel[] {

    const levels:
      LiquidityLevel[] = [];

    const threshold =
      1.0;

    for (
      let i = 0;
      i < candles.length;
      i++
    ) {

      for (
        let j = i + 1;
        j < candles.length;
        j++
      ) {

        const highDiff =

          Math.abs(
            candles[i].high -
            candles[j].high
          );

        const lowDiff =

          Math.abs(
            candles[i].low -
            candles[j].low
          );

        if (
          highDiff <= threshold
        ) {

          levels.push({
            price:
              candles[i].high,

            type: "EQH",

            touches: 2,

            firstTouchTime:
              candles[i].time
          });
        }

        if (
          lowDiff <= threshold
        ) {

          levels.push({
            price:
              candles[i].low,

            type: "EQL",

            touches: 2,

            firstTouchTime:
              candles[i].time
          });
        }
      }
    }

    return levels;
  }
}