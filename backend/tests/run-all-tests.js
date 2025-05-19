const { spawn } = require('child_process');
const path = require('path');

// List of test files to run
const testFiles = [
  'auth.test.js',
  'appointments.test.js',
  'notifications.test.js'
];

// Function to run a test file
function runTest(testFile) {
  return new Promise((resolve, reject) => {
    console.log(`\n========== Running ${testFile} ==========\n`);
    
    const testProcess = spawn('node', [path.join(__dirname, testFile)], {
      stdio: 'inherit'
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${testFile} completed successfully\n`);
        resolve();
      } else {
        console.error(`\n❌ ${testFile} failed with code ${code}\n`);
        resolve(); // Resolve anyway to continue with other tests
      }
    });
    
    testProcess.on('error', (error) => {
      console.error(`\n❌ Error running ${testFile}: ${error.message}\n`);
      resolve(); // Resolve anyway to continue with other tests
    });
  });
}

// Run all tests sequentially
async function runAllTests() {
  console.log('Starting all tests...');
  
  for (const testFile of testFiles) {
    await runTest(testFile);
  }
  
  console.log('\n========== All tests completed ==========\n');
}

// Run the tests
runAllTests().catch(error => {
  console.error('Error running tests:', error);
});
