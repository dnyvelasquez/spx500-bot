import { Candle }
  from "../../services/mt5/mt5.types";

import { SwingPoint }
  from "./structure.types";

export class CHOCHDetector {

  detectChoch(
    candles: Candle[],
    swings: SwingPoint[]
  ) {

    const chochEvents = [];

    for (
      let i = 2;
      i < swings.length;
      i++
    ) {

      const prev =
        swings[i - 1];

      const current =
        swings[i];

      const candle =
        candles[current.index];

      const bullishChoch =

        prev.type === "LOW" &&

        candle.close <
        prev.price;

      const bearishChoch =

        prev.type === "HIGH" &&

        candle.close >
        prev.price;

      if (bullishChoch) {

        chochEvents.push({
          type: "BULLISH_CHOCH",
          brokenPrice:
            prev.price,
          candleTime:
            candle.time
        });
      }

      if (bearishChoch) {

        chochEvents.push({
          type: "BEARISH_CHOCH",
          brokenPrice:
            prev.price,
          candleTime:
            candle.time
        });
      }
    }

    return chochEvents;
  }
}