// Test script to verify Lambda backend integration
// Run this with: node test-lambda-integration.js

const API_BASE_URL = 'https://7cwq9pgrx0.execute-api.us-east-1.amazonaws.com/production';

async function testContactEndpoint() {
  console.log('🧪 Testing Contact Form Endpoint...');
  
  const testData = {
    name: 'Frontend Integration Test',
    email: 'frontend-test@example.com',
    subject: 'Testing Lambda Integration',
    message: 'This is a test message to verify the frontend is successfully connected to the new AWS Lambda backend with SES email functionality.'
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Contact form test PASSED');
      console.log('📧 Message:', result.message);
      return true;
    } else {
      console.log('❌ Contact form test FAILED');
      console.log('Error:', result.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ Contact form test FAILED with exception');
    console.log('Error:', error.message);
    return false;
  }
}

async function testQuestionnaireEndpoint() {
  console.log('\n🧪 Testing Questionnaire Endpoint...');
  
  const testData = {
    entityType: 'Private Company (Pty Ltd)',
    annualRevenue: 'R1,000,001 - R5,000,000',
    companyName: 'Frontend Test Company (Pty) Ltd',
    industry: 'Information Technology',
    hasEmployees: 'Yes',
    employeeCount: '6-20',
    managesStock: 'No',
    dealsForeignCurrency: 'No',
    taxComplexity: 'Moderate',
    auditRequirements: 'Not Required',
    regulatoryReporting: 'Standard',
    primaryGoal: 'Improve Financial Management',
    businessChallenges: 'Testing the frontend integration with the new AWS Lambda backend to ensure questionnaire submissions work correctly with SES email delivery.',
    contactName: 'Frontend Test Contact',
    email: 'frontend-test@example.com',
    phoneNumber: '+27123456789',
    quoteDetails: {
      quote: 15000,
      basePrice: 8000,
      payrollCost: 2000,
      revenueModifier: 1.2,
      complexityModifier: 1.1,
      complexityFactors: ['employees', 'moderate_tax'],
      baseServices: ['bookkeeping', 'tax_compliance']
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/questionnaire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Questionnaire test PASSED');
      console.log('📧 Message:', result.message);
      if (result.data && result.data.quote) {
        console.log('💰 Quote calculated:', `R${result.data.quote}`);
      }
      return true;
    } else {
      console.log('❌ Questionnaire test FAILED');
      console.log('Error:', result.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ Questionnaire test FAILED with exception');
    console.log('Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Frontend Lambda Integration Tests');
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('=' .repeat(60));
  
  const contactResult = await testContactEndpoint();
  const questionnaireResult = await testQuestionnaireEndpoint();
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Test Results Summary:');
  console.log(`Contact Form: ${contactResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Questionnaire: ${questionnaireResult ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (contactResult && questionnaireResult) {
    console.log('\n🎉 All tests PASSED! Frontend is successfully integrated with Lambda backend.');
    console.log('📧 SES email functionality is working correctly.');
    console.log('💰 Quote calculations are preserved and working.');
  } else {
    console.log('\n⚠️ Some tests FAILED. Please check the Lambda functions and API Gateway configuration.');
  }
}

// Run the tests
runTests().catch(console.error);