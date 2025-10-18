#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Phase 2 Extension Verification');
console.log('================================\n');

const extensionPath = '/Users/nicholaskinberg/Downloads/NumberedOutput/numbered-output-extension';

// Check if extension directory exists
if (!fs.existsSync(extensionPath)) {
    console.log('❌ Extension directory not found');
    process.exit(1);
}

console.log('✅ Extension directory found');

// Check package.json
const packageJsonPath = path.join(extensionPath, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json not found');
    process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
console.log('✅ package.json found');
console.log(`   Name: ${packageJson.name}`);
console.log(`   Version: ${packageJson.version}`);
console.log(`   Commands: ${packageJson.contributes.commands.length}`);

// Check TypeScript compilation
const outDir = path.join(extensionPath, 'out');
if (!fs.existsSync(outDir)) {
    console.log('❌ Compiled output directory not found');
    console.log('   Run: npm run compile');
    process.exit(1);
}

console.log('✅ Compiled output directory found');

// Check key compiled files
const keyFiles = [
    'extension.js',
    'chatPanel.js',
    'ollamaService.js',
    'contextManager.js',
    'historyManager.js'
];

let allFilesExist = true;
keyFiles.forEach(file => {
    const filePath = path.join(outDir, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} compiled`);
    } else {
        console.log(`❌ ${file} not found`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.log('\n❌ Some compiled files are missing');
    process.exit(1);
}

// Check media files
const mediaDir = path.join(extensionPath, 'media');
const mediaFiles = ['reset.css', 'vscode.css', 'main.js'];

mediaFiles.forEach(file => {
    const filePath = path.join(mediaDir, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} found`);
    } else {
        console.log(`❌ ${file} not found`);
    }
});

// Check node_modules
const nodeModulesPath = path.join(extensionPath, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
    console.log('✅ Dependencies installed');
} else {
    console.log('❌ Dependencies not installed');
    console.log('   Run: npm install');
}

console.log('\n🎉 Extension Structure Verification Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Open VS Code');
console.log('2. Go to Run and Debug (Ctrl+Shift+D)');
console.log('3. Select "Extension Development Host" configuration');
console.log('4. Press F5 to launch new VS Code window with extension');
console.log('5. Test the extension with the provided test prompts');
console.log('\n📖 See PHASE2_TEST_RESULTS.md for detailed testing instructions');
