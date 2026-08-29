const app = require('./src/app');
const http = require('http');

const PORT = 5050;

const runHttpTests = async () => {
  console.log('🌐 Testing Express HTTP Endpoints on port', PORT, '...\n');

  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(PORT, resolve));

  try {
    // 1. Health check test
    console.log('1️⃣ Testing GET /api/v1/health:');
    const healthRes = await fetch(`http://localhost:${PORT}/api/v1/health`);
    const healthData = await healthRes.json();
    console.log('   Status Code:', healthRes.status);
    console.log('   Response Body:', healthData);
    if (
      healthRes.status === 200 &&
      healthData.success === true &&
      healthData.status === 'UP' &&
      healthData.message === 'Mobile-Adda backend is running'
    ) {
      console.log('   ✅ Health endpoint test passed.\n');
    } else {
      throw new Error('❌ Health endpoint test failed!');
    }

    // 2. Swagger JSON Spec test
    console.log('2️⃣ Testing GET /api/docs.json:');
    const swaggerRes = await fetch(`http://localhost:${PORT}/api/docs.json`);
    const swaggerData = await swaggerRes.json();
    console.log('   Status Code:', swaggerRes.status);
    console.log('   Swagger Title:', swaggerData.info?.title);
    if (swaggerRes.status === 200 && swaggerData.info?.title === 'Mobile-Adda Backend API') {
      console.log('   ✅ Swagger docs test passed.\n');
    } else {
      throw new Error('❌ Swagger docs test failed!');
    }

    // 3. 404 Route Not Found test
    console.log('3️⃣ Testing GET /api/v1/nonexistent-route (404 Handler):');
    const notFoundRes = await fetch(`http://localhost:${PORT}/api/v1/nonexistent-route`);
    const notFoundData = await notFoundRes.json();
    console.log('   Status Code:', notFoundRes.status);
    console.log('   Response Body:', notFoundData);
    if (notFoundRes.status === 404 && notFoundData.success === false && notFoundData.errorCode === 'RESOURCE_NOT_FOUND') {
      console.log('   ✅ 404 Error handler test passed.\n');
    } else {
      throw new Error('❌ 404 Error handler test failed!');
    }

    console.log('🎉 All HTTP Server integration tests completed successfully!');
  } finally {
    server.close();
  }
};

runHttpTests().catch((err) => {
  console.error('💥 HTTP test failed:', err);
  process.exit(1);
});
