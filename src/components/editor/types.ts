export interface EditorProps {
  content?: unknown;
  onChange?: (json: unknown, html: string, text: string) => void;
  placeholder?: string;
  editable?: boolean;
  minHeight?: string;
  showToolbar?: boolean;
  className?: string;
}

export interface EditorRef {
  getJSON: () => unknown;
  getHTML: () => string;
  getText: () => string;
  clear: () => void;
  focus: () => void;
}

export type EditorChangeHandler = NonNullable<EditorProps["onChange"]>;
