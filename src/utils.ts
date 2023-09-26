import fs from "fs";
import path from "path";
import { DOWNLOAD_FOLDER } from "./const";
import { Comunication } from "./models/comunication";

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
}
