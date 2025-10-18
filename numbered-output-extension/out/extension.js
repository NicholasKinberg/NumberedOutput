"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const chatPanel_1 = require("./chatPanel");
const ollamaService_1 = require("./ollamaService");
const contextManager_1 = require("./contextManager");
const historyManager_1 = require("./historyManager");
function activate(context) {
    console.log('Numbered Output LLM extension is now active!');
    // Initialize services
    const ollamaService = new ollamaService_1.OllamaService();
    const contextManager = new contextManager_1.ContextManager();
    const historyManager = new historyManager_1.HistoryManager(context);
    // Register commands
    const openChatCommand = vscode.commands.registerCommand('numberedOutput.openChat', () => {
        chatPanel_1.ChatPanel.createOrShow(context.extensionUri, ollamaService, contextManager, historyManager);
    });
    const addFileContextCommand = vscode.commands.registerCommand('numberedOutput.addFileContext', () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            const document = activeEditor.document;
            const text = document.getText();
            const fileName = document.fileName;
            // Add file context to the current chat session
            chatPanel_1.ChatPanel.addFileContext(fileName, text);
            vscode.window.showInformationMessage(`Added context from ${fileName}`);
        }
        else {
            vscode.window.showWarningMessage('No active editor found');
        }
    });
    context.subscriptions.push(openChatCommand, addFileContextCommand);
    // Register webview provider
    const provider = new chatPanel_1.ChatPanel(undefined, context.extensionUri, ollamaService, contextManager, historyManager);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('numberedOutput.chatView', provider));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map