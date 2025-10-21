"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const historyManager_1 = require("../../historyManager");
// Mock ExtensionContext for testing
class MockExtensionContext {
    constructor() {
        this.storage = new Map();
        this.globalState = {
            get: (key, defaultValue) => {
                return this.storage.get(key) ?? defaultValue;
            },
            update: (key, value) => {
                this.storage.set(key, value);
                return Promise.resolve();
            },
            keys: () => {
                return Array.from(this.storage.keys());
            },
            setKeysForSync: (keys) => { }
        };
        this.workspaceState = this.globalState;
        this.subscriptions = [];
        this.extensionPath = '';
        this.extensionUri = null;
        this.environmentVariableCollection = null;
        this.extensionMode = null;
        this.storageUri = null;
        this.storagePath = null;
        this.globalStorageUri = null;
        this.globalStoragePath = '';
        this.logUri = null;
        this.logPath = '';
        this.extension = null;
        this.secrets = null;
        this.languageModelAccessInformation = null;
    }
    asAbsolutePath(relativePath) {
        return relativePath;
    }
}
suite('HistoryManager Test Suite', () => {
    let historyManager;
    let mockContext;
    setup(() => {
        mockContext = new MockExtensionContext();
        historyManager = new historyManager_1.HistoryManager(mockContext);
    });
    test('Should add message to history', () => {
        const message = {
            role: 'user',
            content: 'Test message'
        };
        historyManager.addMessage(message);
        const messages = historyManager.getMessages();
        assert.strictEqual(messages.length, 1);
        assert.strictEqual(messages[0].content, 'Test message');
    });
    test('Should get all messages', () => {
        historyManager.addMessage({ role: 'user', content: 'Message 1' });
        historyManager.addMessage({ role: 'assistant', content: 'Message 2' });
        historyManager.addMessage({ role: 'user', content: 'Message 3' });
        const messages = historyManager.getMessages();
        assert.strictEqual(messages.length, 3);
    });
    test('Should clear history', () => {
        historyManager.addMessage({ role: 'user', content: 'Message 1' });
        historyManager.addMessage({ role: 'assistant', content: 'Message 2' });
        historyManager.clearHistory();
        const messages = historyManager.getMessages();
        assert.strictEqual(messages.length, 0);
    });
    test('Should get last N messages', () => {
        for (let i = 1; i <= 5; i++) {
            historyManager.addMessage({ role: 'user', content: `Message ${i}` });
        }
        const lastTwo = historyManager.getLastMessages(2);
        assert.strictEqual(lastTwo.length, 2);
        assert.strictEqual(lastTwo[0].content, 'Message 4');
        assert.strictEqual(lastTwo[1].content, 'Message 5');
    });
    test('Should get message count', () => {
        historyManager.addMessage({ role: 'user', content: 'Message 1' });
        historyManager.addMessage({ role: 'assistant', content: 'Message 2' });
        const count = historyManager.getMessageCount();
        assert.strictEqual(count, 2);
    });
    test('Should export history as JSON', () => {
        historyManager.addMessage({ role: 'user', content: 'Message 1' });
        historyManager.addMessage({ role: 'assistant', content: 'Message 2' });
        const exported = historyManager.exportHistory();
        const parsed = JSON.parse(exported);
        assert.ok(parsed.timestamp);
        assert.strictEqual(parsed.messageCount, 2);
        assert.ok(Array.isArray(parsed.messages));
        assert.strictEqual(parsed.messages.length, 2);
    });
    test('Should import history from JSON', () => {
        const historyData = {
            timestamp: new Date().toISOString(),
            messageCount: 2,
            messages: [
                { role: 'user', content: 'Imported 1' },
                { role: 'assistant', content: 'Imported 2' }
            ]
        };
        const success = historyManager.importHistory(JSON.stringify(historyData));
        assert.strictEqual(success, true);
        assert.strictEqual(historyManager.getMessageCount(), 2);
    });
    test('Should handle invalid import data', () => {
        const success = historyManager.importHistory('invalid json');
        assert.strictEqual(success, false);
    });
    test('Should persist history to storage', () => {
        historyManager.addMessage({ role: 'user', content: 'Persistent message' });
        // Create a new history manager with the same context
        const newHistoryManager = new historyManager_1.HistoryManager(mockContext);
        const messages = newHistoryManager.getMessages();
        assert.strictEqual(messages.length, 1);
        assert.strictEqual(messages[0].content, 'Persistent message');
    });
    test('Should handle empty history on initialization', () => {
        const emptyContext = new MockExtensionContext();
        const emptyHistoryManager = new historyManager_1.HistoryManager(emptyContext);
        const messages = emptyHistoryManager.getMessages();
        assert.strictEqual(messages.length, 0);
    });
});
//# sourceMappingURL=historyManager.test.js.map