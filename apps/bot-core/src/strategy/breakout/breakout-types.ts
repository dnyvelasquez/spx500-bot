import type { ZoneTimeframe } from '../zones/zone-types';

export interface FlippedZone {
  level: number;
  type: 'SUPPORT' | 'RESISTANCE'; // what it is NOW after being broken
  direction: 'BULLISH' | 'BEARISH'; // direction of the original breakout
  timeframe: ZoneTimeframe;
  strength: number;
  breakoutTime: number;
}
