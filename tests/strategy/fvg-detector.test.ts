import { describe, it, expect } from 'vitest';
import { FVGDetector } from '../../apps/bot-core/src/strategy/fvg/fvg-detector';

describe('FVGDetector', () => {
  const detector = new FVGDetector();

  describe('detectBullish', () => {
    it('detecta un FVG alcista cuando hay gap entre vela 1 y vela 3', () => {
      const candles = [
        { time: 1, high: 100, low: 95 },
        { time: 2, high: 110, low: 98 }, // displacement
        { time: 3, high: 115, low: 103 }, // low > high de vela 1 → gap
      ];

      const fvg = detector.detectBullish(candles);

      expect(fvg).not.toBeNull();
      expect(fvg!.direction).toBe('BULLISH');
      expect(fvg!.startPrice).toBe(100); // high de vela 1
      expect(fvg!.endPrice).toBe(103);   // low de vela 3
      expect(fvg!.size).toBe(3);
    });

    it('retorna null cuando no hay gap alcista', () => {
      const candles = [
        { time: 1, high: 105, low: 100 },
        { time: 2, high: 110, low: 103 },
        { time: 3, high: 112, low: 104 }, // low < high de vela 1 → sin gap
      ];

      expect(detector.detectBullish(candles)).toBeNull();
    });

    it('retorna null con menos de 3 velas', () => {
      expect(detector.detectBullish([{ time: 1, high: 100, low: 95 }])).toBeNull();
    });
  });

  describe('detectBearish', () => {
    it('detecta un FVG bajista cuando hay gap entre vela 1 y vela 3', () => {
      const candles = [
        { time: 1, high: 115, low: 110 },
        { time: 2, high: 112, low: 100 }, // displacement bajista
        { time: 3, high: 107, low: 102 }, // high < low de vela 1 → gap
      ];

      const fvg = detector.detectBearish(candles);

      expect(fvg).not.toBeNull();
      expect(fvg!.direction).toBe('BEARISH');
      expect(fvg!.startPrice).toBe(107); // high de vela 3
      expect(fvg!.endPrice).toBe(110);   // low de vela 1
      expect(fvg!.size).toBe(3);
    });

    it('retorna null cuando no hay gap bajista', () => {
      const candles = [
        { time: 1, high: 115, low: 110 },
        { time: 2, high: 112, low: 108 },
        { time: 3, high: 113, low: 109 }, // high > low de vela 1 → sin gap
      ];

      expect(detector.detectBearish(candles)).toBeNull();
    });
  });
});
