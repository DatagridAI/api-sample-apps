# Datagrid AI Chrome Extension

A Chrome extension that allows you to chat with Datagrid AI about any webpage. The extension adds a side panel interface where you can interact with the AI assistant.

## Features

- Chat interface in Chrome's side panel
- API key management through options page
- Clear chat history functionality
- Real-time typing indicators
- Persistent chat history
- Settings management

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Google Chrome (v114 or higher)

## Installation

1. Clone the repository:

```bash
git clone [your-repository-url]
cd chrome-plugin
```

2. Install dependencies:

```bash
npm install
```

3. Build the extension:

```bash
npm run build
```

## Loading the Extension in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the `dist` folder from your build

## Development

### Available Scripts

- `npm run build` - Builds the extension for production
- `npm run dev` - Builds the extension and watches for changes
- `npm run clean` - Cleans the build directory

### Project Structure
