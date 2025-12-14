export interface ExtractedContent {
  id: string;
  title: string;
  content: string;
  url: string;
  extractedAt: Date;
  folderId?: string;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  itemCount: number;
}

export interface AppState {
  folders: Folder[];
  contents: ExtractedContent[];
}
