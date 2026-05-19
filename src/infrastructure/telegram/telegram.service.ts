import TelegramBot from 'node-telegram-bot-api';

import { env } from '@config/env';

import { logger } from '@infra/logger/logger';

export class TelegramService {
  private readonly bot: TelegramBot;

  constructor() {
    this.bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, {
      polling: false,
    });
  }

  public async initialize(): Promise<void> {
    logger.info('Initializing Telegram service...');

    const botInfo = await this.bot.getMe();

    logger.info(`Telegram bot connected: ${botInfo.username}`);
  }
}