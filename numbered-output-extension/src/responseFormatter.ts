/**
 * Response Formatter Module
 * Handles post-processing of LLM responses to ensure numbered output formatting
 */

export class ResponseFormatter {
    /**
     * Format the LLM response to ensure proper numbered output
     * @param content The raw content from the LLM
     * @returns Formatted content with numbered steps
     */
    static formatResponse(content: string): string {
        // Split content into lines for processing
        const lines = content.split('\n');
        let formattedLines: string[] = [];
        let inCodeBlock = false;
        let stepCounter = 1;
        let previousLineWasEmpty = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            // Track code blocks to avoid numbering code
            if (trimmedLine.startsWith('```')) {
                inCodeBlock = !inCodeBlock;
                formattedLines.push(line);
                previousLineWasEmpty = false;
                continue;
            }

            // Don't modify lines inside code blocks
            if (inCodeBlock) {
                formattedLines.push(line);
                previousLineWasEmpty = false;
                continue;
            }

            // Skip empty lines
            if (trimmedLine === '') {
                formattedLines.push(line);
                previousLineWasEmpty = true;
                continue;
            }

            // Check if this line should be numbered
            if (this.shouldBeNumbered(trimmedLine)) {
                // Check if it's already numbered
                if (this.isAlreadyNumbered(trimmedLine)) {
                    formattedLines.push(line);
                    // Reset or track the counter based on existing number
                    const match = trimmedLine.match(/^(\d+)\./);
                    if (match) {
                        stepCounter = parseInt(match[1]) + 1;
                    }
                } else {
                    // Add numbering
                    const indent = line.match(/^(\s*)/)?.[1] || '';
                    formattedLines.push(`${indent}${stepCounter}. ${trimmedLine}`);
                    stepCounter++;
                }
            } else {
                formattedLines.push(line);
                // Reset counter if we encounter a new section header
                if (this.isSectionHeader(trimmedLine)) {
                    stepCounter = 1;
                }
            }

            previousLineWasEmpty = false;
        }

        return formattedLines.join('\n');
    }

    /**
     * Check if a line should be numbered
     * @param line The trimmed line to check
     * @returns True if the line should have numbering
     */
    private static shouldBeNumbered(line: string): boolean {
        // Don't number very short lines
        if (line.length < 10) {
            return false;
        }

        // Don't number lines that look like headers
        if (this.isSectionHeader(line)) {
            return false;
        }

        // Don't number lines that are already part of a list
        if (/^[-*•]/.test(line)) {
            return false;
        }

        // Patterns that indicate this should be numbered
        const actionPatterns = [
            /^(create|add|implement|write|return|check|install|navigate|start|use|set|configure|build|run|test|debug|open|close|save|delete|update|modify|remove|edit|copy|paste|move|rename|search|find|replace)/i,
            /^(first|second|third|next|then|finally|last|after|before)/i,
            /^(function|method|class|interface|type|variable|const|let|var|import|export|from|require)/i,
            /^(define|declare|initialize|assign|call|invoke|execute|trigger|handle|process|parse|validate)/i,
        ];

        // Instructional patterns
        const instructionPatterns = [
            /step/i,
            /instruction/i,
            /to do/i,
            /you need/i,
            /you should/i,
            /make sure/i,
            /ensure that/i,
        ];

        // Check if line matches action patterns
        const matchesAction = actionPatterns.some(pattern => pattern.test(line));
        
        // Check if line matches instruction patterns
        const matchesInstruction = instructionPatterns.some(pattern => pattern.test(line));

        return matchesAction || matchesInstruction;
    }

    /**
     * Check if a line is already numbered
     * @param line The trimmed line to check
     * @returns True if the line already has numbering
     */
    private static isAlreadyNumbered(line: string): boolean {
        return /^\d+\./.test(line);
    }

    /**
     * Check if a line is a section header
     * @param line The trimmed line to check
     * @returns True if the line is a header
     */
    private static isSectionHeader(line: string): boolean {
        // Markdown headers
        if (/^#+\s/.test(line)) {
            return true;
        }

        // All caps headers (short lines)
        if (line.length < 50 && line === line.toUpperCase() && /[A-Z]/.test(line)) {
            return true;
        }

        // Lines ending with colon (section intros)
        if (/^[A-Z].*:$/.test(line) && line.length < 60) {
            return true;
        }

        return false;
    }

    /**
     * Format code blocks with proper syntax highlighting hints
     * @param content The content to process
     * @returns Content with enhanced code block formatting
     */
    static enhanceCodeBlocks(content: string): string {
        // Find code blocks and add language hints if missing
        const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
        
        return content.replace(codeBlockRegex, (match, language, code) => {
            // If no language specified, try to detect it
            if (!language || language.trim() === '') {
                language = this.detectLanguage(code);
            }
            return `\`\`\`${language}\n${code}\`\`\``;
        });
    }

    /**
     * Simple language detection for code blocks
     * @param code The code to analyze
     * @returns Detected language identifier
     */
    private static detectLanguage(code: string): string {
        const trimmedCode = code.trim();
        
        // TypeScript/JavaScript
        if (/^(import|export|const|let|var|function|class|interface|type)\s/.test(trimmedCode)) {
            if (/:\s*\w+(\[\])?(\s*=>|\s*=|\s*{)/.test(trimmedCode)) {
                return 'typescript';
            }
            return 'javascript';
        }

        // Python
        if (/^(def|class|import|from|if __name__)/m.test(trimmedCode)) {
            return 'python';
        }

        // Java
        if (/^(public|private|protected)\s+(class|interface|static|void)/.test(trimmedCode)) {
            return 'java';
        }

        // C/C++
        if (/#include|int main\(/.test(trimmedCode)) {
            return 'cpp';
        }

        // Go
        if (/^(package|func|type)\s/.test(trimmedCode)) {
            return 'go';
        }

        // Rust
        if (/^(fn|pub|struct|impl|use)\s/.test(trimmedCode)) {
            return 'rust';
        }

        // JSON
        if (/^\s*\{[\s\S]*\}\s*$/.test(trimmedCode) && /\"[^"]+\"\s*:/.test(trimmedCode)) {
            return 'json';
        }

        // HTML
        if (/<\/?[a-z][\s\S]*>/i.test(trimmedCode)) {
            return 'html';
        }

        // CSS
        if (/[.#]?[\w-]+\s*\{[\s\S]*\}/.test(trimmedCode) && /[\w-]+\s*:\s*[^;]+;/.test(trimmedCode)) {
            return 'css';
        }

        // Shell/Bash
        if (/^(#!\/bin\/(ba)?sh|npm|yarn|git|cd|ls|mkdir|rm|mv|cp)\s/.test(trimmedCode)) {
            return 'bash';
        }

        // Default to text if unable to detect
        return 'text';
    }

    /**
     * Clean and standardize the response format
     * @param content The content to clean
     * @returns Cleaned content
     */
    static cleanResponse(content: string): string {
        // Remove excessive blank lines (more than 2 consecutive)
        let cleaned = content.replace(/\n{3,}/g, '\n\n');

        // Ensure consistent spacing around code blocks
        cleaned = cleaned.replace(/```(\w*)\n/g, '\n```$1\n');
        cleaned = cleaned.replace(/```\n/g, '```\n\n');

        // Trim leading and trailing whitespace
        cleaned = cleaned.trim();

        return cleaned;
    }

    /**
     * Full formatting pipeline
     * @param content Raw LLM response
     * @returns Fully formatted response
     */
    static format(content: string): string {
        let formatted = content;
        
        // 1. Enhance code blocks
        formatted = this.enhanceCodeBlocks(formatted);
        
        // 2. Apply numbered formatting
        formatted = this.formatResponse(formatted);
        
        // 3. Clean up the result
        formatted = this.cleanResponse(formatted);
        
        return formatted;
    }

    /**
     * Validate that the response has proper numbered formatting
     * @param content The content to validate
     * @returns Validation result with issues found
     */
    static validateNumberedFormat(content: string): { isValid: boolean; issues: string[] } {
        const issues: string[] = [];
        const lines = content.split('\n');
        let hasNumberedSteps = false;
        let lastNumber = 0;
        let inCodeBlock = false;

        for (const line of lines) {
            const trimmed = line.trim();

            // Track code blocks
            if (trimmed.startsWith('```')) {
                inCodeBlock = !inCodeBlock;
                continue;
            }

            if (inCodeBlock) {
                continue;
            }

            // Check for numbered items
            const match = trimmed.match(/^(\d+)\./);
            if (match) {
                hasNumberedSteps = true;
                const currentNumber = parseInt(match[1]);
                
                // Check for sequential numbering
                if (lastNumber > 0 && currentNumber !== lastNumber + 1) {
                    issues.push(`Non-sequential numbering: ${lastNumber} -> ${currentNumber}`);
                }
                
                lastNumber = currentNumber;
            }
        }

        // Check if content should have numbers but doesn't
        const hasInstructions = lines.some(line => 
            this.shouldBeNumbered(line.trim()) && !this.isAlreadyNumbered(line.trim())
        );

        if (hasInstructions && !hasNumberedSteps) {
            issues.push('Content appears to contain steps but lacks numbered formatting');
        }

        return {
            isValid: issues.length === 0,
            issues
        };
    }
}

