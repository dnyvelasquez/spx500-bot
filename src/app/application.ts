import { logger } from '@infra/logger/logger';

import { TelegramService } from '@infra/telegram/telegram.service';

export class Application {
  private readonly telegramService: TelegramService;

  constructor() {
    this.telegramService = new TelegramService();
  }

  public async start(): Promise<void> {
    logger.info('Application starting...');

    await this.telegramService.initialize();

    logger.info('Application started successfully');
  }

  public async stop(): Promise<void> {
    logger.info('Application stopping...');
  }
}