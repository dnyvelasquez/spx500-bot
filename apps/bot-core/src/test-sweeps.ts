import { LiquidityEngine } from './strategy/liquidity/liquidity-engine';

import {
  detectEqualHighs,
  detectEqualLows,
} from './strategy/liquidity/equal-levels';

import { Candle } from './types/market.types';

async function main() {
  const candles: Candle[] = [
    {
      time: 1,
      open: 7400,
      high: 7410,
      low: 7395,
      close: 7405,
    },

    {
      time: 2,
      open: 7405,
      high: 7410.5,
      low: 7400,
      close: 7402,
    },

    {
      time: 3,
      open: 7402,
      high: 7412,
      low: 7398,
      close: 7401,
    },
  ];

  const eqh =
    detectEqualHighs(candles);

  const eql =
    detectEqualLows(candles);

  const levels = [
    ...eqh,
    ...eql,
  ];

  const engine =
    new LiquidityEngine();

  engine.addLevels(levels);

  console.log(
    'CLUSTERS:',
    engine.getClusters(),
  );

  engine.on(
    'liquiditySweep',
    (sweep) => {
      console.log(
        'SWEEP:',
        sweep,
      );
    },
  );

  const liveCandle: Candle = {
    time: 4,

    open: 7401,

    high: 7415,

    low: 7399,

    close: 7404,
  };

  engine.analyzeCandle(
    liveCandle,
  );
}

main();