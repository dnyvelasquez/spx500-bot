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

    if (lastBos?.type === "BULLISH_BOS") return "BULLISH";
    if (lastBos?.type === "BEARISH_BOS") return "BEARISH";
    if (lastChoch?.type === "BULLISH_CHOCH") return "BULLISH";
    if (lastChoch?.type === "BEARISH_CHOCH") return "BEARISH";

    return "RANGE";
  }

  // Consensus across D1 + H4 + H1.
  // D1 sets direction; H4 or H1 must confirm. If D1 is RANGE, requires H4+H1 aligned.
  analyzeMultiTF(
    d1: Candle[],
    h4: Candle[],
    h1: Candle[],
  ): MarketBias {
    const d1Bias = this.analyze(d1);
    const h4Bias = this.analyze(h4);
    const h1Bias = this.analyze(h1);

    if (d1Bias !== "RANGE") {
      if (h4Bias === d1Bias || h1Bias === d1Bias) return d1Bias;
    }

    if (h4Bias !== "RANGE" && h4Bias === h1Bias) return h4Bias;

    return "RANGE";
  }
}