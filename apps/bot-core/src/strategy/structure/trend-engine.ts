import { Candle }
  from "../../services/mt5/mt5.types";

import { StructureEngine }
  from "./structure-engine";

import { TrendState }
  from "./trend-state";

export class TrendEngine {

  private structure =
    new StructureEngine();

  analyze(
    candles: Candle[]
  ): TrendState {

    const result =
      this.structure.analyze(
        candles
      );

    let trend:
      TrendState = "RANGE";

    for (
      const bos of result.bos
    ) {

      if (
        bos.type ===
        "BULLISH_BOS"
      ) {

        trend = "BULLISH";
      }

      if (
        bos.type ===
        "BEARISH_BOS"
      ) {

        trend = "BEARISH";
      }
    }

    for (
      const choch of result.choch
    ) {

      if (
        trend === "BULLISH" &&

        choch.type ===
        "BEARISH_CHOCH"
      ) {

        trend = "BEARISH";
      }

      if (
        trend === "BEARISH" &&

        choch.type ===
        "BULLISH_CHOCH"
      ) {

        trend = "BULLISH";
      }
    }

    return trend;
  }
}