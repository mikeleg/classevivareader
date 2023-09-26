import fs from "fs";
import path from "path";
import * as puppeteer from "puppeteer-core";
import { TelegramClient } from "./client/telegram";
import { BRWOSER_PATH, CHAT_ID, DOWNLOAD_FOLDER } from "./const";
import { Comunication } from "./models/comunication";

const main = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox"],
    executablePath: BRWOSER_PATH,
    slowMo: 80,
  });
  let page = await browser.newPage();
  const client = await page.target().createCDPSession();
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: path.resolve(DOWNLOAD_FOLDER),
  });
  page = await login(page, process.argv[2], process.argv[3]);
  const comunications = await retriveComunications(page, "#box_row_to_read tr");
  await browser.close();
  await sendComunications(comunications);
  await deleteDownlodedFiles(comunications);
};
async function login(page: puppeteer.Page, username: string, password: string) {
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
async function retriveComunications(page: puppeteer.Page,tableSelector:string) {
  const rows = await page.$$(tableSelector);
  let comunications: Comunication[] = [];

  for (let index = 0; index < rows.length; index++) {
    const element = rows[index];
    await page.waitForSelector("div.com_titolo");
    const title: string = await element.$eval(
      "div.com_titolo",
      (el) => el.textContent || ""
    );
    const com_id: string = await element.$eval(
      "div.div_com_titolo",
      (el: any) => el.getAttribute("comunicazione_id")
    );
    if (com_id === null) continue;
    await page.waitForSelector(`a[comunicazione_id="${com_id}"]`);
    await page.$eval(`a[comunicazione_id="${com_id}"]`, (el: any) =>
      el.click()
    );
    await page.waitForSelector("#div_risposta");
    const attachmentIds: string[] = await page.$$eval(
      "a.dwl_allegato",
      (el) => {
        const ids = el.map((el) => el.getAttribute("allegato_id") || "");
        return ids !== null ? ids : [];
      }
    );
    const filenames: string[] = await page.$$eval("a.dwl_allegato", (el) => {
      const names = el.map((el) => {
        let filename = el
          .getAttribute("aria-label")
          .replace(/(Download )/gm, "");
        filename = filename.replace(/\s/gi, "_");
        filename = filename.replace("Download", "");

        return filename;
      });
      return names !== null ? names : [];
    });

    comunications.push({
      title: title,
      comId: com_id,
      allegatoIds: attachmentIds,
      filenames: filenames,
    } as Comunication);

    for (let index = 0; index < attachmentIds.length; index++) {
      const attachmentId = attachmentIds[index];
      if (attachmentId === "") continue;
      await page.waitForSelector(`a[allegato_id="${attachmentId}"]`);
      const downloadAttachment = await page.$(
        `a[allegato_id="${attachmentId}"]`
      );
      if (downloadAttachment !== null) {
        await downloadAttachment.click();
      }
    }

    const btnCloseDialog = await page.$(
      `body > div:nth-child(5) > div.ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix > div > button`
    );
    if (btnCloseDialog !== null) {
      await btnCloseDialog.click();
    }
  }

  return comunications;
}
async function sendComunications(comunications: Comunication[]) {
  const client: TelegramClient = new TelegramClient();
  for (let index = 0; index < comunications.length; index++) {
    const comunication = comunications[index];
    await client.sendComunication(CHAT_ID, comunication);
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}
async function deleteDownlodedFiles(comunications: Comunication[]) {

  for (let index = 0; index < comunications.length; index++) {
    const comuncation = comunications[index];

    for (let index = 0; index < comuncation.filenames.length; index++) {
      const filename = comuncation.filenames[index];
      const downloadPath = path.resolve(DOWNLOAD_FOLDER);
      const filePath = `${downloadPath}/${filename}`;
      await fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }
  }
}

main();
