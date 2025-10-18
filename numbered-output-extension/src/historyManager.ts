import * as vscode from 'vscode';
import { ChatMessage } from './ollamaService';

export class HistoryManager {
    private _context: vscode.ExtensionContext;
    private _messages: ChatMessage[] = [];

    constructor(context: vscode.ExtensionContext) {
        this._context = context;
        this.loadHistory();
    }

    addMessage(message: ChatMessage) {
        this._messages.push(message);
        this.saveHistory();
    }

    getMessages(): ChatMessage[] {
        return [...this._messages];
    }

    clearHistory() {
        this._messages = [];
        this.saveHistory();
    }

    private saveHistory() {
        this._context.globalState.update('chatHistory', this._messages);
    }

    private loadHistory() {
        const savedHistory = this._context.globalState.get<ChatMessage[]>('chatHistory', []);
        this._messages = savedHistory;
    }

    getLastMessages(count: number): ChatMessage[] {
        return this._messages.slice(-count);
    }

    getMessageCount(): number {
        return this._messages.length;
    }

    exportHistory(): string {
        const exportData = {
            timestamp: new Date().toISOString(),
            messageCount: this._messages.length,
            messages: this._messages
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    importHistory(historyData: string): boolean {
        try {
            const data = JSON.parse(historyData);
            if (data.messages && Array.isArray(data.messages)) {
                this._messages = data.messages;
                this.saveHistory();
                return true;
            }
        } catch (error) {
            console.error('Error importing history:', error);
        }
        return false;
    }
}
