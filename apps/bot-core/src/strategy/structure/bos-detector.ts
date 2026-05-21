import { Candle }
  from "../../services/mt5/mt5.types";

import { SwingPoint }
  from "./structure.types";

export class BOSDetector {

  detectBos(
    candles: Candle[],
    swings: SwingPoint[]
  ) {

    const bosEvents = [];

    for (
      let i = 1;
      i < swings.length;
      i++
    ) {

      const previous =
        swings[i - 1];

      const current =
        swings[i];

      const currentCandle =
        candles[current.index];

      const bullishBos =

        previous.type === "HIGH" &&

        currentCandle.close >
        previous.price;

      const bearishBos =

        previous.type === "LOW" &&

        currentCandle.close <
        previous.price;

      if (bullishBos) {

        bosEvents.push({
          type: "BULLISH_BOS",
          brokenPrice:
            previous.price,
          candleTime:
            currentCandle.time
        });
      }

      if (bearishBos) {

        bosEvents.push({
          type: "BEARISH_BOS",
          brokenPrice:
            previous.price,
          candleTime:
            currentCandle.time
        });
      }
    }

    return bosEvents;
  }
}