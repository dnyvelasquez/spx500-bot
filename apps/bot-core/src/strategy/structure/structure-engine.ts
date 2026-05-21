import { Candle }
  from "../../services/mt5/mt5.types";

import { SwingDetector }
  from "./swing-detector";

import { BOSDetector }
  from "./bos-detector";

import { CHOCHDetector }
  from "./choch-detector";

export class StructureEngine {

  private swings =
    new SwingDetector();

  private bos =
    new BOSDetector();

  private choch =
    new CHOCHDetector();

  analyze(
    candles: Candle[]
  ) {

    const swingPoints =
      this.swings.detectSwings(
        candles
      );

    const bosEvents =
      this.bos.detectBos(
        candles,
        swingPoints
      );

    const chochEvents =
      this.choch.detectChoch(
        candles,
        swingPoints
      );

    return {
      swings: swingPoints,
      bos: bosEvents,
      choch: chochEvents
    };
  }
}