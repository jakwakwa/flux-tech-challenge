// Using native fetch in Node.js 18+

async function testAddTaskFunctionality() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing Add Task functionality...\n');
  
  try {
    // Test 1: Check if API returns wrapped response
    console.log('1. Testing API response format...');
    const apiResponse = await fetch(`${baseUrl}/api/lists`);
    const apiData = await apiResponse.json();
    
    if (apiData.success !== undefined && apiData.data !== undefined) {
      console.log('✓ API returns wrapped response format { success, data }');
      console.log(`  - Found ${apiData.data.length} lists`);
    } else {
      console.log('✗ API response format is incorrect');
      console.log('  Response:', JSON.stringify(apiData, null, 2));
    }
    
    // Test 2: Check dashboard HTML for Add Task button
    console.log('\n2. Testing Add Task button visibility...');
    const dashboardResponse = await fetch(`${baseUrl}/dashboard`);
    const dashboardHtml = await dashboardResponse.text();
    
    if (dashboardHtml.includes('Add Task')) {
      console.log('✓ Add Task button is present in dashboard HTML');
    } else {
      console.log('✗ Add Task button is NOT found in dashboard HTML');
    }
    
    // Test 3: Check if lists are populated in the select
    if (dashboardHtml.includes('select') && dashboardHtml.includes('option')) {
      console.log('✓ Select element with options found (lists dropdown)');
    } else {
      console.log('✗ No select element with options found');
    }
    
    console.log('\n✅ Test completed');
    
  } catch (error) {
    console.error('Error during testing:', error.message);
  }
}

// Check if server is running
fetch('http://localhost:3000')
  .then(() => {
    testAddTaskFunctionality();
  })
  .catch(() => {
    console.log('Server is not running. Please start with: pnpm dev');
  });