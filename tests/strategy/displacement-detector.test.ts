import { describe, it, expect } from 'vitest';
import { DisplacementDetector } from '../../apps/bot-core/src/strategy/fvg/displacement-detector';

describe('DisplacementDetector', () => {
  const detector = new DisplacementDetector();

  it('detecta desplazamiento alcista fuerte (cuerpo ≥ 70% del rango)', () => {
    // body = 8, range = 10, strength = 0.8
    const candle = { time: 1, open: 100, close: 108, high: 109, low: 99 };
    const result = detector.detect(candle);

    expect(result).not.toBeNull();
    expect(result!.direction).toBe('BULLISH');
    expect(result!.strength).toBeCloseTo(0.8);
  });

  it('detecta desplazamiento bajista fuerte', () => {
    const candle = { time: 1, open: 108, close: 100, high: 109, low: 99 };
    const result = detector.detect(candle);

    expect(result).not.toBeNull();
    expect(result!.direction).toBe('BEARISH');
  });

  it('retorna null en vela débil (cuerpo < 70% del rango)', () => {
    // body = 3, range = 10, strength = 0.3
    const candle = { time: 1, open: 100, close: 103, high: 109, low: 99 };
    expect(detector.detect(candle)).toBeNull();
  });

  it('retorna null en doji (rango cero)', () => {
    const candle = { time: 1, open: 100, close: 100, high: 100, low: 100 };
    expect(detector.detect(candle)).toBeNull();
  });
});
