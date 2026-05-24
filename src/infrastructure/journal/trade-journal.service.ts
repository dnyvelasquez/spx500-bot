import postgres from 'postgres';

import { logger } from '@infra/logger/logger';
import { env } from '@config/env';

export interface JournalEntry {
  ticket: number;
  mt5Login: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  volume: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  plannedRr: number;
  riskAmount: number;
}

export class TradeJournalService {
  private sql: ReturnType<typeof postgres> | null = null;

  async initialize(): Promise<void> {
    if (!env.DATABASE_URL) {
      logger.warn('Trade journal disabled — DATABASE_URL not configured');
      return;
    }

    this.sql = postgres(env.DATABASE_URL, { ssl: 'require', max: 2 });

    await this.sql`
      CREATE TABLE IF NOT EXISTS trades (
        id          SERIAL PRIMARY KEY,
        ticket      INTEGER NOT NULL UNIQUE,
        mt5_login   INTEGER NOT NULL,
        symbol      VARCHAR(20) NOT NULL,
        side        VARCHAR(4) NOT NULL,
        volume      FLOAT NOT NULL,
        entry_price FLOAT NOT NULL,
        stop_loss   FLOAT NOT NULL,
        take_profit FLOAT NOT NULL,
        planned_rr  FLOAT NOT NULL,
        risk_amount FLOAT NOT NULL,
        opened_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        closed_at   TIMESTAMPTZ,
        close_price FLOAT,
        profit      FLOAT,
        actual_rr   FLOAT,
        result      VARCHAR(10)
      )
    `;

    logger.info('Trade journal initialized');
  }

  async recordOpen(entry: JournalEntry): Promise<void> {
    if (!this.sql) return;
    try {
      await this.sql`
        INSERT INTO trades
          (ticket, mt5_login, symbol, side, volume, entry_price, stop_loss, take_profit, planned_rr, risk_amount)
        VALUES
          (${entry.ticket}, ${entry.mt5Login}, ${entry.symbol}, ${entry.side}, ${entry.volume},
           ${entry.entryPrice}, ${entry.stopLoss}, ${entry.takeProfit}, ${entry.plannedRr}, ${entry.riskAmount})
        ON CONFLICT (ticket) DO NOTHING
      `;
      logger.info({ ticket: entry.ticket, side: entry.side }, 'Trade recorded in journal');
    } catch (err) {
      logger.warn({ err, ticket: entry.ticket }, 'Failed to record trade open in journal');
    }
  }

  async recordClose(ticket: number, closePrice: number, profit: number): Promise<void> {
    if (!this.sql) return;
    try {
      const rows = await this.sql<{ side: string; entry_price: number; stop_loss: number }[]>`
        SELECT side, entry_price, stop_loss FROM trades WHERE ticket = ${ticket}
      `;

      if (!rows.length) return;

      const { side, entry_price, stop_loss } = rows[0];
      const slDistance = Math.abs(entry_price - stop_loss);
      const priceMove = side === 'BUY' ? closePrice - entry_price : entry_price - closePrice;
      const actualRr = slDistance > 0 ? Math.round((priceMove / slDistance) * 100) / 100 : 0;

      const result = Math.abs(actualRr) < 0.1 ? 'BE' : actualRr > 0 ? 'WIN' : 'LOSS';

      await this.sql`
        UPDATE trades
        SET closed_at = NOW(), close_price = ${closePrice}, profit = ${profit},
            actual_rr = ${actualRr}, result = ${result}
        WHERE ticket = ${ticket}
      `;

      logger.info(
        { ticket, profit: profit.toFixed(2), result, rr: actualRr.toFixed(2) },
        'Trade closed in journal',
      );
    } catch (err) {
      logger.warn({ err, ticket }, 'Failed to record trade close in journal');
    }
  }

  async stop(): Promise<void> {
    if (this.sql) {
      await this.sql.end();
      this.sql = null;
    }
  }
}
