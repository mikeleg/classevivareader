import * as puppeteer from "puppeteer-core";
import { BRWOSER_PATH, USER_DATA_PATH } from "./const";

export class Utils {
  static CalendarLink(title: string): string {
    let formatedCurrDate = this.formatCurrentDate();
    return `https://calendar.google.com/calendar/u/0/r/eventedit?text=${title}&dates=${formatedCurrDate}/${formatedCurrDate}&details&location=somewhere&trp=false`;
  }
  private static formatCurrentDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
  
    const formattedDate = `${year}
                          ${month.toString().padStart(2, '0')}
                          ${day.toString().padStart(2, '0')}
                          T${hours.toString().padStart(2, '0')}
                          ${minutes.toString().padStart(2, '0')}
                          ${seconds.toString().padStart(2, '0')}`;
    return formattedDate;
  }
}

export class PuppeteerUtils {
  static async CreateBrowser() {
    return await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox"],
      executablePath: BRWOSER_PATH,
      slowMo: 80,
      devtools: false,
      userDataDir: USER_DATA_PATH,
    });
  }
}
