import "dotenv/config";
import { TelegramClient } from "./client/telegram";
import { Comunication } from "./models/comunication";
import { Student } from "./models/student";
import { PuppeteerUtils, Utils } from "./utils";
import { ClasseVivaClient } from "./client/classeviva";
import { CHAT_ID } from "./const";

const main = async () => {
  const browser = await PuppeteerUtils.CreateBrowser();
  let page = await browser.newPage();
  const studentCredentials: Student = Utils.convertProcessArgsToStudent(
    process.argv
  );
  const telegramClient = new TelegramClient();
  const classeVivaClient = new ClasseVivaClient();

  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (["image", "fonts"].indexOf(request.resourceType()) !== -1) {
      request.abort();
    } else {
      request.continue();
    }
  });
  page = await classeVivaClient.login(
    page,
    studentCredentials.utente,
    studentCredentials.password
  );
  let comunications: Comunication[] =
    await classeVivaClient.retriveComunications(page, "#box_row_other tr");
  await browser.close();

  for (let i = 0; i < comunications.length; i++) {
    const comunication = comunications[i];
    const message = `🧑‍🎓 [${studentCredentials.nome}] \n 📅 ${comunication.date} \n 📌${comunication.title}`;
    await new Promise((f) => setTimeout(f, 5000));
    await telegramClient.sendMessage(CHAT_ID, message);
  }
};

main();
