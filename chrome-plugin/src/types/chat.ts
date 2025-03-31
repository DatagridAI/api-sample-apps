export interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  selectedContent?: string;
  timestamp: number;
}

export interface ChatState {
  messages: Array<Message>;
  conversationId: string | undefined;
  isLoading: boolean;
  error?: string;
}

export interface DatagridResponse {
  response: string;
  conversationId: string;
  error?: string;
}
