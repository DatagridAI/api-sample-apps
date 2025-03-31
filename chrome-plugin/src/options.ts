import { getApiKey, setApiKey } from "./utils/storage";
import { DatagridAPI } from "./services/datagrid-api";

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string; // Material Design Icon name
  categoryIcon: string; // Material Design Icon name for the category
}

/**
 *  calendar, company_prospect_researcher, connect_data, create_dataset, data_analysis, 
 data_classification, data_extraction, download_data, fetch_url, image_detection, pdf_extraction, 
 people_prospect_researcher, schedule_recurring_message_tool, schema_info, semantic_search, table_info, web_search
 */
class OptionsUI {
  private readonly apiKeyInput: HTMLInputElement;
  private readonly saveButton: HTMLButtonElement;
  private readonly toggleVisibilityButton: HTMLButtonElement;
  private readonly statusMessage: HTMLElement;
  private readonly eyeIcon: SVGElement;
  private readonly refreshButton: HTMLButtonElement;
  private readonly toolsSelector: HTMLElement;
  private readonly toolsOptions: HTMLElement;
  private readonly optionsList: HTMLElement;
  private readonly toolSearch: HTMLInputElement;
  private readonly selectedTags: HTMLElement;
  private datagridApi: DatagridAPI | undefined;
  private selectedTools: Set<string> = new Set();
  private readonly availableTools: Tool[] = [
    // Action Tools
    {
      id: "calendar",
      name: "Calendar Access",
      description: "Allows the Agent to access and manage your calendar",
      category: "Actions",
      icon: "calendar",
      categoryIcon: "play-circle",
    },
    {
      id: "schedule_recurring_message_tool",
      name: "Schedule Messages",
      description:
        "Automate recurring tasks like sending daily meeting summaries",
      category: "Actions",
      icon: "clock-outline",
      categoryIcon: "play-circle",
    },
    // Data Processing Tools
    {
      id: "data_classification",
      name: "Data Classification",
      description: "Label and categorize data based on priority or type",
      category: "Data Processing",
      icon: "tag-multiple",
      categoryIcon: "database",
    },
    {
      id: "data_extraction",
      name: "Data Extraction",
      description: "Extract and understand data from various sources",
      category: "Data Processing",
      icon: "database-export",
      categoryIcon: "database",
    },
    {
      id: "schema_info",
      name: "Schema Information",
      description: "Understand database schemas and data structures",
      category: "Data Processing",
      icon: "database-cog",
      categoryIcon: "database",
    },
    {
      id: "table_info",
      name: "Table Information",
      description: "Access information about datasets and their structure",
      category: "Data Processing",
      icon: "table",
      categoryIcon: "database",
    },
    // Enhanced Response Tools
    {
      id: "connect_data",
      name: "Data Connection",
      description: "Connect to external data sources and services",
      category: "Enhanced Responses",
      icon: "link-variant",
      categoryIcon: "rocket-launch",
    },
    {
      id: "create_dataset",
      name: "Create Datasets",
      description: "Generate and manage data tables and datasets",
      category: "Enhanced Responses",
      icon: "database-plus",
      categoryIcon: "rocket-launch",
    },
    {
      id: "download_data",
      name: "Download Data",
      description: "Export and download data in various formats",
      category: "Enhanced Responses",
      icon: "download",
      categoryIcon: "rocket-launch",
    },
    // Knowledge Management Tools
    {
      id: "data_analysis",
      name: "Data Analysis",
      description: "Perform statistical analysis and generate insights",
      category: "Knowledge Management",
      icon: "chart-box",
      categoryIcon: "brain",
    },
    {
      id: "image_detection",
      name: "Image Detection",
      description: "Analyze and extract information from images",
      category: "Knowledge Management",
      icon: "image-search",
      categoryIcon: "brain",
    },
    {
      id: "pdf_extraction",
      name: "PDF Extraction",
      description: "Extract and analyze content from PDF documents",
      category: "Knowledge Management",
      icon: "file-pdf-box",
      categoryIcon: "brain",
    },
    {
      id: "semantic_search",
      name: "Semantic Search",
      description: "Advanced context-aware search capabilities",
      category: "Knowledge Management",
      icon: "text-search",
      categoryIcon: "brain",
    },
    // Web Tools
    {
      id: "company_prospect_researcher",
      name: "Company Research",
      description: "Research and gather information about companies",
      category: "Web Tools",
      icon: "office-building",
      categoryIcon: "web",
    },
    {
      id: "people_prospect_researcher",
      name: "People Research",
      description: "Research and gather information about people",
      category: "Web Tools",
      icon: "account-search",
      categoryIcon: "web",
    },
    {
      id: "web_search",
      name: "Web Search",
      description: "Search the internet with source citations",
      category: "Web Tools",
      icon: "web-search",
      categoryIcon: "web",
    },
    {
      id: "fetch_url",
      name: "URL Content",
      description: "Fetch and analyze content from web URLs",
      category: "Web Tools",
      icon: "link-variant",
      categoryIcon: "web",
    },
  ];

  constructor() {
    this.apiKeyInput = document.getElementById("apiKey") as HTMLInputElement;
    this.saveButton = document.getElementById(
      "saveButton"
    ) as HTMLButtonElement;
    this.toggleVisibilityButton = document.getElementById(
      "toggleVisibility"
    ) as HTMLButtonElement;
    this.statusMessage = document.getElementById(
      "statusMessage"
    ) as HTMLElement;
    this.eyeIcon = document.getElementById("eyeIcon") as unknown as SVGElement;
    this.refreshButton = document.getElementById(
      "refreshKnowledge"
    ) as HTMLButtonElement;
    this.toolsSelector = document.getElementById(
      "toolsSelector"
    ) as HTMLElement;
    this.toolsOptions = this.toolsSelector.querySelector(
      ".select-options"
    ) as HTMLElement;
    this.optionsList = this.toolsSelector.querySelector(
      ".options-list"
    ) as HTMLElement;
    this.toolSearch = document.getElementById("toolSearch") as HTMLInputElement;
    this.selectedTags = this.toolsSelector.querySelector(
      ".selected-tags"
    ) as HTMLElement;

    void this.initialize();
  }

  private async initialize() {
    await this.loadApiKey();
    this.setupEventListeners();
    await this.loadSelectedTools();
    await this.loadAvailableTools();
  }

  private async loadApiKey() {
    const apiKey = await getApiKey();
    if (apiKey !== undefined) {
      this.apiKeyInput.value = apiKey;
      this.datagridApi = new DatagridAPI(apiKey);
      this.refreshButton.disabled = false;
    }
  }

  private setupEventListeners() {
    this.saveButton.addEventListener("click", () => this.saveApiKey());
    this.toggleVisibilityButton.addEventListener("click", () =>
      this.toggleVisibility()
    );
    this.refreshButton.addEventListener("click", () => this.refreshKnowledge());

    // Tools selector events
    this.toolsSelector
      .querySelector(".select-header")
      ?.addEventListener("click", () => this.toggleToolsSelector());
    document.addEventListener("click", (e) => this.handleClickOutside(e));
    this.optionsList.addEventListener("change", (e) =>
      this.handleToolSelection(e)
    );
    this.toolSearch.addEventListener("input", () => this.handleSearch());

    this.apiKeyInput.addEventListener("input", () => {
      this.saveButton.disabled = !this.apiKeyInput.value.trim();
    });

    this.apiKeyInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        void this.saveApiKey();
      }
    });
  }

  private async loadAvailableTools() {
    // Since we're using hardcoded tools, we don't need to fetch from API
    this.renderTools();
  }

  private renderTools(searchQuery: string = "") {
    this.optionsList.innerHTML = "";

    // Group tools by category
    const groupedTools = this.groupToolsByCategory(
      this.filterTools(searchQuery)
    );

    if (groupedTools.length === 0) {
      const noResults = document.createElement("div");
      noResults.className = "no-results";
      noResults.textContent = "No tools found";
      this.optionsList.appendChild(noResults);
      return;
    }

    // Render each category and its tools
    groupedTools.forEach(({ category, tools }) => {
      if (category) {
        const categoryHeader = document.createElement("div");
        categoryHeader.className = "category";
        const categoryIcon = tools[0]?.categoryIcon || "folder";
        categoryHeader.innerHTML = `
          <i class="mdi mdi-${categoryIcon}"></i>
          <span>${category}</span>
        `;
        this.optionsList.appendChild(categoryHeader);
      }

      tools.forEach((tool) => {
        const option = document.createElement("div");
        option.className = "option";
        option.innerHTML = `
          <div class="option-header">
            <input type="checkbox" id="tool-${tool.id}" value="${tool.id}" />
            <i class="mdi mdi-${tool.icon}"></i>
            <span class="option-name">${tool.name}</span>
          </div>
          ${
            tool.description
              ? `<div class="option-description">${tool.description}</div>`
              : ""
          }
        `;
        this.optionsList.appendChild(option);
      });
    });

    // Restore selected state
    this.selectedTools.forEach((toolId) => {
      const checkbox = document.getElementById(
        `tool-${toolId}`
      ) as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = true;
      }
    });
  }

  private groupToolsByCategory(
    tools: Tool[]
  ): { category?: string; tools: Tool[] }[] {
    const grouped = new Map<string, Tool[]>();
    const uncategorized: Tool[] = [];

    tools.forEach((tool) => {
      if (tool.category) {
        if (!grouped.has(tool.category)) {
          grouped.set(tool.category, []);
        }
        grouped.get(tool.category)?.push(tool);
      } else {
        uncategorized.push(tool);
      }
    });

    const result: { category?: string; tools: Tool[] }[] = [];

    // Add categorized tools
    grouped.forEach((tools, category) => {
      result.push({ category, tools });
    });

    // Add uncategorized tools at the end
    if (uncategorized.length > 0) {
      result.push({ tools: uncategorized });
    }

    return result;
  }

  private filterTools(query: string): Tool[] {
    if (!query) {
      return this.availableTools;
    }

    const searchQuery = query.toLowerCase();
    return this.availableTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(searchQuery) ||
        tool.description.toLowerCase().includes(searchQuery) ||
        tool.category.toLowerCase().includes(searchQuery)
    );
  }

  private handleSearch() {
    this.renderTools(this.toolSearch.value);
  }

  private toggleToolsSelector() {
    this.toolsSelector.classList.toggle("open");
    if (this.toolsSelector.classList.contains("open")) {
      this.toolSearch.focus();
    }
  }

  private handleClickOutside(e: MouseEvent) {
    if (!this.toolsSelector.contains(e.target as Node)) {
      this.toolsSelector.classList.remove("open");
      this.toolSearch.value = "";
      this.renderTools();
    }
  }

  private handleToolSelection(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.type === "checkbox") {
      if (target.checked) {
        this.selectedTools.add(target.value);
      } else {
        this.selectedTools.delete(target.value);
      }
      this.updateSelectedTags();
      this.saveSelectedTools();
    }
  }

  private updateSelectedTags() {
    this.selectedTags.innerHTML = "";
    this.selectedTools.forEach((toolId) => {
      const tool = this.availableTools.find((t) => t.id === toolId);
      if (tool) {
        const tag = document.createElement("div");
        tag.className = "tag";
        tag.innerHTML = `
          <i class="mdi mdi-${tool.icon}"></i>
          ${tool.name}
          <button type="button" data-tool-id="${tool.id}">X</button>
        `;
        tag.querySelector("button")?.addEventListener("click", () => {
          const checkbox = document.getElementById(
            `tool-${tool.id}`
          ) as HTMLInputElement;
          if (checkbox) {
            checkbox.checked = false;
            this.selectedTools.delete(tool.id);
            this.updateSelectedTags();
            this.saveSelectedTools();
          }
        });
        this.selectedTags.appendChild(tag);
      }
    });
  }

  private async loadSelectedTools() {
    try {
      const tools = await chrome.storage.sync.get("selectedTools");
      if (tools.selectedTools) {
        this.selectedTools = new Set(tools.selectedTools);
        this.updateSelectedTags();
      }
    } catch (error) {
      console.error("Error loading selected tools:", error);
    }
  }

  private async saveSelectedTools() {
    try {
      await chrome.storage.sync.set({
        selectedTools: Array.from(this.selectedTools),
      });
    } catch (error) {
      console.error("Error saving selected tools:", error);
    }
  }

  private async saveApiKey() {
    const apiKey = this.apiKeyInput.value.trim();

    if (!apiKey) {
      this.showStatus("Please enter an API key", "error");
      return;
    }

    try {
      await setApiKey(apiKey);
      this.datagridApi = new DatagridAPI(apiKey);
      this.refreshButton.disabled = false;
      await this.loadAvailableTools();
      this.showStatus("API key saved successfully", "success");
    } catch (error) {
      console.error("Error saving API key:", error);
      this.showStatus("Failed to save API key", "error");
    }
  }

  private async refreshKnowledge() {
    if (!this.datagridApi) {
      this.showStatus("Please save your API key first", "error");
      return;
    }

    try {
      this.refreshButton.disabled = true;
      await this.datagridApi.listKnowledge();
      this.showStatus("Knowledge list refreshed successfully", "success");
    } catch (error) {
      console.error("Error refreshing knowledge list:", error);
      this.showStatus("Failed to refresh knowledge list", "error");
    } finally {
      this.refreshButton.disabled = false;
    }
  }

  private toggleVisibility() {
    const isPassword = this.apiKeyInput.type === "password";
    this.apiKeyInput.type = isPassword ? "text" : "password";

    // Update the eye icon
    if (isPassword) {
      this.eyeIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      `;
    } else {
      this.eyeIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      `;
    }
  }

  private showStatus(message: string, type: "success" | "error") {
    this.statusMessage.textContent = message;
    this.statusMessage.className = `status-message ${type}`;
    this.statusMessage.style.display = "block";

    // Hide the message after 3 seconds
    setTimeout(() => {
      this.statusMessage.style.display = "none";
    }, 3000);
  }
}

// Initialize the options UI when the document is loaded
document.addEventListener("DOMContentLoaded", () => {
  new OptionsUI();
});
