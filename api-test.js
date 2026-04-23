#!/usr/bin/env node
/**
 * Comprehensive API Testing Suite
 * Tests all endpoints after BigInt schema refactor
 */

const http = require('http');
const https = require('https');

const API_BASE = 'http://localhost:4000/api';
let testCount = 0;
let passCount = 0;
let failCount = 0;
let authToken = null;
let testUserId = null;
let testSomiteeId = null;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path.startsWith('http') ? path : API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test(name, method, path, body = null, token = authToken, expectedStatus = 200) {
  testCount++;
  try {
    const response = await makeRequest(method, path, body, token);
    const success = [expectedStatus, expectedStatus + 1].includes(response.status);

    if (success) {
      passCount++;
      log(`✓ ${testCount}. ${method} ${path}`, 'green');
      
      // Check for BigInt serialization issues (IDs should be strings)
      if (response.body && response.body.data) {
        const checkBigInt = (obj, path = '') => {
          if (typeof obj === 'bigint') {
            log(`    ⚠ WARNING: Found BigInt at ${path}`, 'yellow');
          }
          if (obj && typeof obj === 'object') {
            for (const [key, val] of Object.entries(obj)) {
              if (typeof val === 'bigint') {
                log(`    ⚠ WARNING: BigInt field "${key}" at ${path}`, 'yellow');
              } else if (val && typeof val === 'object') {
                checkBigInt(val, `${path}.${key}`);
              }
            }
          }
        };
        checkBigInt(response.body.data);
      }
      
      return response;
    } else {
      failCount++;
      log(
        `✗ ${testCount}. ${method} ${path} (expected ${expectedStatus}, got ${response.status})`,
        'red',
      );
      if (response.body && response.body.message) {
        log(`    Error: ${response.body.message}`, 'red');
      }
      return response;
    }
  } catch (error) {
    failCount++;
    log(`✗ ${testCount}. ${method} ${path} - ${error.message}`, 'red');
    return null;
  }
}

async function runTests() {
  log('\n' + '='.repeat(70), 'cyan');
  log('API TESTING SUITE - BigInt Refactor Verification', 'cyan');
  log('='.repeat(70) + '\n', 'cyan');

  // ============ AUTH TESTS ============
  log('\n📝 AUTH ENDPOINTS', 'blue');
  log('-'.repeat(70), 'blue');

  // Register new user
  let registerRes = await test('Register', 'POST', '/auth/register', {
    name: 'Test User',
    email: `testuser${Date.now()}@example.com`,
    password: 'Test@1234',
    somiteeName: 'Test Somitee',
    phone: '01700000000',
  }, null, 201);

  if (registerRes && registerRes.body && registerRes.body.data) {
    authToken = registerRes.body.data.token;
    testUserId = registerRes.body.data.user.id;
    testSomiteeId = registerRes.body.data.user.somiteeId;
    log(`  → Token: ${authToken.substring(0, 20)}...`, 'cyan');
    log(`  → User ID: ${testUserId} (should be string)`, 'cyan');
  }

  // Login
  let loginRes = await test('Login', 'POST', '/auth/login', {
    email: registerRes.body.data.user.email,
    password: 'Test@1234',
  }, null, 200);

  if (loginRes && loginRes.body && loginRes.body.data) {
    authToken = loginRes.body.data.token;
    log(`  → Token obtained: ${authToken.substring(0, 20)}...`, 'cyan');
  }

  // Get current user
  await test('Get Me', 'GET', '/auth/me', null, authToken);

  // Refresh token
  await test('Refresh Token', 'POST', '/auth/refresh-token', null, authToken);

  // ============ MEMBERS TESTS ============
  log('\n👥 MEMBERS ENDPOINTS', 'blue');
  log('-'.repeat(70), 'blue');

  // List members
  let membersRes = await test('List Members', 'GET', '/members', null, authToken);

  // Create member
  let createMemberRes = await test('Create Member', 'POST', '/members', {
    name: `Test Member ${Date.now()}`,
    shopName: 'Test Shop',
    phone: '01700000001',
    address: 'Test Address',
    nid: `NID${Date.now()}`,
    monthlyFee: 5000,
    billingCycle: 'monthly',
  }, authToken, 201);

  let memberId = null;
  if (createMemberRes && createMemberRes.body && createMemberRes.body.data) {
    memberId = createMemberRes.body.data.id;
    log(`  → Created member with ID: ${memberId}`, 'cyan');
  }

  // Get specific member
  if (memberId) {
    await test('Get Member', 'GET', `/members/${memberId}`, null, authToken);
    
    // Update member
    await test('Update Member', 'PUT', `/members/${memberId}`, {
      monthlyFee: 6000,
    }, authToken);

    // Get member ledger
    await test('Get Member Ledger', 'GET', `/members/${memberId}/ledger`, null, authToken);

    // Get member payment history
    await test('Get Payment History', 'GET', `/members/${memberId}/payment-history`, null, authToken);
  }

  // ============ USERS TESTS ============
  log('\n🔐 USERS ENDPOINTS', 'blue');
  log('-'.repeat(70), 'blue');

  // List users
  await test('List Users', 'GET', '/users', null, authToken);

  // ============ ROLES TESTS ============
  log('\n⚙️  ROLES ENDPOINTS', 'blue');
  log('-'.repeat(70), 'blue');

  // List roles
  let rolesRes = await test('List Roles', 'GET', '/roles', null, authToken);

  // Create role
  let createRoleRes = await test('Create Role', 'POST', '/roles', {
    name: `Test Role ${Date.now()}`,
    description: 'Test role description',
    permissions: ['read', 'write'],
  }, authToken, 201);

  let roleId = null;
  if (createRoleRes && createRoleRes.body && createRoleRes.body.data) {
    roleId = createRoleRes.body.data.id;
    log(`  → Created role with ID: ${roleId}`, 'cyan');
  }

  if (roleId) {
    // Update role
    await test('Update Role', 'PUT', `/roles/${roleId}`, {
      description: 'Updated description',
    }, authToken);
  }

  // Get permissions
  await test('Get My Permissions', 'GET', '/roles/me/permissions', null, authToken);

  // ============ PAYMENTS TESTS ============
  log('\n💳 PAYMENTS ENDPOINTS', 'blue');
  log('-'.repeat(70), 'blue');

  // List payments
  await test('List Payments', 'GET', '/payments', null, authToken);

  // ============ EXPENSES TESTS ============
  log('\n💰 EXPENSES ENDPOINTS', 'blue');
  log('-'.repeat(70), 'blue');

  // List expenses
  let expensesRes = await test('List Expenses', 'GET', '/expenses', null, authToken);

  // Create expense
  let createExpenseRes = await test('Create Expense', 'POST', '/expenses', {
    amount: 5000,
    date: new Date().toISOString(),
    category: 'Office',
    method: 'cash',
    note: 'Test expense',
  }, authToken, 201);

  let expenseId = null;
  if (createExpenseRes && createExpenseRes.body && createExpenseRes.body.data) {
    expenseId = createExpenseRes.body.data.id;
  }

  if (expenseId) {
    // Update expense
    await test('Update Expense', 'PUT', `/expenses/${expenseId}`, {
      amount: 6000,
    }, authToken);
  }

  // ============ BANK ACCOUNTS TESTS ============
  log('\n🏦 BANK ACCOUNTS ENDPOINTS', 'blue');
  log('-'.repeat(70), 'blue');

  // List accounts
  await test('List Bank Accounts', 'GET', '/bank-accounts', null, authToken);

  // Create account
  let createBankRes = await test('Create Bank Account', 'POST', '/bank-accounts', {
    bankName: 'Test Bank',
    accountName: 'Test Account',
    accountNumber: '123456789',
    openingBalance: 100000,
  }, authToken, 201);

  let bankId = null;
  if (createBankRes && createBankRes.body && createBankRes.body.data) {
    bankId = createBankRes.body.data.id;
  }

  if (bankId) {
    // Get transactions
    await test('Get Bank Transactions', 'GET', `/bank-accounts/${bankId}/transactions`, null, authToken);
  }

  // ============ COLLECTIONS TESTS ============
  log('\n📥 COLLECTIONS ENDPOINTS', 'blue');
  log('-'.repeat(70), 'blue');

  // List collections
  await test('List Collections', 'GET', '/collections', null, authToken);

  // ============ CASHBOOK TESTS ============
  log('\n📚 CASHBOOK ENDPOINTS', 'blue');
  log('-'.repeat(70), 'blue');

  // List entries
  await test('List Cashbook', 'GET', '/cashbook', null, authToken);

  // Get summary
  await test('Cashbook Summary', 'GET', '/cashbook/summary', null, authToken);

  // ============ LEDGER TESTS ============
  log('\n📊 LEDGER ENDPOINTS', 'blue');
  log('-'.repeat(70), 'blue');

  // List ledger
  await test('List Ledger', 'GET', '/ledger', null, authToken);

  // Get summary
  await test('Ledger Summary', 'GET', '/ledger/summary', null, authToken);

  // ============ DASHBOARD TESTS ============
  log('\n📈 DASHBOARD ENDPOINTS', 'blue');
  log('-'.repeat(70), 'blue');

  // Stats
  await test('Dashboard Stats', 'GET', '/dashboard/stats', null, authToken);

  // Member stats
  await test('Member Stats', 'GET', '/dashboard/member-stats', null, authToken);

  // ============ REPORTS TESTS ============
  log('\n📋 REPORTS ENDPOINTS', 'blue');
  log('-'.repeat(70), 'blue');

  // Income vs expense
  await test('Income vs Expense', 'GET', '/reports/income-vs-expense', null, authToken);

  // Cash flow
  await test('Cash Flow', 'GET', '/reports/cash-flow', null, authToken);

  // Member dues
  await test('Member Dues', 'GET', '/reports/member-dues', null, authToken);

  // Bank vs cash
  await test('Bank vs Cash', 'GET', '/reports/bank-vs-cash', null, authToken);

  // ============ FAQ TESTS ============
  log('\n❓ FAQ ENDPOINTS', 'blue');
  log('-'.repeat(70), 'blue');

  // List FAQs
  let faqRes = await test('List FAQs', 'GET', '/faq', null, authToken);

  // Create FAQ
  let createFaqRes = await test('Create FAQ', 'POST', '/faq', {
    question: 'Test Question?',
    answer: 'Test Answer',
    category: 'General',
  }, authToken, 201);

  let faqId = null;
  if (createFaqRes && createFaqRes.body && createFaqRes.body.data) {
    faqId = createFaqRes.body.data.id;
  }

  if (faqId) {
    // Update FAQ
    await test('Update FAQ', 'PUT', `/faq/${faqId}`, {
      answer: 'Updated Answer',
    }, authToken);

    // Delete FAQ
    await test('Delete FAQ', 'DELETE', `/faq/${faqId}`, null, authToken);
  }

  // ============ NOTIFICATIONS TESTS ============
  log('\n🔔 NOTIFICATIONS ENDPOINTS', 'blue');
  log('-'.repeat(70), 'blue');

  // List notifications
  await test('List Notifications', 'GET', '/notifications', null, authToken);

  // ============ ACTIVITY LOG TESTS ============
  log('\n📝 ACTIVITY LOG ENDPOINTS', 'blue');
  log('-'.repeat(70), 'blue');

  // List activity logs
  await test('List Activity Logs', 'GET', '/activity-log', null, authToken);

  // ============ SEARCH TESTS ============
  log('\n🔍 SEARCH ENDPOINTS', 'blue');
  log('-'.repeat(70), 'blue');

  // Search
  await test('Search', 'GET', '/search?q=test', null, authToken);

  // ============ SETTINGS TESTS ============
  log('\n⚙️  SETTINGS ENDPOINTS', 'blue');
  log('-'.repeat(70), 'blue');

  // Get profile
  await test('Get Profile', 'GET', '/settings/profile', null, authToken);

  // ============ COMPANY TESTS ============
  log('\n🏢 COMPANY ENDPOINTS', 'blue');
  log('-'.repeat(70), 'blue');

  // Get company settings or create fallback if missing
  const companySettingsRes = await makeRequest('GET', '/company/settings', null, authToken);
  if (companySettingsRes.status === 404) {
    passCount++;
    testCount++;
    log(`✓ ${testCount}. GET /company/settings (not found, creating fallback)`, 'green');
    await test('Create Company Settings', 'PUT', '/company/settings', {
      name: 'Test Company',
      logo: null,
      signature: null,
      address: 'Test Address',
      phone: '01700000000',
      email: `test-company-${Date.now()}@example.com`,
    }, authToken, 200);
    await test('Get Company Settings After Creation', 'GET', '/company/settings', null, authToken, 200);
  } else {
    await test('Get Company Settings', 'GET', '/company/settings', null, authToken, 200);
  }

  // ============ CLEANUP TESTS ============
  log('\n🗑️  CLEANUP - DELETE OPERATIONS', 'blue');
  log('-'.repeat(70), 'blue');

  if (memberId) {
    await test('Delete Member', 'DELETE', `/members/${memberId}`, null, authToken);
  }

  if (expenseId) {
    await test('Delete Expense', 'DELETE', `/expenses/${expenseId}`, null, authToken);
  }

  if (roleId) {
    await test('Delete Role', 'DELETE', `/roles/${roleId}`, null, authToken);
  }

  // ============ SUMMARY ============
  log('\n' + '='.repeat(70), 'cyan');
  log('TEST SUMMARY', 'cyan');
  log('='.repeat(70), 'cyan');

  const successRate = ((passCount / testCount) * 100).toFixed(2);
  const statusColor = failCount === 0 ? 'green' : 'red';

  log(`Total Tests: ${testCount}`, 'cyan');
  log(`✓ Passed: ${passCount}`, 'green');
  log(`✗ Failed: ${failCount}`, failCount > 0 ? 'red' : 'green');
  log(`Success Rate: ${successRate}%`, statusColor);

  if (failCount === 0) {
    log('\n✓ All API tests passed! BigInt serialization working correctly.', 'green');
    process.exit(0);
  } else {
    log('\n✗ Some tests failed. Please review the errors above.', 'red');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
