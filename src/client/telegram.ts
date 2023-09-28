import { Bot, InputFile, InputMediaBuilder } from "grammy";
import path from "path";
import { API_TOKEN, DOWNLOAD_FOLDER } from "../const";
import { Comunication } from "../models/comunication";
import { Student } from "../models/student";

export class TelegramClient {
  private bot;
  constructor() {
    this.bot = new Bot(API_TOKEN);
  }
  async sendComunication(
    chatId: number,
    communication: Comunication,
    student: Student
  ) {
    const downloadPath = path.resolve(DOWNLOAD_FOLDER);
    const media = communication.filenames.map((filename) =>
      InputMediaBuilder.document(new InputFile(`${downloadPath}/${filename}`))
    );
    await this.bot.api.sendMediaGroup(chatId, media, {
      caption: `[${student.nome}] ${communication.title}`,
    });
  }

  async sendMessage(chatId: number, textContent: string) {
    await this.bot.api.sendMessage(chatId, textContent);
  }
}
