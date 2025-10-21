"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const responseFormatter_1 = require("../../responseFormatter");
suite('ResponseFormatter Test Suite', () => {
    test('Should add numbering to unnumbered steps', () => {
        const input = `Here are the steps:
Create a new file
Add the import statements
Implement the function
Test the code`;
        const output = responseFormatter_1.ResponseFormatter.formatResponse(input);
        assert.ok(output.includes('1. Create a new file'));
        assert.ok(output.includes('2. Add the import statements'));
        assert.ok(output.includes('3. Implement the function'));
        assert.ok(output.includes('4. Test the code'));
    });
    test('Should not number lines inside code blocks', () => {
        const input = `Follow these steps:
\`\`\`typescript
function example() {
    return true;
}
\`\`\`
Then continue with the next step`;
        const output = responseFormatter_1.ResponseFormatter.formatResponse(input);
        // Code inside block should not be numbered
        assert.ok(output.includes('function example()'));
        assert.ok(!output.includes('1. function example()'));
    });
    test('Should preserve existing numbering', () => {
        const input = `1. First step
2. Second step
3. Third step`;
        const output = responseFormatter_1.ResponseFormatter.formatResponse(input);
        assert.ok(output.includes('1. First step'));
        assert.ok(output.includes('2. Second step'));
        assert.ok(output.includes('3. Third step'));
    });
    test('Should not number section headers', () => {
        const input = `# Main Header
Create the component
## Subsection
Add the styles`;
        const output = responseFormatter_1.ResponseFormatter.formatResponse(input);
        assert.ok(output.includes('# Main Header'));
        assert.ok(!output.includes('1. # Main Header'));
    });
    test('Should detect language in code blocks', () => {
        const input = `\`\`\`
function test() {
    console.log("hello");
}
\`\`\``;
        const output = responseFormatter_1.ResponseFormatter.enhanceCodeBlocks(input);
        assert.ok(output.includes('```javascript') || output.includes('```typescript'));
    });
    test('Should clean excessive blank lines', () => {
        const input = 'Line 1\n\n\n\n\nLine 2';
        const output = responseFormatter_1.ResponseFormatter.cleanResponse(input);
        const blankLineCount = (output.match(/\n\n/g) || []).length;
        assert.ok(blankLineCount <= 1);
    });
    test('Should validate numbered format', () => {
        const validInput = `1. First step
2. Second step
3. Third step`;
        const result = responseFormatter_1.ResponseFormatter.validateNumberedFormat(validInput);
        assert.strictEqual(result.isValid, true);
        assert.strictEqual(result.issues.length, 0);
    });
    test('Should detect non-sequential numbering', () => {
        const invalidInput = `1. First step
3. Third step
5. Fifth step`;
        const result = responseFormatter_1.ResponseFormatter.validateNumberedFormat(invalidInput);
        assert.strictEqual(result.isValid, false);
        assert.ok(result.issues.length > 0);
    });
    test('Full formatting pipeline', () => {
        const input = `Here's how to do it:
Create a new file
Add this code:
\`\`\`
const x = 10;
\`\`\`


Then test it`;
        const output = responseFormatter_1.ResponseFormatter.format(input);
        // Should have numbered steps
        assert.ok(output.includes('1.'));
        // Should detect language
        assert.ok(output.includes('```'));
        // Should clean excessive whitespace
        assert.ok(!output.includes('\n\n\n\n'));
    });
    test('Should not number short lines', () => {
        const input = `Create a component
Hi
Test it`;
        const output = responseFormatter_1.ResponseFormatter.formatResponse(input);
        // "Hi" is too short to be numbered
        assert.ok(!output.includes('2. Hi'));
    });
    test('Should handle empty input', () => {
        const input = '';
        const output = responseFormatter_1.ResponseFormatter.format(input);
        assert.strictEqual(output, '');
    });
    test('Should handle input with only code blocks', () => {
        const input = `\`\`\`typescript
function example() {
    return true;
}
\`\`\``;
        const output = responseFormatter_1.ResponseFormatter.format(input);
        assert.ok(output.includes('```typescript'));
        assert.ok(output.includes('function example()'));
    });
});
//# sourceMappingURL=responseFormatter.test.js.map