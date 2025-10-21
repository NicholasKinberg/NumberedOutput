import * as vscode from 'vscode';
import { ChatMessage } from './ollamaService';
import { Octokit } from '@octokit/rest';

export class ContextManager {
    private _fileContexts: Map<string, string> = new Map();
    private _githubContexts: Map<string, string> = new Map();
    private _octokit: Octokit | null = null;

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

    /**
     * Initialize Octokit with GitHub token
     * @param token GitHub personal access token (optional)
     */
    initializeGitHub(token?: string) {
        this._octokit = new Octokit({
            auth: token
        });
    }

    /**
     * Fetch file content from a GitHub repository
     * @param owner Repository owner
     * @param repo Repository name
     * @param path Path to file in repository
     * @param ref Branch or commit ref (default: main)
     */
    async fetchGitHubFile(owner: string, repo: string, path: string, ref: string = 'main'): Promise<void> {
        try {
            if (!this._octokit) {
                this.initializeGitHub();
            }

            const response = await this._octokit!.repos.getContent({
                owner,
                repo,
                path,
                ref
            });

            if ('content' in response.data && typeof response.data.content === 'string') {
                // Decode base64 content
                const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
                const contextKey = `${owner}/${repo}/${path}`;
                this.addGitHubContext(contextKey, content);
                
                vscode.window.showInformationMessage(`Added GitHub context from ${contextKey}`);
            } else {
                throw new Error('Invalid file content received from GitHub');
            }
        } catch (error) {
            console.error('Error fetching GitHub file:', error);
            vscode.window.showErrorMessage(`Failed to fetch GitHub file: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    /**
     * Fetch multiple files from a GitHub repository directory
     * @param owner Repository owner
     * @param repo Repository name
     * @param path Path to directory in repository
     * @param ref Branch or commit ref (default: main)
     */
    async fetchGitHubDirectory(owner: string, repo: string, path: string, ref: string = 'main'): Promise<void> {
        try {
            if (!this._octokit) {
                this.initializeGitHub();
            }

            const response = await this._octokit!.repos.getContent({
                owner,
                repo,
                path,
                ref
            });

            if (Array.isArray(response.data)) {
                let fileCount = 0;
                for (const item of response.data) {
                    if (item.type === 'file') {
                        try {
                            await this.fetchGitHubFile(owner, repo, item.path, ref);
                            fileCount++;
                        } catch (error) {
                            console.error(`Failed to fetch ${item.path}:`, error);
                        }
                    }
                }
                vscode.window.showInformationMessage(`Added ${fileCount} files from ${owner}/${repo}/${path}`);
            } else {
                throw new Error('Path does not point to a directory');
            }
        } catch (error) {
            console.error('Error fetching GitHub directory:', error);
            vscode.window.showErrorMessage(`Failed to fetch GitHub directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    /**
     * Parse GitHub URL and fetch content
     * @param url GitHub URL (e.g., https://github.com/owner/repo/blob/main/path/to/file.ts)
     */
    async fetchFromGitHubUrl(url: string): Promise<void> {
        try {
            const parsed = this.parseGitHubUrl(url);
            if (!parsed) {
                throw new Error('Invalid GitHub URL format');
            }

            const { owner, repo, path, ref } = parsed;
            await this.fetchGitHubFile(owner, repo, path, ref);
        } catch (error) {
            console.error('Error fetching from GitHub URL:', error);
            vscode.window.showErrorMessage(`Failed to fetch from GitHub URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    /**
     * Parse GitHub URL into components
     * @param url GitHub URL
     * @returns Parsed components or null if invalid
     */
    private parseGitHubUrl(url: string): { owner: string; repo: string; path: string; ref: string } | null {
        try {
            // Handle different GitHub URL formats:
            // https://github.com/owner/repo/blob/branch/path/to/file
            // https://github.com/owner/repo/tree/branch/path/to/dir
            
            const urlObj = new URL(url);
            if (urlObj.hostname !== 'github.com') {
                return null;
            }

            const parts = urlObj.pathname.split('/').filter(p => p);
            
            if (parts.length < 5) {
                return null;
            }

            const owner = parts[0];
            const repo = parts[1];
            const type = parts[2]; // 'blob' or 'tree'
            const ref = parts[3];
            const path = parts.slice(4).join('/');

            return { owner, repo, path, ref };
        } catch (error) {
            return null;
        }
    }

    /**
     * Set GitHub authentication token
     * @param token GitHub personal access token
     */
    setGitHubToken(token: string) {
        this.initializeGitHub(token);
        vscode.window.showInformationMessage('GitHub authentication token updated');
    }

    /**
     * Get repository README content
     * @param owner Repository owner
     * @param repo Repository name
     */
    async fetchGitHubReadme(owner: string, repo: string): Promise<void> {
        try {
            if (!this._octokit) {
                this.initializeGitHub();
            }

            const response = await this._octokit!.repos.getReadme({
                owner,
                repo
            });

            const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
            const contextKey = `${owner}/${repo}/README.md`;
            this.addGitHubContext(contextKey, content);
            
            vscode.window.showInformationMessage(`Added README from ${owner}/${repo}`);
        } catch (error) {
            console.error('Error fetching GitHub README:', error);
            vscode.window.showErrorMessage(`Failed to fetch README: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
}
