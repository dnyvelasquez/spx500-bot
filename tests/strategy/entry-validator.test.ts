import { describe, it, expect } from 'vitest';
import { EntryValidator } from '../../apps/bot-core/src/strategy/entry/entry-validator';

describe('EntryValidator', () => {
  const validator = new EntryValidator();

  const validBullish = {
    htfBias: 'BULLISH' as const,
    sweepDirection: 'BULLISH' as const,
    mssDirection: 'BULLISH' as const,
    hasDisplacement: true,
    hasFVG: true,
  };

  it('aprueba un setup bullish con todas las condiciones', () => {
    expect(validator.validate(validBullish)).toBe(true);
  });

  it('rechaza cuando el sesgo HTF no está alineado con el MSS', () => {
    expect(validator.validate({ ...validBullish, htfBias: 'BEARISH' })).toBe(false);
  });

  it('rechaza cuando la dirección del sweep no coincide con el MSS', () => {
    expect(validator.validate({ ...validBullish, sweepDirection: 'BEARISH' })).toBe(false);
  });

  it('rechaza cuando no hay desplazamiento', () => {
    expect(validator.validate({ ...validBullish, hasDisplacement: false })).toBe(false);
  });

  it('rechaza cuando no hay FVG', () => {
    expect(validator.validate({ ...validBullish, hasFVG: false })).toBe(false);
  });

  it('aprueba un setup bearish válido', () => {
    expect(validator.validate({
      htfBias: 'BEARISH',
      sweepDirection: 'BEARISH',
      mssDirection: 'BEARISH',
      hasDisplacement: true,
      hasFVG: true,
    })).toBe(true);
  });
});
