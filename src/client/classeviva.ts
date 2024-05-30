import * as puppeteer from "puppeteer-core";
import { Comunication } from "../models/comunication";

export class ClasseVivaClient {
  readonly urlViewComunication : string ="https://web.spaggiari.eu/sif/app/default/bacheca_comunicazione.php?action=risposta_com&com_id="

  constructor() {}

  async login(page: puppeteer.Page, username: string, password: string) {
    await page.goto("https://web.spaggiari.eu/home/app/default/login.php", {
      waitUntil: "networkidle2",
    });
    await page.waitForSelector("#login");
    await page.type("#login", username);
    await page.waitForSelector("#password");
    await page.type("#password", password);
    await page.$eval("button[type=submit]", (form) => form.click());
    await page.waitForNavigation();
    await page.goto(
      "https://web.spaggiari.eu/sif/app/default/bacheca_personale.php",
      {
        waitUntil: "networkidle2",
      }
    );
    return page;
  }

  async retriveComunications(
    page: puppeteer.Page,
    tableSelector: string
  ): Promise<Comunication[]> {
    let results: Comunication[] = [];
    const rows = await page.$$(tableSelector);

    for (let index = 0; index < rows.length; index++) {
      const element = rows[index];
      await page.waitForSelector("div.com_titolo");

      const comTitle: string = await element.$eval(
        "div.com_titolo",
        (el) => el.textContent || ""
      );
      const comDate: string = await element.$eval(
        "div.com_data",
        (el) => el.textContent || ""
      );
      const comId: string = await element.$eval(
        "div.div_com_titolo specifica",
        (el) => el.textContent || ""
      );

      results.push({
        title: comTitle,
        date: comDate,
      } as Comunication);
    }

    return results;
  }
}
