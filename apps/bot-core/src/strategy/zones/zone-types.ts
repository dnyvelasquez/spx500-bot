export type ZoneType = 'SUPPORT' | 'RESISTANCE';
export type ZoneTimeframe = 'D1' | 'H4' | 'H1' | 'M15';

export interface SRZone {
  level: number;
  type: ZoneType;
  timeframe: ZoneTimeframe;
  strength: number;
  candleTime: number;
}
