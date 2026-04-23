#!/usr/bin/env node
const http = require('http');
const API_BASE = 'http://localhost:4000/api';
let authToken = null;

const colors = { reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m' };
function log(msg, col = 'reset') { console.log(`${colors[col]}${msg}${colors.reset}`); }

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path.startsWith('http') ? path : API_BASE + path);
    const options = { hostname: url.hostname, port: url.port || 80, path: url.pathname + url.search, method, headers: { 'Content-Type': 'application/json' } };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  log('\n' + '='.repeat(70), 'cyan');
  log('DETAILED DIAGNOSTIC TESTS', 'cyan');
  log('='.repeat(70) + '\n', 'cyan');

  // Register test user
  log('Registering test user...', 'blue');
  const regRes = await makeRequest('POST', '/auth/register', {
    name: 'Debug User',
    email: `debug${Date.now()}@test.com`,
    password: 'Debug@123456',
    somiteeName: 'Debug Somitee',
    phone: '01700000000',
  });

  if (regRes.status === 201 && regRes.body.data) {
    authToken = regRes.body.data.token;
    log(`✓ Registered and authenticated`, 'green');
  } else {
    log(`✗ Registration failed: ${regRes.status}`, 'red');
    process.exit(1);
  }

  // Test 1: Bank Accounts
  log('\n' + '-'.repeat(70), 'yellow');
  log('TEST 1: POST /bank-accounts', 'blue');
  log('-'.repeat(70), 'yellow');
  
  const bankRes = await makeRequest('POST', '/bank-accounts', {
    bankName: 'Test Bank ' + Date.now(),
    accountName: 'Test Account',
    accountNumber: 'ACC' + Date.now(),
    openingBalance: 100000,
  }, authToken);
  
  log(`Status: ${bankRes.status}`, bankRes.status === 201 ? 'green' : 'red');
  if (bankRes.body.data) {
    log(`✓ Success`, 'green');
  } else if (bankRes.body && bankRes.body.message) {
    log(`Error: ${bankRes.body.message}`, 'red');
    if (bankRes.body.errors) log(JSON.stringify(bankRes.body.errors, null, 2), 'cyan');
  }

  // Test 2: Delete Expense
  log('\n' + '-'.repeat(70), 'yellow');
  log('TEST 2: DELETE /expenses/{id}', 'blue');
  log('-'.repeat(70), 'yellow');

  const expRes = await makeRequest('POST', '/expenses', {
    amount: 1000,
    date: new Date().toISOString(),
    category: 'Test',
    method: 'cash',
    note: 'Test expense',
  }, authToken);

  if (expRes.body.data && expRes.body.data.id) {
    const expId = expRes.body.data.id;
    log(`Created expense ID: ${expId}`, 'cyan');
    
    const delRes = await makeRequest('DELETE', `/expenses/${expId}`, null, authToken);
    log(`Delete Status: ${delRes.status}`, delRes.status === 200 ? 'green' : 'red');
    if (delRes.body && delRes.body.message) {
      log(`Message: ${delRes.body.message}`, 'cyan');
    }
  }

  // Test 3: Delete FAQ
  log('\n' + '-'.repeat(70), 'yellow');
  log('TEST 3: DELETE /faq/{id}', 'blue');
  log('-'.repeat(70), 'yellow');

  const faqRes = await makeRequest('POST', '/faq', {
    question: 'Test Q ' + Date.now() + '?',
    answer: 'Test Answer',
    category: 'General',
  }, authToken);

  if (faqRes.body.data && faqRes.body.data.id) {
    const faqId = faqRes.body.data.id;
    log(`Created FAQ ID: ${faqId}`, 'cyan');
    
    const delFaqRes = await makeRequest('DELETE', `/faq/${faqId}`, null, authToken);
    log(`Delete Status: ${delFaqRes.status}`, delFaqRes.status === 200 ? 'green' : 'red');
    if (delFaqRes.body && delFaqRes.body.message) {
      log(`Message: ${delFaqRes.body.message}`, 'cyan');
    }
  }

  // Test 4: Company Settings
  log('\n' + '-'.repeat(70), 'yellow');
  log('TEST 4: GET /company/settings', 'blue');
  log('-'.repeat(70), 'yellow');

  const setRes = await makeRequest('GET', '/company/settings', null, authToken);
  log(`Status: ${setRes.status}`, setRes.status === 200 ? 'green' : 'red');
  if (setRes.body && setRes.body.message) {
    log(`Message: ${setRes.body.message}`, 'cyan');
  }

  log('\n' + '='.repeat(70), 'cyan');
  log('DIAGNOSTIC COMPLETE', 'cyan');
  log('='.repeat(70) + '\n', 'cyan');
}

run().catch(err => { log(`Error: ${err.message}`, 'red'); process.exit(1); });
