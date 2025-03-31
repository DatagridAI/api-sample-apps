import { Message, DatagridResponse } from "../types/chat";
import { Datagrid } from "datagrid-ai";

export interface Knowledge {
  id: string;
  name: string;
  status: "pending" | "partial" | "ready";
  created_at: string;
}

export interface StreamingResponse {
  text: string;
  conversationId: string;
  done: boolean;
}

interface StreamEvent {
  event: "delta";
  data: {
    delta: {
      text: string;
    };
  };
}

export class DatagridAPI {
  private readonly client: Datagrid;

  constructor(apiKey: string) {
    this.client = new Datagrid({ apiKey });
    console.debug("DatagridAPI initialized");
  }

  async listKnowledge(): Promise<Array<Knowledge>> {
    try {
      const knowledgePage = await this.client.knowledge.list();
      return knowledgePage.data;
    } catch (error) {
      console.error("Failed to list knowledge:", error);
      throw error;
    }
  }

  async chat(
    messages: Array<Message>,
    htmlContext?: string,
    knowledgeId?: string | null | undefined,
    conversation_id?: string
  ): Promise<DatagridResponse> {
    try {
      // Get the last message from the user as the prompt
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type !== "user") {
        throw new Error("Last message must be from user");
      }

      const prompt = this.getPrompt(lastMessage.content, htmlContext);

      const knowledge_ids =
        typeof knowledgeId === "string" ? [knowledgeId] : [];
      const converseParams = {
        prompt,
        stream: false,
        config: {
          agent_model: "mapgie-1.1",
          knowledge_ids,
        },
        conversation_id,
      } as const;

      const response = await this.client.converse(converseParams);

      console.log("Received response from Datagrid API:", response);

      return {
        response: response.content[0].text,
        conversationId: response.conversation_id,
      };
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  }

  async chatStream(
    messages: Array<Message>,
    htmlContext?: string,
    knowledgeId?: string | null | undefined,
    conversation_id?: string,
    onChunk?: (chunk: StreamingResponse) => void,
    tools?: Datagrid.AgentTools[]
  ): Promise<DatagridResponse> {
    try {
      // Get the last message from the user as the prompt
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type !== "user") {
        throw new Error("Last message must be from user");
      }

      const prompt = this.getPrompt(lastMessage.content, htmlContext);

      const knowledge_ids =
        typeof knowledgeId === "string" ? [knowledgeId] : [];
      const converseParams = {
        prompt,
        stream: true,
        config: {
          agent_model: "mapgie-1.1",
          knowledge_ids,
          agent_tools: tools,
        },
        conversation_id,
      } as const;

      let fullResponse = "";
      let finalConversationId = "";

      const stream = await this.client.converse(converseParams);

      for await (const event of stream) {
        const streamEvent = event as StreamEvent;
        if (streamEvent.event === "delta") {
          const chunkText = streamEvent.data.delta.text;
          fullResponse += chunkText;

          if (onChunk) {
            onChunk({
              text: chunkText,
              conversationId: finalConversationId,
              done: false,
            });
          }
        }
      }

      if (onChunk) {
        onChunk({
          text: "",
          conversationId: finalConversationId,
          done: true,
        });
      }

      return {
        response: fullResponse,
        conversationId: finalConversationId,
      };
    } catch (error) {
      console.error("Streaming API call failed:", error);
      throw error;
    }
  }

  private getPrompt(
    userMessage: string,
    htmlContext: string | undefined
  ): string {
    return `
    User Message: ${userMessage}
    ${htmlContext !== undefined ? `Context: ${htmlContext}` : ""}
    `;
  }
}
