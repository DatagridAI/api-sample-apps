import { getApiKey, setApiKey } from "./utils/storage";
import { DatagridAPI } from "./services/datagrid-api";

class OptionsUI {
  private readonly apiKeyInput: HTMLInputElement;
  private readonly saveButton: HTMLButtonElement;
  private readonly toggleVisibilityButton: HTMLButtonElement;
  private readonly statusMessage: HTMLElement;
  private readonly eyeIcon: SVGElement;
  private readonly refreshButton: HTMLButtonElement;
  private datagridApi: DatagridAPI | undefined;

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

    void this.initialize();
  }

  private async initialize() {
    await this.loadApiKey();
    this.setupEventListeners();
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
