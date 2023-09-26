import { Bot, InputFile } from "grammy";
import path from "path";
import { API_TOKEN, DOWNLOAD_FOLDER } from "../const";
import { Comunication } from "../models/comunication";

export class TelegramClient {
  private bot;
  constructor() {
    this.bot = new Bot(API_TOKEN);
  }
  async sendComunication(chatId: number, communication: Comunication) {
    for (let index = 0; index < communication.filenames.length; index++) {
      const filename = communication.filenames[index];
      const downloadPath = path.resolve(DOWNLOAD_FOLDER);
      await this.bot.api.sendDocument(
        chatId,
        new InputFile(`${downloadPath}/${filename}`),
        {
          caption: communication.title,
        }
      );
    }
  }

  async sendMessage(chatId: number, textContent: string) {
    await this.bot.api.sendMessage(chatId, textContent);
  }
}
