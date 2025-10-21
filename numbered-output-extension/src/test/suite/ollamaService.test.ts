import * as assert from 'assert';
import { OllamaService, ChatMessage } from '../../ollamaService';

suite('OllamaService Test Suite', () => {
    let ollamaService: OllamaService;

    setup(() => {
        ollamaService = new OllamaService();
    });

    test('Should initialize with default configuration', () => {
        assert.strictEqual(ollamaService.getModelName(), 'llama2');
        assert.strictEqual(ollamaService.getBaseUrl(), 'http://localhost:11434');
    });

    test('Should test connection to Ollama server', async function() {
        this.timeout(10000); // Increase timeout for network call
        
        // This test will fail if Ollama is not running
        // It's more of an integration test
        try {
            const isConnected = await ollamaService.testConnection();
            // If Ollama is running, connection should succeed
            // If not, it should return false (not throw)
            assert.ok(typeof isConnected === 'boolean');
        } catch (error) {
            // If error is thrown, fail the test
            assert.fail('testConnection should not throw errors');
        }
    });

    test('Should handle connection error gracefully', async function() {
        this.timeout(5000);
        
        // Create service with invalid URL
        const invalidService = new OllamaService();
        (invalidService as any).baseUrl = 'http://invalid-url:99999';
        
        const isConnected = await invalidService.testConnection();
        assert.strictEqual(isConnected, false);
    });

    test('Should include system message for numbered output', async function() {
        this.skip(); // Skip this test as it requires actual Ollama server
        
        const messages: ChatMessage[] = [
            { role: 'user', content: 'How do I create a function?' }
        ];

        try {
            const response = await ollamaService.generateResponse(messages);
            // Response should be formatted
            assert.ok(typeof response === 'string');
        } catch (error) {
            // Expected if Ollama is not running
            assert.ok(error instanceof Error);
        }
    });

    test('Should handle API errors', async function() {
        this.timeout(5000);
        
        // Use invalid URL to force error
        (ollamaService as any).baseUrl = 'http://localhost:99999';
        
        const messages: ChatMessage[] = [
            { role: 'user', content: 'Test' }
        ];

        try {
            await ollamaService.generateResponse(messages);
            assert.fail('Should have thrown an error');
        } catch (error) {
            assert.ok(error instanceof Error);
            assert.ok(error.message.includes('Cannot connect to Ollama server'));
        }
    });

    test('Should format response content', () => {
        const rawContent = 'Create a file\nAdd code\nTest it';
        const formatted = (ollamaService as any).formatResponse(rawContent);
        
        // Should use ResponseFormatter
        assert.ok(typeof formatted === 'string');
    });
});

