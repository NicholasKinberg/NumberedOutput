<!-- 2d247a27-d7b8-4356-a97a-b3d812056aeb 1f1c0179-7acb-47cd-8140-0f2e594165ea -->
# Numbered Output LLM Extension Development Plan

## Phase 1: Modify Continue Extension for Numbered Output

### 1.1 Locate Continue Configuration

- Find the Continue extension's configuration directory at `~/.continue/config.json` (macOS)
- The Continue extension uses a JSON configuration file to customize behavior including system prompts

### 1.2 Modify System Prompt

- Edit `~/.continue/config.json` to add a custom system prompt that enforces numbered output
- Add or modify the `systemMessage` property in the model configuration
- Example structure:
  ```json
  {
    "models": [{
      "title": "Your Model",
      "provider": "ollama",
      "model": "your-model-name",
      "systemMessage": "When providing code suggestions or steps, ALWAYS number each item clearly (1., 2., 3., etc.). Format all code-related responses with numbered steps."
    }]
  }
  ```


### 1.3 Test Continue Extension

- Restart VS Code after configuration changes
- Test the modified Continue extension with various prompts to verify numbered output consistency

## Phase 2: Build New VS Code Extension

### 2.1 Setup Development Environment

- Initialize TypeScript-based extension using Yeoman generator: `yo code`
- Select "New Extension (TypeScript)" option
- Project structure will include:
  - `package.json` - extension manifest
  - `src/extension.ts` - main extension entry point
  - `tsconfig.json` - TypeScript configuration

### 2.2 Core Extension Architecture

Create the following key components:

**Extension Entry Point** (`src/extension.ts`)

- Register commands for opening chat panel
- Initialize extension services on activation

**Chat Panel** (`src/chatPanel.ts`)

- Implement webview-based chat interface using VS Code Webview API
- Handle user input and display LLM responses
- Manage message history within the panel

**Ollama Service** (`src/ollamaService.ts`)

- Implement API client for Ollama REST API endpoints:
  - POST `/api/generate` for chat completions
  - POST `/api/chat` for conversational interactions
- Handle streaming responses from Ollama
- Include system prompt that enforces numbered output for code suggestions
- Default base URL: `http://localhost:11434`

**Context Manager** (`src/contextManager.ts`)

- Extract context from currently active editor
- Fetch code from GitHub repositories using GitHub API
- Aggregate context to provide to LLM

**History Manager** (`src/historyManager.ts`)

- Store chat history using VS Code's `globalState` or `workspaceState`
- Implement session management
- Provide methods to retrieve and display past conversations

### 2.3 Numbered Output Processing

- Implement post-processing of LLM responses in `src/responseFormatter.ts`
- Parse response text to identify code suggestions and steps
- Enforce numbering format (1., 2., 3.) for code-related items
- Apply formatting before displaying in chat panel

### 2.4 User Interface Components

**package.json Commands:**

```json
{
  "contributes": {
    "commands": [
      {
        "command": "numberedOutput.openChat",
        "title": "Open AI Assistant Chat"
      },
      {
        "command": "numberedOutput.addFileContext",
        "title": "Add File Context to Chat"
      }
    ]
  }
}
```

**Webview HTML/CSS/JS** (`media/` directory)

- Create chat interface with input box and message display
- Style with VS Code theme integration
- Handle user interactions and send messages to extension backend

### 2.5 Configuration Settings

Add extension settings in `package.json`:

```json
{
  "configuration": {
    "properties": {
      "numberedOutput.ollamaUrl": {
        "type": "string",
        "default": "http://localhost:11434"
      },
      "numberedOutput.modelName": {
        "type": "string",
        "default": "your-model-name"
      }
    }
  }
}
```

## Phase 3: Implementation Details

### 3.1 Key Files to Create

- `src/extension.ts` - Extension activation and command registration
- `src/chatPanel.ts` - Webview chat panel manager
- `src/ollamaService.ts` - Ollama API integration
- `src/contextManager.ts` - Code context extraction
- `src/historyManager.ts` - Chat history persistence
- `src/responseFormatter.ts` - Numbered output formatting
- `media/chat.html` - Chat UI template
- `media/styles.css` - Chat UI styles
- `media/script.js` - Chat UI logic

### 3.2 Essential npm Dependencies

- `@types/vscode` - VS Code API types
- `axios` or `node-fetch` - HTTP requests to Ollama API
- `@octokit/rest` - GitHub API integration (optional, for GitHub context)

### 3.3 Testing Strategy

- Use VS Code's Extension Development Host (F5) for debugging
- Test with various Ollama models and prompts
- Verify numbered output consistency
- Test context extraction from files and repositories
- Validate chat history persistence across sessions

## Phase 4: Packaging and Deployment

### 4.1 Prepare for Distribution

- Update `package.json` with proper metadata
- Add README.md with installation and usage instructions
- Include LICENSE file
- Add extension icon

### 4.2 Package Extension

- Install `vsce`: `npm install -g @vscode/vsce`
- Build extension: `vsce package`
- Output: `.vsix` file for distribution

### 4.3 Local Installation

- Install via VS Code: Extensions → Install from VSIX
- Or use command: `code --install-extension extension-name.vsix`

## Key Technical Considerations

- **Ollama API Format**: Use `/api/chat` endpoint with proper message format including system prompt
- **Numbered Output Enforcement**: Apply both at system prompt level and post-processing level for maximum consistency
- **Context Management**: Limit context size to avoid token limits (implement truncation strategy)
- **Error Handling**: Graceful fallbacks when Ollama server is unavailable
- **Performance**: Implement streaming responses for better UX with large responses

### To-dos

- [ ] Modify Continue extension config.json to enforce numbered output via custom system message
- [ ] Create new TypeScript VS Code extension using Yeoman generator
- [ ] Build Ollama API service with chat endpoint integration and numbered output system prompt
- [ ] Develop webview-based chat interface with message display and input handling
- [ ] Build context extraction for files and GitHub repositories
- [ ] Create chat history persistence using VS Code storage API
- [ ] Implement post-processing to ensure code suggestions are numbered
- [ ] Test extension thoroughly and package for distribution
