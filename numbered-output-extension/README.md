# Numbered Output LLM Assistant

An AI coding assistant for Visual Studio Code powered by Ollama that enforces numbered output for code suggestions, steps, and recommendations. Get structured, easy-to-follow responses with automatic numbering.

## Features

✨ **Numbered Output**: All code suggestions and steps are automatically numbered (1., 2., 3., etc.) for clarity and ease of implementation

🤖 **Local Ollama Integration**: Connect to your local Ollama instance for privacy-focused AI assistance

💬 **Interactive Chat Interface**: Clean, intuitive chat panel for conversing with your AI assistant

📝 **Context Management**: Add file context, GitHub repositories, and code snippets to enhance AI responses

📚 **GitHub Integration**: Fetch code directly from GitHub repositories for context-aware assistance

💾 **Chat History**: Persistent chat history that survives VS Code restarts

⚙️ **Configurable**: Customize Ollama server URL, model selection, and context limits

## Prerequisites

Before using this extension, you need to have [Ollama](https://ollama.ai) installed and running on your system.

### Installing Ollama

1. Visit [https://ollama.ai](https://ollama.ai) and download Ollama for your platform
2. Install Ollama following the platform-specific instructions
3. Pull a model: `ollama pull llama2` (or any other model you prefer)
4. Start the Ollama server (it usually runs automatically as a service)

## Installation

### From VSIX File

1. Download the latest `.vsix` file from the releases
2. Open VS Code
3. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
4. Click the "..." menu at the top of the Extensions panel
5. Select "Install from VSIX..."
6. Navigate to the downloaded `.vsix` file and select it

### From Command Line

```bash
code --install-extension numbered-output-llm-0.0.1.vsix
```

## Usage

### Opening the Chat Panel

Open the Command Palette (Ctrl+Shift+P / Cmd+Shift+P) and run:

```
Open AI Assistant Chat
```

Or use the keyboard shortcut (if configured).

### Basic Chat

1. Type your question or request in the input box
2. Press Enter or click Send
3. Receive numbered, structured responses from the AI

### Adding File Context

**Current File Context:**
- Open a file in the editor
- Run command: `Add File Context to Chat`
- The current file will be added as context for your next queries

**GitHub File from URL:**
- Run command: `Add GitHub File from URL`
- Paste a GitHub file URL (e.g., `https://github.com/user/repo/blob/main/file.ts`)
- The file content will be fetched and added to context

**GitHub Repository README:**
- Run command: `Add GitHub Repository README`
- Enter repository in format: `owner/repo`
- The repository README will be added to context

### GitHub Integration

For private repositories or higher rate limits:

1. Run command: `Set GitHub Access Token`
2. Enter your [GitHub Personal Access Token](https://github.com/settings/tokens)
3. The token is stored securely in VS Code settings

### Clearing Context

Run command: `Clear All Context` to remove all added file context and start fresh.

## Configuration

Access settings via File → Preferences → Settings, then search for "Numbered Output":

### `numberedOutput.ollamaUrl`
- **Default**: `http://localhost:11434`
- **Description**: URL of your Ollama server
- Change if your Ollama instance runs on a different host or port

### `numberedOutput.modelName`
- **Default**: `llama2`
- **Description**: Name of the Ollama model to use
- Available models depend on what you've pulled with `ollama pull`
- Popular options: `llama2`, `codellama`, `mistral`, `mixtral`, `deepseek-coder`

### `numberedOutput.githubToken`
- **Default**: (empty)
- **Description**: GitHub Personal Access Token for private repos
- Optional for public repositories

### `numberedOutput.maxContextLength`
- **Default**: `2000`
- **Description**: Maximum character length for context snippets
- Prevents context overflow with large files

## Example Configuration

```json
{
  "numberedOutput.ollamaUrl": "http://localhost:11434",
  "numberedOutput.modelName": "deepseek-coder",
  "numberedOutput.maxContextLength": 3000
}
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `Open AI Assistant Chat` | Opens the main chat interface |
| `Add File Context to Chat` | Adds the current file to context |
| `Add GitHub File from URL` | Fetches a GitHub file by URL |
| `Add GitHub File to Context` | Manually add a GitHub file path |
| `Add GitHub Repository README` | Fetches repository README |
| `Set GitHub Access Token` | Configure GitHub authentication |
| `Clear All Context` | Removes all added context |

## Troubleshooting

### "Cannot connect to Ollama server"

**Solution:**
1. Verify Ollama is installed: `ollama --version`
2. Check if Ollama is running: `curl http://localhost:11434`
3. Start Ollama if needed (it usually auto-starts)
4. Verify the `numberedOutput.ollamaUrl` setting matches your Ollama instance

### "Model not found"

**Solution:**
1. List available models: `ollama list`
2. Pull the desired model: `ollama pull llama2`
3. Update `numberedOutput.modelName` setting to match an available model

### "GitHub API rate limit exceeded"

**Solution:**
1. Generate a [GitHub Personal Access Token](https://github.com/settings/tokens)
2. Run command: `Set GitHub Access Token`
3. Enter your token to increase rate limits

### Responses not numbered

**Solution:**
The extension enforces numbered output through system prompts and post-processing. If you're still seeing unnumbered output:
1. Try rephrasing your question to explicitly ask for steps
2. Verify your Ollama model is responding correctly
3. Check the extension logs for any errors

## Privacy & Security

- **Local Processing**: All AI processing happens locally via Ollama
- **No Cloud Services**: Your code never leaves your machine (except for GitHub API calls)
- **Token Security**: GitHub tokens are stored securely in VS Code's settings
- **Context Control**: You control what context is shared with the AI

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- Built with the [VS Code Extension API](https://code.visualstudio.com/api)
- Powered by [Ollama](https://ollama.ai)
- GitHub integration via [@octokit/rest](https://github.com/octokit/rest.js)

## Support

For issues, questions, or feature requests, please [open an issue](https://github.com/yourusername/numbered-output-llm/issues) on GitHub.

---

**Happy Coding with Structured AI Assistance! 🚀**

