"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaService = void 0;
const axios_1 = require("axios");
const vscode = require("vscode");
const responseFormatter_1 = require("./responseFormatter");
class OllamaService {
    constructor() {
        const config = vscode.workspace.getConfiguration('numberedOutput');
        this.baseUrl = config.get('ollamaUrl', 'http://localhost:11434');
        this.modelName = config.get('modelName', 'llama2');
    }
    async generateResponse(messages) {
        try {
            // Ensure system message enforces numbered output
            const systemMessage = {
                role: 'system',
                content: 'IMPORTANT: When providing code suggestions, steps, or any structured output, ALWAYS number each item clearly (1., 2., 3., etc.). Format all code-related responses with numbered steps for better readability and organization.'
            };
            // Add system message if not already present
            const hasSystemMessage = messages.some(msg => msg.role === 'system');
            const messagesWithSystem = hasSystemMessage ? messages : [systemMessage, ...messages];
            const response = await axios_1.default.post(`${this.baseUrl}/api/chat`, {
                model: this.modelName,
                messages: messagesWithSystem,
                stream: false
            }, {
                timeout: 30000 // 30 second timeout
            });
            if (response.data && response.data.message) {
                // Use ResponseFormatter for consistent formatting
                return responseFormatter_1.ResponseFormatter.format(response.data.message.content);
            }
            throw new Error('Invalid response from Ollama');
        }
        catch (error) {
            console.error('Ollama API error:', error);
            if (axios_1.default.isAxiosError(error)) {
                if (error.code === 'ECONNREFUSED') {
                    throw new Error('Cannot connect to Ollama server. Please ensure Ollama is running on ' + this.baseUrl);
                }
                else if (error.response) {
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
    formatResponse(content) {
        return responseFormatter_1.ResponseFormatter.format(content);
    }
    async testConnection() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/api/tags`, { timeout: 5000 });
            return response.status === 200;
        }
        catch (error) {
            return false;
        }
    }
    getModelName() {
        return this.modelName;
    }
    getBaseUrl() {
        return this.baseUrl;
    }
}
exports.OllamaService = OllamaService;
//# sourceMappingURL=ollamaService.js.map