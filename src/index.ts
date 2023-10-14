import "dotenv/config";
import path from "path";
import * as puppeteer from "puppeteer-core";
import { DOWNLOAD_FOLDER } from "./const";
import { Comunication, FileComunication } from "./models/comunication";
import { Student } from "./models/student";
import { PuppeteerUtils, Utils } from "./utils";

const main = async () => {
  const browser = await PuppeteerUtils.CreateBrowser();
  let page = await browser.newPage();

  const studentCredentials: Student = Utils.convertProcessArgsToStudent(
    process.argv
  );
  const client = await page.target().createCDPSession();
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: `${path.resolve(DOWNLOAD_FOLDER)}/${
      studentCredentials.nome
    }}`,
  });
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (["image", "fonts"].indexOf(request.resourceType()) !== -1) {
      request.abort();
    } else {
      request.continue();
    }
  });
  page = await login(
    page,
    studentCredentials.utente,
    studentCredentials.password
  );
  const comunications = await retriveComunications(page, "#box_row_to_read tr");
  await browser.close();
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
async function retriveComunications(
  page: puppeteer.Page,
  tableSelector: string
) {
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
    const filenames: FileComunication[] = await page.$$eval(
      "a.dwl_allegato",
      (el) => {
        const names = el.map((el) => {
          let filename = el
            .getAttribute("aria-label")
            .replace(/(Download )/gm, "");
          filename = filename.replace(/\s/gi, "_");
          filename = filename.replace("Download", "");
          let filenameClean = filename
            .toLocaleLowerCase()
            .replace(/[^a-zA-Z0-9 ]|(pdf)/gm, "");
          return {
            filename: filename,
            filenameClean: filenameClean,
          } as FileComunication;
        });
        return names !== null ? names : [];
      }
    );

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

main();
