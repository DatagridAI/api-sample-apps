/// <reference types="chrome"/>
import { getApiKey } from "./utils/storage";
import { DatagridAPI, Knowledge } from "./services/datagrid-api";
import { Message, ChatState } from "./types/chat";
import type { Datagrid } from "datagrid-ai";

class ChatUI {
  private readonly chatContainer: HTMLElement;
  private readonly messageInput: HTMLTextAreaElement;
  private readonly sendButton: HTMLButtonElement;
  private readonly apiKeyError: HTMLElement;
  private readonly typingIndicator: HTMLElement;
  private readonly settingsButton: HTMLElement;
  private readonly chatState: ChatState;
  private readonly clearButton: HTMLElement;
  private readonly knowledgeSelector: HTMLElement;
  private readonly knowledgeOptions: HTMLElement;
  private readonly optionsList: HTMLElement;
  private readonly knowledgeSearch: HTMLInputElement;
  private readonly selectedTags: HTMLElement;
  private datagridApi: DatagridAPI | undefined;
  private selectedKnowledgeIds: Set<string> = new Set();
  private allKnowledge: Array<Knowledge> = [];

  constructor() {
    this.chatContainer = document.getElementById(
      "chatContainer"
    ) as HTMLElement;
    this.messageInput = document.getElementById(
      "messageInput"
    ) as HTMLTextAreaElement;
    this.sendButton = document.getElementById(
      "sendButton"
    ) as HTMLButtonElement;
    this.apiKeyError = document.getElementById("apiKeyError") as HTMLElement;
    this.typingIndicator = document.getElementById(
      "typingIndicator"
    ) as HTMLElement;
    this.settingsButton = document.getElementById(
      "settingsButton"
    ) as HTMLButtonElement;
    this.clearButton = document.getElementById("clearButton")!;
    this.knowledgeSelector = document.getElementById(
      "knowledgeSelector"
    ) as HTMLElement;
    this.knowledgeOptions = this.knowledgeSelector.querySelector(
      ".select-options"
    ) as HTMLElement;
    this.optionsList = this.knowledgeSelector.querySelector(
      ".options-list"
    ) as HTMLElement;
    this.knowledgeSearch = document.getElementById(
      "knowledgeSearch"
    ) as HTMLInputElement;
    this.selectedTags = this.knowledgeSelector.querySelector(
      ".selected-tags"
    ) as HTMLElement;
    this.chatState = {
      messages: [],
      isLoading: false,
      conversationId: undefined,
    };

    void this.initialize();
  }

  private async initialize() {
    try {
      const apiKey = await getApiKey();
      if (apiKey === undefined) {
        this.showApiKeyError();
        this.setupEventListeners();
        return;
      }

      this.datagridApi = new DatagridAPI(apiKey);
      await this.loadMessages();
      await this.loadKnowledge();
      this.setupEventListeners();
      this.messageInput.disabled = false;
      this.sendButton.disabled = false;
      this.apiKeyError.style.display = "none";
    } catch (error) {
      console.error("Error initializing chat:", error);
      this.showApiKeyError();
    }
  }

  private async loadKnowledge() {
    if (!this.datagridApi) {
      return;
    }

    try {
      const result = await chrome.storage.local.get(["selectedKnowledgeIds"]);
      this.allKnowledge = await this.datagridApi.listKnowledge();
      this.renderKnowledge();

      if (result.selectedKnowledgeIds !== undefined) {
        this.selectedKnowledgeIds = new Set(result.selectedKnowledgeIds);
        this.updateSelectedTags();
      }
    } catch (error) {
      console.error("Error loading knowledge:", error);
    }
  }

  private renderKnowledge(searchQuery: string = "") {
    this.optionsList.innerHTML = "";

    const filteredKnowledge = this.filterKnowledge(searchQuery);

    if (filteredKnowledge.length === 0) {
      const noResults = document.createElement("div");
      noResults.className = "no-results";
      noResults.textContent = "No knowledge found";
      this.optionsList.appendChild(noResults);
      return;
    }

    filteredKnowledge.forEach((knowledge) => {
      const option = document.createElement("div");
      option.className = `option ${
        this.selectedKnowledgeIds.has(knowledge.id) ? "selected" : ""
      }`;
      option.innerHTML = `
        <div class="option-header">
          <input type="checkbox" id="knowledge-${knowledge.id}" value="${knowledge.id}" />
          <i class="mdi mdi-book-open-page-variant"></i>
          <span class="option-name">${knowledge.name}</span>
        </div>
        <div class="option-description">${knowledge.status}</div>
      `;
      const checkbox = option.querySelector("input") as HTMLInputElement;
      checkbox.checked = this.selectedKnowledgeIds.has(knowledge.id);
      checkbox.addEventListener("change", () =>
        this.handleKnowledgeSelection(knowledge, checkbox.checked)
      );
      this.optionsList.appendChild(option);
    });
  }

  private filterKnowledge(query: string): Knowledge[] {
    if (!query) {
      return this.allKnowledge;
    }

    const searchQuery = query.toLowerCase();
    return this.allKnowledge.filter(
      (knowledge) =>
        knowledge.name.toLowerCase().includes(searchQuery) ||
        knowledge.status.toLowerCase().includes(searchQuery)
    );
  }

  private handleKnowledgeSelection(knowledge: Knowledge, checked: boolean) {
    if (knowledge.status !== "ready") {
      return;
    }

    if (checked) {
      this.selectedKnowledgeIds.add(knowledge.id);
    } else {
      this.selectedKnowledgeIds.delete(knowledge.id);
    }

    this.updateSelectedTags();
    this.renderKnowledge(this.knowledgeSearch.value);

    void chrome.storage.local.set({
      selectedKnowledgeIds: Array.from(this.selectedKnowledgeIds),
    });
  }

  private updateSelectedTags() {
    const selectedTagsContainer = this.knowledgeSelector.querySelector(
      ".selected-tags"
    ) as HTMLElement;
    selectedTagsContainer.innerHTML = "";

    this.selectedKnowledgeIds.forEach((knowledgeId) => {
      const knowledge = this.allKnowledge.find((k) => k.id === knowledgeId);
      if (knowledge) {
        const tag = document.createElement("div");
        tag.className = "tag";
        tag.innerHTML = `
          <i class="mdi mdi-book-open-page-variant"></i>
          ${knowledge.name}
          <button type="button">x</button>
        `;
        tag.querySelector("button")?.addEventListener("click", (e) => {
          e.stopPropagation(); // Prevent dropdown from opening when clicking the remove button
          this.selectedKnowledgeIds.delete(knowledge.id);
          this.updateSelectedTags();
          this.renderKnowledge(this.knowledgeSearch.value);
          void chrome.storage.local.set({
            selectedKnowledgeIds: Array.from(this.selectedKnowledgeIds),
          });
        });
        selectedTagsContainer.appendChild(tag);
      }
    });
  }

  private setupEventListeners() {
    this.messageInput.addEventListener("input", () => {
      this.messageInput.style.height = "auto";
      this.messageInput.style.height = this.messageInput.scrollHeight + "px";
      this.sendButton.disabled = !this.messageInput.value.trim();
    });

    this.messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!this.sendButton.disabled) {
          void this.sendMessage();
        }
      }
    });

    this.sendButton.addEventListener("click", () => this.sendMessage());

    this.settingsButton.addEventListener("click", () => {
      void chrome.runtime.openOptionsPage();
    });

    // Add clear history button handler
    this.clearButton?.addEventListener("click", () => {
      this.clearChatHistory();
    });

    // Knowledge selector events
    this.knowledgeSelector
      .querySelector(".select-header")
      ?.addEventListener("click", () => this.toggleKnowledgeSelector());
    document.addEventListener("click", (e) => this.handleClickOutside(e));
    this.knowledgeSearch.addEventListener("input", () => this.handleSearch());
  }

  private showTypingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "typing-indicator";
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("div");
      dot.className = "typing-dot";
      indicator.appendChild(dot);
    }
    this.chatContainer.appendChild(indicator);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  private removeTypingIndicator() {
    const indicator = this.chatContainer.querySelector(".typing-indicator");
    if (indicator) {
      indicator.remove();
    }
  }

  private async getPageContent(): Promise<string> {
    try {
      console.log("Getting page content...");
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab?.id === undefined) {
        console.log("No active tab found");
        return "";
      }

      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // First try to get selected text
          const selection = window.getSelection()?.toString() ?? "";
          if (selection) {
            return selection;
          }

          // If no selection, get visible text content
          const content = Array.from(document.body.getElementsByTagName("*"))
            .map((element) => {
              const htmlElement = element as HTMLElement;
              if (htmlElement.offsetWidth > 0 && htmlElement.offsetHeight > 0) {
                return htmlElement.textContent;
              }
              return "";
            })
            .join("\n")
            .replace(/\s+/g, " ")
            .trim();

          return content;
        },
      });

      const pageContent = result.result ?? "";
      console.log("Got page content, length:", pageContent.length);
      return pageContent;
    } catch (error) {
      console.error("Error getting page content:", error);
      return "";
    }
  }

  private async getPageImages(): Promise<string> {
    try {
      console.log("Getting page images...");
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab?.id === undefined) {
        console.log("No active tab found");
        return "";
      }

      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Get all images that are visible and have a reasonable size
          const images = Array.from(document.getElementsByTagName("img"))
            .filter((img) => {
              // Check if image is visible and loaded
              const rect = img.getBoundingClientRect();
              const style = window.getComputedStyle(img);
              return (
                rect.width > 100 && // Minimum width
                rect.height > 100 && // Minimum height
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                img.complete && // Image is loaded
                img.naturalWidth > 0
              ); // Image has content
            })
            .map((img) => {
              // Get image information
              return {
                src: img.src,
                alt: img.alt || "No description available",
                width: img.width,
                height: img.height,
                location: img.getBoundingClientRect(),
              };
            });

          // Format the image information
          return images
            .map(
              (img) =>
                `Image: ${img.alt}\nSize: ${img.width}x${img.height}\nURL: ${img.src}\n`
            )
            .join("\n");
        },
      });

      const imageContent = result.result ?? "";
      console.log(
        "Got image content, number of images:",
        imageContent.split("Image:").length - 1
      );
      return imageContent;
    } catch (error) {
      console.error("Error getting page images:", error);
      return "";
    }
  }

  private async getSelectedPageContent(): Promise<string> {
    try {
      console.log("Getting selected content...");
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab?.id === undefined) {
        console.log("No active tab found");
        return "";
      }

      // Check if we're on a chrome:// URL
      if (
        tab.url?.startsWith("chrome://") ||
        tab.url?.startsWith("chrome-extension://")
      ) {
        console.log("Cannot access chrome:// URLs");
        return "";
      }

      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          return window.getSelection()?.toString() ?? "";
        },
      });

      const selectedContent = result.result ?? "";
      console.log("Got selected content, length:", selectedContent.length);
      return selectedContent;
    } catch (error) {
      console.error("Error getting selected content:", error);
      return "";
    }
  }

  private async sendMessage() {
    const content = this.messageInput.value.trim();
    if (!content || !this.datagridApi || this.chatState.isLoading) {
      return;
    }

    const selectedContent = await this.getSelectedPageContent();
    const { selectedTools } = await chrome.storage.sync.get("selectedTools");

    // Parse the selected tools from storage
    const tools: Array<Datagrid.AgentTools> | undefined = selectedTools
      ? selectedTools
      : undefined;

    const message: Message = {
      id: crypto.randomUUID(),
      type: "user",
      content,
      selectedContent,
      timestamp: Date.now(),
    };

    try {
      this.chatState.isLoading = true;
      this.sendButton.disabled = true;

      // Add user message to both UI and state
      this.addMessage(message);
      this.messageInput.value = "";
      this.messageInput.style.height = "auto";

      // Show typing indicator
      this.showTypingIndicator();
      // Create a temporary message element for streaming response
      const streamingMessage: Message = {
        id: crypto.randomUUID(),
        type: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      // Get streaming response from API
      let firstMessage = true;
      const response = await this.datagridApi.chatStream(
        this.chatState.messages,
        selectedContent,
        Array.from(this.selectedKnowledgeIds),
        this.chatState.conversationId,
        (chunk) => {
          if (firstMessage) {
            // Add streaming message to both UI and state
            this.addMessage(streamingMessage);
            this.removeTypingIndicator();

            firstMessage = false;
          }
          if (!chunk.done) {
            // Update the streaming message content
            streamingMessage.content += chunk.text;
            this.updateMessageContent(
              streamingMessage.id,
              streamingMessage.content
            );
          }
        },
        tools
      );

      // Update conversation ID if we got one
      if (response.conversationId) {
        this.chatState.conversationId = response.conversationId;
      }

      try {
        await navigator.clipboard.writeText(response.response);
      } catch {
        streamingMessage.content += "\n\n_(Copied to clipboard failed)_";
        this.updateMessageContent(
          streamingMessage.id,
          streamingMessage.content
        );
      }
    } catch (error) {
      this.addMessage({
        id: crypto.randomUUID(),
        type: "assistant",
        content: `Sorry, I encountered an error processing your request.`,
        timestamp: Date.now(),
      });
      console.error("Error sending message:", error);
    } finally {
      this.removeTypingIndicator();
      this.chatState.isLoading = false;
      this.sendButton.disabled = false;
      this.saveMessages();
    }
  }

  private updateMessageContent(messageId: string, content: string) {
    const messageElement = this.chatContainer.querySelector(
      `[data-message-id="${messageId}"]`
    );
    if (messageElement) {
      const mainContentElement = messageElement.querySelector(".main-content");
      if (mainContentElement) {
        mainContentElement.innerHTML = (window as any).marked.parse(content);
      }
    }
  }

  private addMessage(message: Message) {
    this.chatState.messages.push(message);

    const messageElement = document.createElement("div");
    messageElement.classList.add("message", `${message.type}-message`);
    messageElement.setAttribute("data-message-id", message.id);

    // Create content container
    const contentElement = document.createElement("div");
    contentElement.classList.add("message-content");

    // Add selected content if present
    if (message.selectedContent) {
      const selectedContentElement = document.createElement("div");
      selectedContentElement.classList.add("selected-content");
      selectedContentElement.innerHTML = (window as any).marked.parse(
        message.selectedContent
      );
      contentElement.appendChild(selectedContentElement);
    }

    // Add main message content
    const mainContentElement = document.createElement("div");
    mainContentElement.classList.add("main-content");
    mainContentElement.innerHTML = (window as any).marked.parse(
      message.content
    );
    contentElement.appendChild(mainContentElement);

    messageElement.appendChild(contentElement);

    const timeElement = document.createElement("div");
    timeElement.classList.add("message-time");
    timeElement.textContent = new Date(message.timestamp).toLocaleTimeString();
    messageElement.appendChild(timeElement);

    this.chatContainer.appendChild(messageElement);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  private saveMessages() {
    void chrome.storage.local.set({
      chatMessages: this.chatState.messages,
      conversationId: this.chatState.conversationId,
    });
  }

  private async loadMessages() {
    const result = await chrome.storage.local.get("chatMessages");
    if (result.chatMessages !== undefined) {
      this.chatState.messages = result.chatMessages;
      this.chatState.messages.forEach((message) => this.addMessage(message));
    }
    if (result.conversationId !== undefined) {
      this.chatState.conversationId = result.conversationId;
    }
  }

  private showApiKeyError() {
    this.apiKeyError.style.display = "block";
    this.messageInput.disabled = true;
    this.sendButton.disabled = true;
  }

  clearChatHistory() {
    // Clear messages from state
    this.chatState.messages = [];
    this.chatState.conversationId = undefined;

    // Clear messages from storage
    void chrome.storage.local.remove("chatMessages");

    // Clear messages from UI
    this.chatContainer.innerHTML = "";
  }

  private toggleKnowledgeSelector() {
    this.knowledgeSelector.classList.toggle("open");
    if (this.knowledgeSelector.classList.contains("open")) {
      this.knowledgeSearch.focus();
    }
  }

  private handleClickOutside(e: MouseEvent) {
    if (!this.knowledgeSelector.contains(e.target as Node)) {
      this.knowledgeSelector.classList.remove("open");
      this.knowledgeSearch.value = "";
      this.renderKnowledge();
    }
  }

  private handleSearch() {
    this.renderKnowledge(this.knowledgeSearch.value);
  }
}

// Initialize the chat UI when the document is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ChatUI();
});
