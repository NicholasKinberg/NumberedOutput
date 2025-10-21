import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('undefined_publisher.numbered-output-llm'));
    });

    test('Extension should activate', async () => {
        const ext = vscode.extensions.getExtension('undefined_publisher.numbered-output-llm');
        if (ext) {
            await ext.activate();
            assert.ok(true);
        }
    });

    test('Commands should be registered', async () => {
        const commands = await vscode.commands.getCommands(true);
        
        const expectedCommands = [
            'numberedOutput.openChat',
            'numberedOutput.addFileContext',
            'numberedOutput.addGitHubUrl',
            'numberedOutput.addGitHubFile',
            'numberedOutput.addGitHubReadme',
            'numberedOutput.setGitHubToken',
            'numberedOutput.clearContext'
        ];

        for (const cmd of expectedCommands) {
            assert.ok(commands.includes(cmd), `Command ${cmd} should be registered`);
        }
    });

    test('Configuration should have default values', () => {
        const config = vscode.workspace.getConfiguration('numberedOutput');
        
        assert.strictEqual(config.get('ollamaUrl'), 'http://localhost:11434');
        assert.strictEqual(config.get('modelName'), 'llama2');
        assert.strictEqual(config.get('githubToken'), '');
        assert.strictEqual(config.get('maxContextLength'), 2000);
    });
});

