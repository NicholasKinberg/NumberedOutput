#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Continue Extension Configuration for Numbered Output\n');

// Check if Continue config exists
const configPath = path.join(process.env.HOME, '.continue', 'config.ts');
console.log(`📁 Checking config file: ${configPath}`);

if (!fs.existsSync(configPath)) {
  console.log('❌ Continue config file not found!');
  console.log('   Please ensure Continue extension is installed and configured.');
  process.exit(1);
}

console.log('✅ Continue config file exists');

// Read and analyze the config
try {
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  console.log('\n📄 Config file contents:');
  console.log('─'.repeat(50));
  console.log(configContent);
  console.log('─'.repeat(50));
  
  // Check for numbered output enforcement
  const hasNumberedOutput = configContent.includes('ALWAYS number each item clearly');
  const hasSystemMessage = configContent.includes('systemMessage');
  const hasModifyConfig = configContent.includes('modifyConfig');
  
  console.log('\n🔍 Configuration Analysis:');
  console.log(`   ✅ Has modifyConfig function: ${hasModifyConfig ? 'Yes' : 'No'}`);
  console.log(`   ✅ Has systemMessage handling: ${hasSystemMessage ? 'Yes' : 'No'}`);
  console.log(`   ✅ Has numbered output enforcement: ${hasNumberedOutput ? 'Yes' : 'No'}`);
  
  if (hasNumberedOutput && hasSystemMessage && hasModifyConfig) {
    console.log('\n🎉 SUCCESS: Continue extension is properly configured for numbered output!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Restart VS Code to load the new configuration');
    console.log('   2. Open Continue extension in VS Code');
    console.log('   3. Test with the prompts from PHASE1_TESTING_GUIDE.md');
  } else {
    console.log('\n❌ Configuration incomplete. Missing required elements.');
    process.exit(1);
  }
  
} catch (error) {
  console.log(`❌ Error reading config file: ${error.message}`);
  process.exit(1);
}

console.log('\n✨ Test completed successfully!');
