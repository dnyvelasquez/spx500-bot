import fs from 'fs';
import path from 'path';

import { runBacktest } from '../src/backtest/backtest-runner';

const CONFIG_PATH = path.resolve(__dirname, '..', 'config.json');
const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')) as Record<string, unknown>;

const FROM = '2025-07-22';
const TO = '2026-06-22';

const MIN_HOURS = [0, 7, 8, 9, 10, 11, 12];
const MAX_HOURS = [0, 12, 13, 14, 15, 16, 17];
const SKIP_MONDAY = [true, false];

interface Row {
  epMinHour: number;
  epMaxHour: number;
  epSkipMonday: boolean;
  trades: number;
  wins: number;
  losses: number;
  open: number;
  winRate: number;
  pnl: number;
  profitFactor: number;
}

async function main(): Promise<void> {
  const rows: Row[] = [];

  for (const epSkipMonday of SKIP_MONDAY) {
    for (const epMinHour of MIN_HOURS) {
      for (const epMaxHour of MAX_HOURS) {
        if (epMinHour > 0 && epMaxHour > 0 && epMinHour >= epMaxHour) continue;

        const report = await runBacktest({
          symbol: 'SPX500',
          from: FROM,
          to: TO,
          initialBalance: 10000,
          riskPercent: (cfg['RISK_PERCENT'] as number) ?? 1,
          cooldownMinutes: (cfg['SIGNAL_COOLDOWN_MINUTES'] as number) ?? 15,
          blockedHours: cfg['BLOCKED_HOURS'] as never,
          minFvgPoints: (cfg['MIN_FVG_POINTS'] as number) ?? 0,
          minSlPoints: (cfg['MIN_SL_POINTS'] as number) ?? 0,
          zoneProximityPoints: (cfg['ZONE_PROXIMITY_POINTS'] as number) ?? 20,
          zoneSlBufferPoints: (cfg['ZONE_SL_BUFFER_POINTS'] as number) ?? 8,
          emaSpreadMin: (cfg['EMA_SPREAD_MIN'] as number) ?? 0,
          epUseM15Align: (cfg['EP_M15_ALIGN'] as boolean) ?? false,
          maxConsecLosses: (cfg['MAX_CONSEC_LOSSES'] as number) ?? 0,
          beAtPoints: (cfg['BE_AT_POINTS'] as number) ?? 0,
          beBuffer: (cfg['BE_BUFFER_POINTS'] as number) ?? 0,
          partialTpEnabled: (cfg['PARTIAL_TP_ENABLED'] as boolean) ?? false,
          // Isolate EP so the sweep measures only the effect of its hour filter.
          enableZB: false,
          enableEP: true,
          enableSMAX: false,
          enableSMAB: false,
          epMaxSlPoints: (cfg['EP_MAX_SL_POINTS'] as number) ?? 0,
          epAdxPeriod: (cfg['EP_ADX_PERIOD'] as number) ?? 14,
          epAdxMin: (cfg['EP_ADX_MIN'] as number) ?? 0,
          epH4Align: (cfg['EP_H4_ALIGN'] as boolean) ?? false,
          spreadPoints: (cfg['SPREAD_POINTS'] as number) ?? 0.35,
          epSkipMonday,
          epMinHour,
          epMaxHour,
        });

        const m = report.metrics;
        rows.push({
          epMinHour,
          epMaxHour,
          epSkipMonday,
          trades: m.totalTrades,
          wins: m.wins,
          losses: m.losses,
          open: m.openTrades,
          winRate: m.winRate,
          pnl: m.totalPnl,
          profitFactor: m.profitFactor,
        });

        process.stderr.write('.');
      }
    }
  }

  process.stderr.write('\n');
  rows.sort((a, b) => b.pnl - a.pnl);

  console.log(
    [
      'minH'.padEnd(5),
      'maxH'.padEnd(5),
      'skipMon'.padEnd(8),
      'trades'.padEnd(7),
      'W/L/O'.padEnd(10),
      'WR%'.padEnd(7),
      'PF'.padEnd(6),
      'PnL',
    ].join('  '),
  );
  for (const r of rows) {
    console.log(
      [
        String(r.epMinHour).padEnd(5),
        String(r.epMaxHour).padEnd(5),
        String(r.epSkipMonday).padEnd(8),
        String(r.trades).padEnd(7),
        `${r.wins}/${r.losses}/${r.open}`.padEnd(10),
        r.winRate.toFixed(1).padEnd(7),
        (r.profitFactor === 999 ? 'inf' : r.profitFactor.toFixed(2)).padEnd(6),
        (r.pnl >= 0 ? '+' : '') + r.pnl.toFixed(2),
      ].join('  '),
    );
  }

  fs.writeFileSync(path.resolve(__dirname, '..', 'sweep-ep-hours-results.json'), JSON.stringify(rows, null, 2));
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
