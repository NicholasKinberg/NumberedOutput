import * as assert from 'assert';
import { HistoryManager } from '../../historyManager';
import { ChatMessage } from '../../ollamaService';

// Mock ExtensionContext for testing
class MockExtensionContext {
    private storage: Map<string, any> = new Map();

    globalState = {
        get: <T>(key: string, defaultValue?: T): T => {
            return this.storage.get(key) ?? defaultValue;
        },
        update: (key: string, value: any): Thenable<void> => {
            this.storage.set(key, value);
            return Promise.resolve();
        },
        keys: (): readonly string[] => {
            return Array.from(this.storage.keys());
        },
        setKeysForSync: (keys: readonly string[]): void => {}
    };

    workspaceState = this.globalState;
    subscriptions: any[] = [];
    extensionPath = '';
    extensionUri: any = null;
    environmentVariableCollection: any = null;
    extensionMode: any = null;
    storageUri: any = null;
    storagePath: any = null;
    globalStorageUri: any = null;
    globalStoragePath = '';
    logUri: any = null;
    logPath = '';
    extension: any = null;
    secrets: any = null;
    languageModelAccessInformation: any = null;
    asAbsolutePath(relativePath: string): string {
        return relativePath;
    }
}

suite('HistoryManager Test Suite', () => {
    let historyManager: HistoryManager;
    let mockContext: MockExtensionContext;

    setup(() => {
        mockContext = new MockExtensionContext();
        historyManager = new HistoryManager(mockContext as any);
    });

    test('Should add message to history', () => {
        const message: ChatMessage = {
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
        const newHistoryManager = new HistoryManager(mockContext as any);
        const messages = newHistoryManager.getMessages();

        assert.strictEqual(messages.length, 1);
        assert.strictEqual(messages[0].content, 'Persistent message');
    });

    test('Should handle empty history on initialization', () => {
        const emptyContext = new MockExtensionContext();
        const emptyHistoryManager = new HistoryManager(emptyContext as any);

        const messages = emptyHistoryManager.getMessages();

        assert.strictEqual(messages.length, 0);
    });
});

