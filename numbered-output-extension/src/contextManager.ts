import * as vscode from 'vscode';
import { ChatMessage } from './ollamaService';

export class ContextManager {
    private _fileContexts: Map<string, string> = new Map();
    private _githubContexts: Map<string, string> = new Map();

    addFileContext(fileName: string, content: string) {
        // Limit content size to avoid token limits
        const maxLength = 2000;
        const truncatedContent = content.length > maxLength 
            ? content.substring(0, maxLength) + '... (truncated)'
            : content;

        this._fileContexts.set(fileName, truncatedContent);
    }

    addGitHubContext(repoUrl: string, content: string) {
        const maxLength = 2000;
        const truncatedContent = content.length > maxLength 
            ? content.substring(0, maxLength) + '... (truncated)'
            : content;

        this._githubContexts.set(repoUrl, truncatedContent);
    }

    getContext(): ChatMessage[] {
        const contextMessages: ChatMessage[] = [];

        // Add file contexts
        for (const [fileName, content] of this._fileContexts) {
            contextMessages.push({
                role: 'user',
                content: `File context from ${fileName}:\n\`\`\`\n${content}\n\`\`\``
            });
        }

        // Add GitHub contexts
        for (const [repoUrl, content] of this._githubContexts) {
            contextMessages.push({
                role: 'user',
                content: `Repository context from ${repoUrl}:\n\`\`\`\n${content}\n\`\`\``
            });
        }

        return contextMessages;
    }

    getActiveEditorContext(): ChatMessage | null {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return null;
        }

        const document = activeEditor.document;
        const text = document.getText();
        const fileName = document.fileName;

        // Get selected text if any
        const selection = activeEditor.selection;
        const selectedText = document.getText(selection);
        
        if (selectedText.trim()) {
            return {
                role: 'user',
                content: `Selected code from ${fileName}:\n\`\`\`${this.getLanguageFromFileName(fileName)}\n${selectedText}\n\`\`\``
            };
        } else {
            // Get current line and surrounding context
            const currentLine = activeEditor.selection.active.line;
            const startLine = Math.max(0, currentLine - 5);
            const endLine = Math.min(document.lineCount - 1, currentLine + 5);
            
            const contextLines = [];
            for (let i = startLine; i <= endLine; i++) {
                const line = document.lineAt(i);
                contextLines.push(`${i + 1}: ${line.text}`);
            }

            return {
                role: 'user',
                content: `Current file context from ${fileName} (lines ${startLine + 1}-${endLine + 1}):\n\`\`\`${this.getLanguageFromFileName(fileName)}\n${contextLines.join('\n')}\n\`\`\``
            };
        }
    }

    private getLanguageFromFileName(fileName: string): string {
        const extension = fileName.split('.').pop()?.toLowerCase();
        const languageMap: { [key: string]: string } = {
            'js': 'javascript',
            'ts': 'typescript',
            'jsx': 'javascript',
            'tsx': 'typescript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'cs': 'csharp',
            'php': 'php',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'html': 'html',
            'css': 'css',
            'scss': 'scss',
            'json': 'json',
            'xml': 'xml',
            'yaml': 'yaml',
            'yml': 'yaml',
            'md': 'markdown'
        };
        
        return languageMap[extension || ''] || 'text';
    }

    clearContext() {
        this._fileContexts.clear();
        this._githubContexts.clear();
    }

    getContextSummary(): string {
        const fileCount = this._fileContexts.size;
        const githubCount = this._githubContexts.size;
        
        if (fileCount === 0 && githubCount === 0) {
            return 'No context available';
        }
        
        let summary = `Context: ${fileCount} file(s)`;
        if (githubCount > 0) {
            summary += `, ${githubCount} repository/ies`;
        }
        
        return summary;
    }
}
