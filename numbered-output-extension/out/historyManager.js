"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryManager = void 0;
class HistoryManager {
    constructor(context) {
        this._messages = [];
        this._context = context;
        this.loadHistory();
    }
    addMessage(message) {
        this._messages.push(message);
        this.saveHistory();
    }
    getMessages() {
        return [...this._messages];
    }
    clearHistory() {
        this._messages = [];
        this.saveHistory();
    }
    saveHistory() {
        this._context.globalState.update('chatHistory', this._messages);
    }
    loadHistory() {
        const savedHistory = this._context.globalState.get('chatHistory', []);
        this._messages = savedHistory;
    }
    getLastMessages(count) {
        return this._messages.slice(-count);
    }
    getMessageCount() {
        return this._messages.length;
    }
    exportHistory() {
        const exportData = {
            timestamp: new Date().toISOString(),
            messageCount: this._messages.length,
            messages: this._messages
        };
        return JSON.stringify(exportData, null, 2);
    }
    importHistory(historyData) {
        try {
            const data = JSON.parse(historyData);
            if (data.messages && Array.isArray(data.messages)) {
                this._messages = data.messages;
                this.saveHistory();
                return true;
            }
        }
        catch (error) {
            console.error('Error importing history:', error);
        }
        return false;
    }
}
exports.HistoryManager = HistoryManager;
//# sourceMappingURL=historyManager.js.map