import * as vscode from 'vscode';
import { ChatPanel } from './chatPanel';
import { OllamaService } from './ollamaService';
import { ContextManager } from './contextManager';
import { HistoryManager } from './historyManager';

export function activate(context: vscode.ExtensionContext) {
    console.log('Numbered Output LLM extension is now active!');

    // Initialize services
    const ollamaService = new OllamaService();
    const contextManager = new ContextManager();
    const historyManager = new HistoryManager(context);

    // Register commands
    const openChatCommand = vscode.commands.registerCommand('numberedOutput.openChat', () => {
        ChatPanel.createOrShow(context.extensionUri, ollamaService, contextManager, historyManager);
    });

    const addFileContextCommand = vscode.commands.registerCommand('numberedOutput.addFileContext', () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            const document = activeEditor.document;
            const text = document.getText();
            const fileName = document.fileName;
            
            // Add file context to the current chat session
            ChatPanel.addFileContext(fileName, text);
            vscode.window.showInformationMessage(`Added context from ${fileName}`);
        } else {
            vscode.window.showWarningMessage('No active editor found');
        }
    });

    context.subscriptions.push(openChatCommand, addFileContextCommand);

    // Register webview provider
    const provider = new ChatPanel(undefined as any, context.extensionUri, ollamaService, contextManager, historyManager);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('numberedOutput.chatView', provider)
    );
}

export function deactivate() {}
