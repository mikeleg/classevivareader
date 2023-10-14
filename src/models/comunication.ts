export interface Comunication {
  title: string;
  comId: string;
  allegatoIds: string[];
  filenames: FileComunication[];
}

export interface FileComunication {
  filename: string;
  filenameClean: string;
  filenameDownload: string;
}