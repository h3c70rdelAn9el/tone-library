export interface Tone {
  id: string;
  name: string;
  tags: string[];
  notes: string;
  /** Filename string and/or local object URL string for display */
  namFile: string;
  irFile: string;
  namFileURL: string | null;
  irFileURL: string | null;
  createdAt: string;
  favorite: boolean;
}
