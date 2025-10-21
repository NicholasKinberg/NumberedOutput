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

    const addGitHubUrlCommand = vscode.commands.registerCommand('numberedOutput.addGitHubUrl', async () => {
        const url = await vscode.window.showInputBox({
            prompt: 'Enter GitHub file URL',
            placeHolder: 'https://github.com/owner/repo/blob/main/path/to/file.ts',
            validateInput: (value) => {
                if (!value) {
                    return 'Please enter a URL';
                }
                if (!value.startsWith('https://github.com/')) {
                    return 'Please enter a valid GitHub URL';
                }
                return null;
            }
        });

        if (url) {
            try {
                await contextManager.fetchFromGitHubUrl(url);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to add GitHub context: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    });

    const addGitHubFileCommand = vscode.commands.registerCommand('numberedOutput.addGitHubFile', async () => {
        const owner = await vscode.window.showInputBox({
            prompt: 'Enter repository owner',
            placeHolder: 'octocat'
        });
        if (!owner) return;

        const repo = await vscode.window.showInputBox({
            prompt: 'Enter repository name',
            placeHolder: 'hello-world'
        });
        if (!repo) return;

        const path = await vscode.window.showInputBox({
            prompt: 'Enter file path',
            placeHolder: 'src/index.ts'
        });
        if (!path) return;

        const ref = await vscode.window.showInputBox({
            prompt: 'Enter branch or ref (optional)',
            placeHolder: 'main'
        });

        try {
            await contextManager.fetchGitHubFile(owner, repo, path, ref || 'main');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to add GitHub file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });

    const addGitHubReadmeCommand = vscode.commands.registerCommand('numberedOutput.addGitHubReadme', async () => {
        const owner = await vscode.window.showInputBox({
            prompt: 'Enter repository owner',
            placeHolder: 'octocat'
        });
        if (!owner) return;

        const repo = await vscode.window.showInputBox({
            prompt: 'Enter repository name',
            placeHolder: 'hello-world'
        });
        if (!repo) return;

        try {
            await contextManager.fetchGitHubReadme(owner, repo);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to add GitHub README: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });

    const setGitHubTokenCommand = vscode.commands.registerCommand('numberedOutput.setGitHubToken', async () => {
        const token = await vscode.window.showInputBox({
            prompt: 'Enter GitHub Personal Access Token (optional for public repos)',
            placeHolder: 'ghp_xxxxxxxxxxxx',
            password: true
        });

        if (token) {
            contextManager.setGitHubToken(token);
        }
    });

    const clearContextCommand = vscode.commands.registerCommand('numberedOutput.clearContext', () => {
        contextManager.clearContext();
        vscode.window.showInformationMessage('Context cleared');
    });

    context.subscriptions.push(
        openChatCommand, 
        addFileContextCommand,
        addGitHubUrlCommand,
        addGitHubFileCommand,
        addGitHubReadmeCommand,
        setGitHubTokenCommand,
        clearContextCommand
    );

    // Register webview provider
    const provider = new ChatPanel(undefined as any, context.extensionUri, ollamaService, contextManager, historyManager);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('numberedOutput.chatView', provider)
    );
}

export function deactivate() {}
