import { Message, DatagridResponse } from "../types/chat";
import { Datagrid } from "datagrid-ai";

export interface Knowledge {
  id: string;
  name: string;
  status: "pending" | "partial" | "ready";
  created_at: string;
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
