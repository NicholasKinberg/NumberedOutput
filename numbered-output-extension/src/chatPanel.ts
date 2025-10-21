import * as vscode from 'vscode';
import * as path from 'path';
import { OllamaService, ChatMessage } from './ollamaService';
import { ContextManager } from './contextManager';
import { HistoryManager } from './historyManager';

export class ChatPanel implements vscode.WebviewViewProvider {
    public static currentPanel: ChatPanel | undefined;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private _ollamaService: OllamaService;
    private _contextManager: ContextManager;
    private _historyManager: HistoryManager;
    private _panel?: vscode.WebviewPanel;

    public static createOrShow(
        extensionUri: vscode.Uri,
        ollamaService: OllamaService,
        contextManager: ContextManager,
        historyManager: HistoryManager
    ) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it
        if (ChatPanel.currentPanel && ChatPanel.currentPanel._panel) {
            ChatPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            'numberedOutput.chatView',
            'AI Assistant Chat',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media')
                ]
            }
        );

        ChatPanel.currentPanel = new ChatPanel(panel, extensionUri, ollamaService, contextManager, historyManager);
    }

    public static addFileContext(fileName: string, content: string) {
        if (ChatPanel.currentPanel) {
            ChatPanel.currentPanel._contextManager.addFileContext(fileName, content);
        }
    }

    public constructor(
        panel: vscode.WebviewPanel | undefined,
        extensionUri: vscode.Uri,
        ollamaService: OllamaService,
        contextManager: ContextManager,
        historyManager: HistoryManager
    ) {
        this._extensionUri = extensionUri;
        this._ollamaService = ollamaService;
        this._contextManager = contextManager;
        this._historyManager = historyManager;
        this._panel = panel;

        if (this._panel) {
            // Set the webview's initial html content
            this._update();

            // Listen for when the panel is disposed
            this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

            // Handle messages from the webview
            this._panel.webview.onDidReceiveMessage(
                async (message) => {
                    switch (message.command) {
                        case 'sendMessage':
                            await this._handleUserMessage(message.text);
                            return;
                        case 'clearHistory':
                            this._historyManager.clearHistory();
                            this._panel!.webview.postMessage({ command: 'historyCleared' });
                            return;
                    }
                },
                null,
                this._disposables
            );
        }
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'sendMessage':
                        await this._handleUserMessage(message.text);
                        return;
                    case 'clearHistory':
                        this._historyManager.clearHistory();
                        webviewView.webview.postMessage({ command: 'historyCleared' });
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    private async _handleUserMessage(text: string) {
        try {
            // Add user message to history
            this._historyManager.addMessage({ role: 'user', content: text });

            // Get context from current files
            const context = this._contextManager.getContext();

            // Prepare messages for Ollama
            const messages: ChatMessage[] = [
                ...this._historyManager.getMessages(),
                ...context
            ];

            // Show typing indicator
            if (this._panel) {
                this._panel.webview.postMessage({ 
                    command: 'showTyping',
                    message: 'AI is thinking...'
                });
            }

            // Get response from Ollama
            const response = await this._ollamaService.generateResponse(messages);

            // Add assistant response to history
            this._historyManager.addMessage({ role: 'assistant', content: response });

            // Send response to webview
            if (this._panel) {
                this._panel.webview.postMessage({
                    command: 'addMessage',
                    message: {
                        role: 'assistant',
                        content: response,
                        timestamp: new Date().toISOString()
                    }
                });
            }

        } catch (error) {
            console.error('Error handling user message:', error);
            if (this._panel) {
                this._panel.webview.postMessage({
                    command: 'addMessage',
                    message: {
                        role: 'assistant',
                        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
                        timestamp: new Date().toISOString()
                    }
                });
            }
        }
    }

    private _update() {
        if (this._panel) {
            const webview = this._panel.webview;
            this._panel.webview.html = this._getHtmlForWebview(webview);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const styleResetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css')
        );
        const styleVscodeUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css')
        );
        const styleCustomUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'styles.css')
        );
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js')
        );

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleResetUri}" rel="stylesheet">
                <link href="${styleVscodeUri}" rel="stylesheet">
                <link href="${styleCustomUri}" rel="stylesheet">
                <title>AI Assistant Chat</title>
            </head>
            <body>
                <div class="chat-container">
                    <div class="chat-header">
                        <h3>AI Assistant</h3>
                        <button id="clear-btn" class="clear-button">Clear</button>
                    </div>
                    <div class="chat-messages" id="chat-messages">
                        <div class="message assistant-message">
                            <div class="message-content">
                                Hello! I'm your AI assistant. I'll provide numbered responses for all code suggestions and step-by-step instructions. How can I help you today?
                            </div>
                        </div>
                    </div>
                    <div class="chat-input-container">
                        <div class="typing-indicator" id="typing-indicator" style="display: none;">
                            <span id="typing-text">AI is thinking...</span>
                        </div>
                        <div class="input-wrapper">
                            <textarea id="message-input" placeholder="Type your message here..." rows="3"></textarea>
                            <button id="send-btn" class="send-button">Send</button>
                        </div>
                    </div>
                </div>
                <script src="${scriptUri}"></script>
            </body>
            </html>`;
    }

    public dispose() {
        ChatPanel.currentPanel = undefined;

        // Clean up our resources
        if (this._panel) {
            this._panel.dispose();
        }

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
