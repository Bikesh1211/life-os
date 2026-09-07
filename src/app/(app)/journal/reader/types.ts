export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "quote"; text: string }
  | { type: "chapterBreak" }
  | { type: "image"; src: string; alt?: string; caption?: string }
  | { type: "editorial"; src: string; alt?: string; caption?: string; text: string }
  | { type: "gallery"; images: { src: string; alt?: string; caption?: string }[] };

export type ReaderEntry = {
  id: number;
  uuid?: string;
  date: string;
  title: string;
  subtitle?: string;
  location?: string;
  weather?: string;
  mood?: string;
  tags: string[];
  category?: string;
  visibility?: string;
  slug?: string;
  cover_image_url?: string;
  readTime?: number;
  content: ContentBlock[];
};

export type ReadingSettings = {
  theme: string;
  fontSize: number;
  lineHeight: string;
  width: string;
  font: string;
};

export type ToastState = {
  message: string;
  visible: boolean;
};
