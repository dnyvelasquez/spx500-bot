import axios from 'axios';

import { logger } from '@infra/logger/logger';
import { env } from '@config/env';

export interface LicenseRecord {
  owner_name: string;
  mt5_account: number;
  allowed_mode: 'demo' | 'live' | 'both';
  active: boolean;
  expires_at: string | null;
}

export class LicenseService {
  private readonly configured: boolean;

  constructor() {
    this.configured = !!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY && env.LICENSE_KEY);
  }

  /**
   * Valida la licencia contra Supabase.
   * - Si las vars de entorno no están configuradas, omite la validación (modo dev).
   * - Lanza un error con motivo legible si la licencia no es válida.
   */
  async validate(mt5Login: number, tradeMode: 'DEMO' | 'CONTEST' | 'REAL'): Promise<void> {
    if (!this.configured) {
      logger.warn('License validation skipped — SUPABASE_URL / SUPABASE_ANON_KEY / LICENSE_KEY not set');
      return;
    }

    logger.info({ login: mt5Login }, 'Validating license against Supabase...');

    const license = await this.fetchLicense();

    if (!license.active) {
      throw new Error('License is inactive — contact the administrator');
    }

    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      throw new Error(`License expired on ${license.expires_at}`);
    }

    if (license.mt5_account !== mt5Login) {
      throw new Error(
        `Account mismatch — license is for account ${license.mt5_account}, connected account is ${mt5Login}`,
      );
    }

    this.validateMode(license.allowed_mode, tradeMode);

    logger.info(
      { owner: license.owner_name, login: mt5Login, mode: license.allowed_mode },
      'License valid',
    );
  }

  private async fetchLicense(): Promise<LicenseRecord> {
    const response = await axios.get<LicenseRecord[]>(
      `${env.SUPABASE_URL}/rest/v1/licenses`,
      {
        params: { license_key: `eq.${env.LICENSE_KEY}`, select: '*' },
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        },
        timeout: 8_000,
      },
    );

    if (!response.data.length) {
      throw new Error('License key not found in database');
    }

    return response.data[0];
  }

  private validateMode(
    allowed: 'demo' | 'live' | 'both',
    tradeMode: 'DEMO' | 'CONTEST' | 'REAL',
  ): void {
    if (allowed === 'both') return;

    const isDemo = tradeMode === 'DEMO' || tradeMode === 'CONTEST';
    const isLive = tradeMode === 'REAL';

    if (allowed === 'demo' && !isDemo) {
      throw new Error('This license only allows demo accounts — live trading is not permitted');
    }

    if (allowed === 'live' && !isLive) {
      throw new Error('This license only allows live accounts');
    }
  }
}
