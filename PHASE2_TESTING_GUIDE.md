# Phase 2 Testing Guide: VS Code Extension with Numbered Output

## Overview

Phase 2 has successfully implemented a complete VS Code extension with TypeScript, Ollama API integration, and a webview-based chat interface that enforces numbered output for all LLM responses.

## Extension Structure ✅

The extension has been created with the following structure:
```
numbered-output-extension/
├── package.json                 # Extension manifest with commands and settings
├── tsconfig.json               # TypeScript configuration
├── src/
│   ├── extension.ts            # Main extension entry point
│   ├── chatPanel.ts            # Webview chat interface
│   ├── ollamaService.ts        # Ollama API integration
│   ├── contextManager.ts       # Context extraction
│   └── historyManager.ts       # Chat history persistence
├── media/
│   ├── reset.css               # CSS reset for webview
│   ├── vscode.css              # VS Code theme integration
│   └── main.js                 # Chat interface logic
└── out/                        # Compiled JavaScript (generated)
```

## Prerequisites

### 1. Ollama Server
Ensure Ollama is running on your system:
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start Ollama
ollama serve
```

### 2. Available Models
Check what models are available:
```bash
ollama list
```

If no models are available, pull a model:
```bash
ollama pull llama2
# or
ollama pull codellama
```

## Testing Steps

### Step 1: Load Extension in Development Mode

1. **Open VS Code**
2. **Open the extension directory:**
   - File → Open Folder
   - Navigate to `/Users/nicholaskinberg/Downloads/NumberedOutput/numbered-output-extension`
3. **Set up Extension Development:**
   - Go to Run and Debug (Ctrl+Shift+D or Cmd+Shift+D)
   - Select "Extension Development Host" configuration
   - Press F5 to launch a new VS Code window with the extension loaded

### Step 2: Test Extension Commands

#### Test 1: Open Chat Interface
1. In the new VS Code window, press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Open AI Assistant Chat"
3. Select the command
4. **Expected Result:** Chat panel should open in the sidebar or as a new tab

#### Test 2: Chat Interface Functionality
1. **Verify UI Elements:**
   - Welcome message should be displayed
   - Input textarea should be functional
   - Send button should be clickable
   - Clear button should be present

2. **Test Basic Interaction:**
   - Type a simple message like "Hello"
   - Click Send or press Enter
   - **Expected Result:** Message should appear in chat

### Step 3: Test Ollama Integration

#### Test 3: Basic Ollama Connection
1. **Send a simple prompt:** "What is JavaScript?"
2. **Expected Result:** 
   - Typing indicator should appear
   - Response should be received from Ollama
   - Response should be formatted with numbered output

#### Test 4: Numbered Output Verification
Test these specific prompts to verify numbered output:

**Prompt 1:** "Write a function to sort an array in JavaScript"
**Expected Output Format:**
```
1. Create a function declaration
2. Add parameters for the array  
3. Implement the sorting logic
4. Return the sorted array
```

**Prompt 2:** "Explain how to set up a React project"
**Expected Output Format:**
```
1. Install Node.js and npm
2. Create a new React app using create-react-app
3. Navigate to the project directory
4. Start the development server
```

**Prompt 3:** "List debugging steps for JavaScript errors"
**Expected Output Format:**
```
1. Check the browser console for error messages
2. Identify the line number where the error occurs
3. Examine the code around that line
4. Use console.log statements to trace variable values
```

### Step 4: Test File Context Integration

#### Test 5: Add File Context
1. **Open a code file** in VS Code (e.g., a JavaScript or Python file)
2. **Add file context to chat:**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P`)
   - Type "Add File Context to Chat"
   - Select the command
3. **Expected Result:** 
   - Success message should appear
   - File content should be added to chat context

#### Test 6: Context-Aware Responses
1. **Ask a question about the file:** "What does this code do?"
2. **Expected Result:**
   - AI should reference the file content
   - Response should be numbered
   - AI should provide specific insights about the code

### Step 5: Test Configuration Settings

#### Test 7: Ollama URL Configuration
1. **Open Settings:** `Ctrl+,` (or `Cmd+,`)
2. **Search for:** "numberedOutput"
3. **Change Ollama URL** to a different server (if available)
4. **Test connection** with a simple prompt

#### Test 8: Model Configuration
1. **Change model name** in settings
2. **Test with different model** to ensure it works

### Step 6: Test Error Handling

#### Test 9: Ollama Server Disconnection
1. **Stop Ollama server:** `pkill ollama` or close terminal
2. **Send a message** in the chat
3. **Expected Result:** 
   - Error message should appear
   - Error should be user-friendly
   - Chat should remain functional

#### Test 10: Invalid Model
1. **Change model name** to a non-existent model
2. **Send a message**
3. **Expected Result:** Appropriate error message

## Success Criteria

### ✅ Extension Development (COMPLETED)
- [x] TypeScript extension structure created
- [x] All core components implemented
- [x] Webview interface created
- [x] Ollama API integration completed
- [x] Context management implemented
- [x] History persistence implemented
- [x] Numbered output enforcement implemented
- [x] TypeScript compilation successful
- [x] Dependencies installed

### ⏳ Manual Testing (USER REQUIRED)
- [ ] Extension loads in development mode
- [ ] Chat interface opens and functions
- [ ] Ollama connection works
- [ ] Numbered output is enforced in all responses
- [ ] File context integration works
- [ ] History persistence works across sessions
- [ ] Settings configuration works
- [ ] Error handling works gracefully

## Troubleshooting

### If Extension Doesn't Load:
1. **Check TypeScript Compilation:**
   ```bash
   cd /Users/nicholaskinberg/Downloads/NumberedOutput/numbered-output-extension
   npm run compile
   ```

2. **Check Dependencies:**
   ```bash
   npm install
   ```

3. **Check VS Code Extension Development Setup:**
   - Ensure you're using "Extension Development Host" configuration
   - Check for TypeScript errors in the Problems panel

### If Ollama Connection Fails:
1. **Check Ollama Server:**
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. **Check Model Availability:**
   ```bash
   ollama list
   ```

3. **Update Extension Settings:**
   - Change `numberedOutput.ollamaUrl` if Ollama runs on different port
   - Change `numberedOutput.modelName` to available model

### If Numbered Output Doesn't Work:
1. **Check System Message:**
   - Verify system message is being sent to Ollama
   - Check browser console for errors

2. **Test with Simple Prompts:**
   - Try basic prompts first
   - Check if post-processing is working

## Extension Features

### Commands Available:
- `numberedOutput.openChat` - Open AI Assistant Chat
- `numberedOutput.addFileContext` - Add File Context to Chat

### Settings Available:
- `numberedOutput.ollamaUrl` - Ollama server URL (default: http://localhost:11434)
- `numberedOutput.modelName` - Ollama model name (default: llama2)

### Key Features:
- **Numbered Output Enforcement:** All responses are formatted with numbered steps
- **File Context Integration:** Add current file content to chat context
- **History Persistence:** Chat history is saved across sessions
- **VS Code Theme Integration:** Chat interface matches VS Code theme
- **Error Handling:** Graceful error handling for connection issues
- **Configurable:** Ollama URL and model can be configured

## Next Steps

Once Phase 2 testing is complete:
1. **Phase 3:** Package extension for distribution
2. **Create installation instructions**
3. **Test with different Ollama models**
4. **Optimize performance and error handling**

## Test Script

To verify extension structure:
```bash
cd /Users/nicholaskinberg/Downloads/NumberedOutput
node test-extension.js
```

This will verify all files are in place and compiled correctly.
