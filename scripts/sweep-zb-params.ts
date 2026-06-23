import fs from 'fs';
import path from 'path';

import { runBacktest } from '../src/backtest/backtest-runner';

const CONFIG_PATH = path.resolve(__dirname, '..', 'config.json');
const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')) as Record<string, unknown>;

const FROM = '2025-07-23';
const TO = '2026-06-23';

interface ZBParams {
  proximity: number;
  slBuffer: number;
  minFvg: number;
  minSl: number;
}

interface Row extends ZBParams {
  trades: number;
  wins: number;
  losses: number;
  open: number;
  winRate: number;
  pnl: number;
  profitFactor: number;
}

async function runOne(p: ZBParams): Promise<Row> {
  const report = await runBacktest({
    symbol: 'SPX500',
    from: FROM,
    to: TO,
    initialBalance: 10000,
    riskPercent: (cfg['RISK_PERCENT'] as number) ?? 1,
    cooldownMinutes: (cfg['SIGNAL_COOLDOWN_MINUTES'] as number) ?? 15,
    blockedHours: cfg['BLOCKED_HOURS'] as never,
    minFvgPoints: p.minFvg,
    minSlPoints: p.minSl,
    zoneProximityPoints: p.proximity,
    zoneSlBufferPoints: p.slBuffer,
    emaSpreadMin: (cfg['EMA_SPREAD_MIN'] as number) ?? 0,
    epUseM15Align: (cfg['EP_M15_ALIGN'] as boolean) ?? false,
    maxConsecLosses: (cfg['MAX_CONSEC_LOSSES'] as number) ?? 0,
    beAtPoints: (cfg['BE_AT_POINTS'] as number) ?? 0,
    beBuffer: (cfg['BE_BUFFER_POINTS'] as number) ?? 0,
    partialTpEnabled: (cfg['PARTIAL_TP_ENABLED'] as boolean) ?? false,
    // Isolate ZB so the sweep measures only its own signal.
    enableZB: true,
    enableEP: false,
    enableSMAX: false,
    enableSMAB: false,
    spreadPoints: (cfg['SPREAD_POINTS'] as number) ?? 0.35,
  });
  const m = report.metrics;
  return {
    ...p,
    trades: m.totalTrades,
    wins: m.wins,
    losses: m.losses,
    open: m.openTrades,
    winRate: m.winRate,
    pnl: m.totalPnl,
    profitFactor: m.profitFactor,
  };
}

function printRows(label: string, rows: Row[]): void {
  console.log(`\n── ${label} ──`);
  console.log(
    ['prox', 'slBuf', 'minFvg', 'minSl', 'trades', 'W/L/O', 'WR%', 'PF', 'PnL']
      .map((h) => h.padEnd(7)).join('  '),
  );
  for (const r of rows) {
    console.log(
      [
        String(r.proximity).padEnd(7),
        String(r.slBuffer).padEnd(7),
        String(r.minFvg).padEnd(7),
        String(r.minSl).padEnd(7),
        String(r.trades).padEnd(7),
        `${r.wins}/${r.losses}/${r.open}`.padEnd(7),
        r.winRate.toFixed(1).padEnd(7),
        (r.profitFactor === 999 ? 'inf' : r.profitFactor.toFixed(2)).padEnd(7),
        (r.pnl >= 0 ? '+' : '') + r.pnl.toFixed(2),
      ].join('  '),
    );
  }
}

// Greedy coordinate-descent sweep: tune one parameter at a time, carrying the
// best value forward, instead of a full 4D grid (which at ~30s/combo would
// take hours). Starts from current config.json defaults.
async function main(): Promise<void> {
  const allRows: Row[] = [];
  let best: ZBParams = {
    proximity: (cfg['ZONE_PROXIMITY_POINTS'] as number) ?? 20,
    slBuffer: (cfg['ZONE_SL_BUFFER_POINTS'] as number) ?? 8,
    minFvg: (cfg['MIN_FVG_POINTS'] as number) ?? 3,
    minSl: (cfg['MIN_SL_POINTS'] as number) ?? 8,
  };

  const stages: { label: string; key: keyof ZBParams; values: number[] }[] = [
    { label: 'zoneProximityPoints', key: 'proximity', values: [10, 15, 20, 25, 30] },
    { label: 'zoneSlBufferPoints', key: 'slBuffer', values: [4, 6, 8, 10, 12] },
    { label: 'minFvgPoints', key: 'minFvg', values: [0, 2, 3, 5] },
    { label: 'minSlPoints', key: 'minSl', values: [5, 8, 10, 15] },
  ];

  for (const stage of stages) {
    const rows: Row[] = [];
    for (const v of stage.values) {
      const candidate = { ...best, [stage.key]: v };
      const row = await runOne(candidate);
      rows.push(row);
      process.stderr.write('.');
    }
    process.stderr.write('\n');
    rows.sort((a, b) => b.pnl - a.pnl);
    printRows(`Stage: ${stage.label} (resto fijo en mejor valor previo)`, rows);
    allRows.push(...rows);
    best = { ...best, [stage.key]: rows[0]![stage.key] };
    console.log(`  → mejor ${stage.key}: ${best[stage.key]}`);
  }

  console.log('\n══ MEJOR COMBINACIÓN FINAL ══');
  console.log(JSON.stringify(best, null, 2));
  const finalRow = await runOne(best);
  printRows('Final', [finalRow]);

  fs.writeFileSync(
    path.resolve(__dirname, '..', 'sweep-zb-params-results.json'),
    JSON.stringify({ best, finalRow, allRows }, null, 2),
  );
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
