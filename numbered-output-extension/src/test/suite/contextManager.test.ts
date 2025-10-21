import * as assert from 'assert';
import { ContextManager } from '../../contextManager';

suite('ContextManager Test Suite', () => {
    let contextManager: ContextManager;

    setup(() => {
        contextManager = new ContextManager();
    });

    test('Should add file context', () => {
        const fileName = 'test.ts';
        const content = 'const x = 10;';
        
        contextManager.addFileContext(fileName, content);
        const context = contextManager.getContext();
        
        assert.ok(context.length > 0);
        assert.ok(context.some(msg => msg.content.includes(fileName)));
    });

    test('Should truncate long content', () => {
        const fileName = 'test.ts';
        const longContent = 'a'.repeat(5000);
        
        contextManager.addFileContext(fileName, longContent);
        const context = contextManager.getContext();
        
        const fileContext = context.find(msg => msg.content.includes(fileName));
        assert.ok(fileContext);
        assert.ok(fileContext.content.includes('(truncated)'));
    });

    test('Should add GitHub context', () => {
        const repoUrl = 'owner/repo/file.ts';
        const content = 'function test() {}';
        
        contextManager.addGitHubContext(repoUrl, content);
        const context = contextManager.getContext();
        
        assert.ok(context.length > 0);
        assert.ok(context.some(msg => msg.content.includes(repoUrl)));
    });

    test('Should clear all context', () => {
        contextManager.addFileContext('test.ts', 'content');
        contextManager.addGitHubContext('owner/repo', 'content');
        
        contextManager.clearContext();
        const context = contextManager.getContext();
        
        assert.strictEqual(context.length, 0);
    });

    test('Should get context summary', () => {
        contextManager.addFileContext('test1.ts', 'content');
        contextManager.addFileContext('test2.ts', 'content');
        
        const summary = contextManager.getContextSummary();
        
        assert.ok(summary.includes('2 file(s)'));
    });

    test('Should return "No context available" when empty', () => {
        const summary = contextManager.getContextSummary();
        
        assert.strictEqual(summary, 'No context available');
    });

    test('Should detect language from file name', () => {
        const testCases = [
            { fileName: 'test.ts', expectedLang: 'typescript' },
            { fileName: 'test.js', expectedLang: 'javascript' },
            { fileName: 'test.py', expectedLang: 'python' },
            { fileName: 'test.java', expectedLang: 'java' },
        ];

        for (const testCase of testCases) {
            contextManager.addFileContext(testCase.fileName, 'content');
            const context = contextManager.getContext();
            const lastContext = context[context.length - 1];
            
            assert.ok(lastContext.content.includes(testCase.expectedLang));
            contextManager.clearContext();
        }
    });

    test('Should parse valid GitHub URL', () => {
        const url = 'https://github.com/owner/repo/blob/main/src/file.ts';
        
        // We need to test the private method indirectly
        // This would work if we fetch from URL
        const parsed = (contextManager as any).parseGitHubUrl(url);
        
        assert.ok(parsed);
        assert.strictEqual(parsed.owner, 'owner');
        assert.strictEqual(parsed.repo, 'repo');
        assert.strictEqual(parsed.path, 'src/file.ts');
        assert.strictEqual(parsed.ref, 'main');
    });

    test('Should reject invalid GitHub URL', () => {
        const url = 'https://example.com/invalid';
        
        const parsed = (contextManager as any).parseGitHubUrl(url);
        
        assert.strictEqual(parsed, null);
    });

    test('Should handle multiple file contexts', () => {
        contextManager.addFileContext('file1.ts', 'content1');
        contextManager.addFileContext('file2.ts', 'content2');
        contextManager.addFileContext('file3.ts', 'content3');
        
        const context = contextManager.getContext();
        
        assert.strictEqual(context.length, 3);
    });
});

