const env = require('./src/config/env');
const { hashPassword, comparePassword } = require('./src/utils/password');
const { generateToken, verifyToken } = require('./src/utils/jwt');
const { parsePagination } = require('./src/utils/pagination');
const { ROLES, HTTP_STATUS, ERROR_CODES } = require('./src/utils/constants');
const app = require('./src/app');

const runTests = async () => {
  console.log('🧪 Starting Module 1 Backend Foundation Tests...\n');

  // 1. Environment configuration test
  console.log('1️⃣ Environment Config Test:');
  console.log(`   - NODE_ENV: ${env.NODE_ENV}`);
  console.log(`   - PORT: ${env.PORT}`);
  console.log(`   - CLIENT_URL: ${env.CLIENT_URL}`);
  console.log('   ✅ Environment validation passed.\n');

  // 2. Password utility test
  console.log('2️⃣ Password Hashing & Comparison Test:');
  const plainPassword = 'SuperSecurePassword123!';
  const hashedPassword = await hashPassword(plainPassword);
  console.log(`   - Hashed password: ${hashedPassword.substring(0, 25)}...`);
  const isMatch = await comparePassword(plainPassword, hashedPassword);
  const isWrongMatch = await comparePassword('WrongPassword', hashedPassword);
  console.log(`   - Correct match result: ${isMatch}`);
  console.log(`   - Incorrect match result: ${isWrongMatch}`);
  if (isMatch && !isWrongMatch) {
    console.log('   ✅ Password utility test passed.\n');
  } else {
    throw new Error('❌ Password utility test failed!');
  }

  // 3. JWT utility test
  console.log('3️⃣ JWT Token Generation & Verification Test:');
  const payload = { userId: 'user-uuid-12345', role: ROLES.SUPER_ADMIN };
  const token = generateToken(payload);
  console.log(`   - Generated Token: ${token.substring(0, 30)}...`);
  const decoded = verifyToken(token);
  console.log(`   - Decoded Payload:`, decoded);
  if (decoded.userId === payload.userId && decoded.role === payload.role) {
    console.log('   ✅ JWT utility test passed.\n');
  } else {
    throw new Error('❌ JWT utility test failed!');
  }

  // 4. Pagination utility test
  console.log('4️⃣ Pagination Utility Test:');
  const pagination = parsePagination({ page: '2', limit: '15' });
  console.log(`   - Parsed Pagination:`, pagination);
  if (pagination.page === 2 && pagination.limit === 15 && pagination.skip === 15) {
    console.log('   ✅ Pagination utility test passed.\n');
  } else {
    throw new Error('❌ Pagination utility test failed!');
  }

  console.log('🎉 All foundation component tests completed successfully!');
};

runTests().catch((err) => {
  console.error('💥 Test suite failed:', err);
  process.exit(1);
});
