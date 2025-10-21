import axios, { AxiosResponse } from 'axios';
import * as vscode from 'vscode';
import { ResponseFormatter } from './responseFormatter';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface OllamaResponse {
    model: string;
    created_at: string;
    message: {
        role: string;
        content: string;
    };
    done: boolean;
}

export class OllamaService {
    private baseUrl: string;
    private modelName: string;

    constructor() {
        const config = vscode.workspace.getConfiguration('numberedOutput');
        this.baseUrl = config.get('ollamaUrl', 'http://localhost:11434');
        this.modelName = config.get('modelName', 'llama2');
    }

    async generateResponse(messages: ChatMessage[]): Promise<string> {
        try {
            // Ensure system message enforces numbered output
            const systemMessage: ChatMessage = {
                role: 'system',
                content: 'IMPORTANT: When providing code suggestions, steps, or any structured output, ALWAYS number each item clearly (1., 2., 3., etc.). Format all code-related responses with numbered steps for better readability and organization.'
            };

            // Add system message if not already present
            const hasSystemMessage = messages.some(msg => msg.role === 'system');
            const messagesWithSystem = hasSystemMessage ? messages : [systemMessage, ...messages];

            const response: AxiosResponse<OllamaResponse> = await axios.post(
                `${this.baseUrl}/api/chat`,
                {
                    model: this.modelName,
                    messages: messagesWithSystem,
                    stream: false
                },
                {
                    timeout: 30000 // 30 second timeout
                }
            );

            if (response.data && response.data.message) {
                // Use ResponseFormatter for consistent formatting
                return ResponseFormatter.format(response.data.message.content);
            }

            throw new Error('Invalid response from Ollama');
        } catch (error) {
            console.error('Ollama API error:', error);
            
            if (axios.isAxiosError(error)) {
                if (error.code === 'ECONNREFUSED') {
                    throw new Error('Cannot connect to Ollama server. Please ensure Ollama is running on ' + this.baseUrl);
                } else if (error.response) {
                    throw new Error(`Ollama API error: ${error.response.status} ${error.response.statusText}`);
                }
            }
            
            throw new Error('Failed to generate response from Ollama');
        }
    }

    /**
     * Legacy method - now uses ResponseFormatter
     * @deprecated Use ResponseFormatter.format() directly
     */
    private formatResponse(content: string): string {
        return ResponseFormatter.format(content);
    }

    async testConnection(): Promise<boolean> {
        try {
            const response = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 5000 });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    getModelName(): string {
        return this.modelName;
    }

    getBaseUrl(): string {
        return this.baseUrl;
    }
}
