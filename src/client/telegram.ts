import { Bot } from "grammy";
import { API_TOKEN } from "../const";
export class TelegramClient {
  private bot;
  constructor() {
    this.bot = new Bot(API_TOKEN);
  }
  async sendMessage(chatId: number, textContent: string) {
    await this.bot.api.sendMessage(chatId, textContent);
  }
}
