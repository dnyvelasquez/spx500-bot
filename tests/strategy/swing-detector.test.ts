import { describe, it, expect } from 'vitest';
import { SwingDetector } from '../../apps/bot-core/src/strategy/structure/swing-detector';

const candle = (high: number, low: number, time = 0) => ({
  time, open: low, high, low, close: high, tick_volume: 100,
});

describe('SwingDetector', () => {
  const detector = new SwingDetector();

  it('detecta un swing high claro', () => {
    const candles = [
      candle(102, 99, 1),
      candle(104, 100, 2),
      candle(110, 102, 3), // swing high
      candle(106, 103, 4),
      candle(103, 100, 5),
    ];

    const swings = detector.detectSwings(candles);
    const highs = swings.filter((s) => s.type === 'HIGH');

    expect(highs).toHaveLength(1);
    expect(highs[0].price).toBe(110);
    expect(highs[0].index).toBe(2);
  });

  it('detecta un swing low claro', () => {
    const candles = [
      candle(105, 99, 1),
      candle(104, 97, 2),
      candle(103, 90, 3), // swing low
      candle(106, 95, 4),
      candle(108, 98, 5),
    ];

    const swings = detector.detectSwings(candles);
    const lows = swings.filter((s) => s.type === 'LOW');

    expect(lows).toHaveLength(1);
    expect(lows[0].price).toBe(90);
  });

  it('no detecta swings en velas planas', () => {
    const candles = Array.from({ length: 5 }, (_, i) =>
      candle(100, 98, i),
    );

    const swings = detector.detectSwings(candles);
    expect(swings).toHaveLength(0);
  });

  it('requiere al menos 5 velas para detectar', () => {
    const candles = [candle(110, 100, 1), candle(105, 99, 2), candle(108, 101, 3)];
    const swings = detector.detectSwings(candles);
    expect(swings).toHaveLength(0);
  });
});
