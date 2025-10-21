# Installation Guide - Numbered Output LLM Extension

## Prerequisites

Before installing the extension, ensure you have:

1. **Visual Studio Code** (version 1.74.0 or higher)
2. **Ollama** installed and running locally
   - Download from: https://ollama.ai
   - Pull a model: `ollama pull llama2` (or your preferred model)
   - Verify it's running: `curl http://localhost:11434`

## Installation Methods

### Method 1: Install from VSIX File (Recommended)

#### Using VS Code UI

1. Open Visual Studio Code
2. Go to the Extensions view (Ctrl+Shift+X / Cmd+Shift+X)
3. Click the "..." (More Actions) menu at the top of the Extensions sidebar
4. Select "Install from VSIX..."
5. Navigate to: `/Users/nicholaskinberg/Downloads/NumberedOutput/numbered-output-extension/`
6. Select the file: `numbered-output-llm-0.0.1.vsix`
7. Click "Install"
8. Reload VS Code when prompted

#### Using Command Line

```bash
code --install-extension /Users/nicholaskinberg/Downloads/NumberedOutput/numbered-output-extension/numbered-output-llm-0.0.1.vsix
```

### Method 2: Install from Source (Development)

If you want to run the extension in development mode:

```bash
cd /Users/nicholaskinberg/Downloads/NumberedOutput/numbered-output-extension
npm install
npm run compile
```

Then press F5 in VS Code to launch the Extension Development Host.

## Verification

After installation, verify the extension is working:

1. Open the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type: "Open AI Assistant Chat"
3. The chat panel should open on the right side
4. Try sending a test message

## Initial Configuration

### Configure Ollama Settings

1. Open Settings: File → Preferences → Settings (Ctrl+, / Cmd+,)
2. Search for: "numbered output"
3. Configure the following:

   - **Ollama URL**: Default is `http://localhost:11434`
     - Change only if your Ollama instance runs elsewhere
   
   - **Model Name**: Default is `llama2`
     - Options: `llama2`, `codellama`, `mistral`, `mixtral`, `deepseek-coder`, etc.
     - Must match a model you've pulled with `ollama pull`
   
   - **Max Context Length**: Default is `2000`
     - Adjust based on your needs and model capabilities

### Configure GitHub Integration (Optional)

For accessing private repositories or increasing rate limits:

1. Generate a GitHub Personal Access Token:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo` (for private repos) or just `public_repo`
   - Copy the generated token

2. Set the token in VS Code:
   - Open Command Palette
   - Run: "Set GitHub Access Token"
   - Paste your token
   - Press Enter

## Quick Start

### Basic Usage

1. Open the chat: Command Palette → "Open AI Assistant Chat"
2. Type your question or request
3. Press Enter to send
4. Receive numbered, structured responses

### Adding Context

**Current File:**
```
1. Open a file in the editor
2. Command Palette → "Add File Context to Chat"
3. The file content is now available to the AI
```

**GitHub File:**
```
1. Command Palette → "Add GitHub File from URL"
2. Paste URL: https://github.com/user/repo/blob/main/file.ts
3. The file is fetched and added to context
```

**GitHub README:**
```
1. Command Palette → "Add GitHub Repository README"
2. Enter: owner/repo
3. The README is added to context
```

## Troubleshooting

### Extension Not Appearing

**Issue**: Can't find the extension in VS Code

**Solutions**:
1. Reload VS Code: Developer → Reload Window
2. Check Extensions view to verify installation
3. Look for "Numbered Output LLM Assistant"

### Cannot Connect to Ollama

**Issue**: "Failed to connect to Ollama server"

**Solutions**:
1. Verify Ollama is installed: `ollama --version`
2. Check if running: `curl http://localhost:11434`
3. Start Ollama if needed (usually auto-starts)
4. Check settings: `numberedOutput.ollamaUrl`

### Model Not Found

**Issue**: "Model 'xyz' not found"

**Solutions**:
1. List available models: `ollama list`
2. Pull the model: `ollama pull llama2`
3. Update settings with correct model name

### Chat Panel Not Opening

**Issue**: Command runs but no panel appears

**Solutions**:
1. Check for error messages in Output panel:
   - View → Output → Select "Numbered Output LLM"
2. Try closing and reopening VS Code
3. Check the extension is enabled in Extensions view

### GitHub Rate Limit Exceeded

**Issue**: "API rate limit exceeded"

**Solutions**:
1. Set a GitHub Personal Access Token (see configuration above)
2. Wait for the rate limit to reset (usually 1 hour)
3. Use fewer GitHub API calls

## Uninstallation

### Via VS Code UI

1. Open Extensions view (Ctrl+Shift+X / Cmd+Shift+X)
2. Find "Numbered Output LLM Assistant"
3. Click the gear icon
4. Select "Uninstall"
5. Reload VS Code

### Via Command Line

```bash
code --uninstall-extension numbered-output.numbered-output-llm
```

## File Locations

### Extension Package
```
/Users/nicholaskinberg/Downloads/NumberedOutput/numbered-output-extension/numbered-output-llm-0.0.1.vsix
```

### Extension Files (after installation)
- macOS: `~/.vscode/extensions/numbered-output.numbered-output-llm-0.0.1/`
- Windows: `%USERPROFILE%\.vscode\extensions\numbered-output.numbered-output-llm-0.0.1\`
- Linux: `~/.vscode/extensions/numbered-output.numbered-output-llm-0.0.1/`

### Configuration
Settings are stored in VS Code's settings.json:
- User settings: `~/Library/Application Support/Code/User/settings.json` (macOS)
- Workspace settings: `.vscode/settings.json` (in your project)

## Next Steps

After successful installation:

1. **Explore Commands**: Open Command Palette and type "Numbered Output" to see all available commands
2. **Read Documentation**: Check `README.md` in the extension directory for detailed usage
3. **Try Examples**: Test with code questions to see numbered output in action
4. **Customize Settings**: Adjust Ollama URL, model, and context length to your preferences

## Getting Help

If you encounter issues:

1. Check the extension's Output channel: View → Output → "Numbered Output LLM"
2. Review the README.md for detailed documentation
3. Check Ollama logs: `ollama logs` (if available)
4. Report issues on GitHub (see README for repository link)

## Security Notes

- **Local Processing**: All AI queries are processed locally via Ollama
- **No Cloud Services**: Your code never leaves your machine
- **GitHub Token**: Stored securely in VS Code settings
- **Context Privacy**: You control what context is shared with the AI

---

**Installation Complete! Happy Coding with Structured AI Assistance! 🚀**

