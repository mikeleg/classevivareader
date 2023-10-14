import fs from "fs";
import path from "path";
import * as puppeteer from "puppeteer-core";
import { BRWOSER_PATH, DOWNLOAD_FOLDER, USER_DATA_PATH } from "./const";
import { Comunication, FileComunication } from "./models/comunication";
import { Student } from "./models/student";

export class Utils {
  static async deleteDownlodedFiles(comunications: Comunication[]) {
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
  static convertProcessArgsToStudent(args: any[]) {
    return {
      utente: args[2],
      password: args[3],
      nome: args[4],
    } as Student;
  }

  static assigneDowloadedFileNameToComunications(
    communicationFiles: FileComunication[]
  ) {
    const filesDownloaded = this.retriveFileNameDownload();

    for (let index = 0; index < communicationFiles.length; index++) {
      const element = communicationFiles[index];

      if (filesDownloaded[element.filenameClean]) {
        communicationFiles[index].filenameDownload =
          filesDownloaded[element.filename];
      }
    }
  }

  private static retriveFileNameDownload() {
    let fileDownloaded: Map<string, string> = null;
    const downloadPath = path.resolve(DOWNLOAD_FOLDER);
    const files = fs.readdirSync(downloadPath);

    if (files.length > 0) {
      fileDownloaded = new Map<string, string>();
      files.forEach((file) => {
        fileDownloaded.set(file, file.toLocaleLowerCase().replace(/[^a-zA-Z0-9 ]|(pdf)/gm, ""));
      });
    }
    return fileDownloaded;
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
