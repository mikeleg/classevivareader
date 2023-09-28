import fs from "fs";
import path from "path";
import { DOWNLOAD_FOLDER } from "./const";
import { Comunication } from "./models/comunication";
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
  static convertProcessArgsToStudent(args:any[]) {
    return {
      utente: args[2],
      password: args[3],
      nome: args[4],
    } as Student;
  }
}
