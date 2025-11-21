export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text?: string;
  imageUrl?: string;
}

export interface ColumnInfo {
  name: string;
  type: string;
  values: string[];
}

export interface SchemaData {
  columns: ColumnInfo[];
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
