import { Candle }
  from "../../services/mt5/mt5.types";

import { StructureEngine }
  from "../structure/structure-engine";

import { MarketBias }
  from "./bias.types";

export class BiasEngine {

  private structure =
    new StructureEngine();

  analyze(
    candles: Candle[]
  ): MarketBias {

    const result =
      this.structure.analyze(
        candles
      );

    const lastBos =
      result.bos[
        result.bos.length - 1
      ];

    const lastChoch =
      result.choch[
        result.choch.length - 1
      ];

    if (
      lastBos &&
      lastBos.type ===
      "BULLISH_BOS"
    ) {
      return "BULLISH";
    }

    if (
      lastBos &&
      lastBos.type ===
      "BEARISH_BOS"
    ) {
      return "BEARISH";
    }

    if (
      lastChoch &&
      lastChoch.type ===
      "BULLISH_CHOCH"
    ) {
      return "BULLISH";
    }

    if (
      lastChoch &&
      lastChoch.type ===
      "BEARISH_CHOCH"
    ) {
      return "BEARISH";
    }

    return "RANGE";
  }
}