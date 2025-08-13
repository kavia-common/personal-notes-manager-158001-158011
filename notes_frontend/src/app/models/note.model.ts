export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  archived?: boolean;
}
